import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { FileExplorer } from './components/FileExplorer';
import { Preview } from './components/Preview';
import { GitPanel } from './components/GitPanel';
import { Project, FileNode, ChatMessage, AIAction } from './types';
import { generateCode } from './lib/gemini';
import { Loader2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sparkles } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import confetti from 'canvas-confetti';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isFilesVisible, setIsFilesVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  const [activeTab, setActiveTab] = useState<'code' | 'git'>('code');

  // Connection test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Load Projects
  useEffect(() => {
    if (!user) return;
    const path = 'projects';
    const q = query(collection(db, path), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
      
      if (projs.length > 0 && !currentProject) {
        setCurrentProject(projs[0]);
      } else if (projs.length === 0 && !loading) {
        // Create initial project if none exist
        addDoc(collection(db, path), {
          name: 'My First Project',
          userId: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, path));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, path));

    return unsubscribe;
  }, [user, loading]);

  // Load Files and Messages for current project
  useEffect(() => {
    if (!currentProject) return;

    const filesPath = 'files';
    const filesQ = query(collection(db, filesPath), where('projectId', '==', currentProject.id));
    const unsubFiles = onSnapshot(filesQ, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileNode)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, filesPath));

    const messagesPath = 'messages';
    const messagesQ = query(collection(db, messagesPath), where('projectId', '==', currentProject.id), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(messagesQ, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, messagesPath));

    return () => {
      unsubFiles();
      unsubMessages();
    };
  }, [currentProject]);

  const handleSendMessage = async (content: string, attachments?: string[]) => {
    if (!currentProject || !user) return;

    const msgPath = 'messages';
    try {
      await addDoc(collection(db, msgPath), {
        projectId: currentProject.id,
        role: 'user',
        content: content + (attachments?.length ? `\n\nAttachments: ${attachments.join(', ')}` : ''),
        createdAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, msgPath);
    }

    setIsAIThinking(true);

    try {
      const fileContext = files.map(f => `File: ${f.path}\nContent:\n${f.content}\n---`).join('\n');
      const aiResponse = await generateCode(content, fileContext);

      await addDoc(collection(db, msgPath), {
        projectId: currentProject.id,
        role: 'assistant',
        content: aiResponse.message,
        createdAt: Date.now()
      });

      const filesPath = 'files';
      for (const action of aiResponse.actions) {
        try {
          if (action.type === 'create_file' || action.type === 'update_file') {
            const existingFile = files.find(f => f.path === action.path);
            if (existingFile) {
              await updateDoc(doc(db, filesPath, existingFile.id), {
                content: action.content,
                updatedAt: Date.now()
              });
            } else {
              await addDoc(collection(db, filesPath), {
                projectId: currentProject.id,
                path: action.path,
                content: action.content,
                type: 'file',
                updatedAt: Date.now()
              });
            }
          } else if (action.type === 'delete_file') {
            const existingFile = files.find(f => f.path === action.path);
            if (existingFile) {
              await deleteDoc(doc(db, filesPath, existingFile.id));
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, filesPath);
        }
      }
      
      if (aiResponse.actions.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
      }
    } catch (error) {
      console.error("Error in AI generation", error);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    const path = 'files';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleCreateProject = async () => {
    if (!user) return;
    const name = prompt('Project Name:', 'New Project');
    if (name) {
      const path = 'projects';
      try {
        await addDoc(collection(db, path), {
          name,
          userId: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={32} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout 
      user={user} 
      projects={projects} 
      currentProject={currentProject} 
      onSelectProject={setCurrentProject}
      onCreateProject={handleCreateProject}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="flex-1 flex overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {isChatVisible && (
            <>
              <Panel defaultSize={25} minSize={20}>
                <Chat 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isAIThinking} 
                />
              </Panel>
              <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />
            </>
          )}
          
          {activeTab === 'code' ? (
            isFilesVisible && (
              <>
                <Panel defaultSize={20} minSize={15}>
                  <FileExplorer 
                    files={files} 
                    selectedFileId={selectedFileId}
                    onSelectFile={setSelectedFileId}
                    onDeleteFile={handleDeleteFile}
                  />
                </Panel>
                <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />
              </>
            )
          ) : (
            <>
              <Panel defaultSize={20} minSize={15}>
                <GitPanel />
              </Panel>
              <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />
            </>
          )}

          <Panel minSize={30}>
            <div className="h-full flex flex-col relative">
              {/* Toggle Controls */}
              <div className="absolute top-4 left-4 z-50 flex gap-2">
                <button 
                  onClick={() => setIsChatVisible(!isChatVisible)}
                  className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shadow-xl"
                  title={isChatVisible ? "Hide Chat" : "Show Chat"}
                >
                  {isChatVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
                <button 
                  onClick={() => setIsFilesVisible(!isFilesVisible)}
                  className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shadow-xl"
                  title={isFilesVisible ? "Hide Files" : "Show Files"}
                >
                  {isFilesVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
              </div>

              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                  className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shadow-xl"
                  title={isPreviewVisible ? "Hide Preview" : "Show Preview"}
                >
                  {isPreviewVisible ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                </button>
              </div>

              {isPreviewVisible ? (
                <Preview files={files} />
              ) : (
                <div className="flex-1 bg-slate-950 flex items-center justify-center text-slate-600 italic">
                  Preview is hidden. Click the button in the top right to show it.
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </Layout>
  );
}
