import React from 'react';
import { LayoutGrid, Settings, LogOut, Github, Sparkles, Plus, FolderKanban, GitBranch } from 'lucide-react';
import { User } from 'firebase/auth';
import { signOut } from '../firebase';
import { Project } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  activeTab: 'code' | 'git';
  onTabChange: (tab: 'code' | 'git') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, projects, currentProject, onSelectProject, onCreateProject, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white" size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => onTabChange('code')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              activeTab === 'code' ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutGrid size={24} />
          </button>
          <button 
            onClick={() => onTabChange('git')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              activeTab === 'git' ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <GitBranch size={24} />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <Github size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <Settings size={24} />
          </button>
          {user && (
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg tracking-tight">VibeCode <span className="text-indigo-500">AI</span></h1>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <FolderKanban size={16} className="text-slate-500" />
              <select 
                value={currentProject?.id || ''} 
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === e.target.value);
                  if (p) onSelectProject(p);
                }}
                className="bg-transparent text-sm font-medium text-slate-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                ))}
              </select>
              <button 
                onClick={onCreateProject}
                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-indigo-400 transition-all"
                title="New Project"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-200">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
            )}
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
