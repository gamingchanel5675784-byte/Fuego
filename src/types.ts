export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileNode {
  id: string;
  projectId: string;
  path: string; // e.g., "src/App.tsx"
  content: string;
  type: 'file' | 'directory';
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface AIAction {
  type: 'create_file' | 'update_file' | 'delete_file' | 'create_directory' | 'delete_directory';
  path: string;
  content?: string;
}
