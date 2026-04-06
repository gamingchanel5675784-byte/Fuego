import React from 'react';
import { File, Folder, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { FileNode } from '../types';
import { cn } from '../lib/utils';

interface FileExplorerProps {
  files: FileNode[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, selectedFileId, onSelectFile, onDeleteFile }) => {
  // Simple tree builder
  const buildTree = (nodes: FileNode[]) => {
    const root: any = {};
    nodes.forEach(node => {
      const parts = node.path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = { ...node, isLeaf: true };
        } else {
          if (!current[part]) current[part] = { isLeaf: false, children: {} };
          current = current[part].children;
        }
      });
    });
    return root;
  };

  const tree = buildTree(files);

  const renderTree = (obj: any, depth = 0) => {
    return Object.entries(obj).map(([name, node]: [string, any]) => {
      if (node.isLeaf) {
        return (
          <div
            key={node.id}
            onClick={() => onSelectFile(node.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm transition-colors group",
              selectedFileId === node.id ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            <File size={14} className="shrink-0" />
            <span className="truncate flex-1">{name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteFile(node.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
      return (
        <div key={name}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer"
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            <ChevronDown size={14} className="shrink-0 text-slate-500" />
            <Folder size={14} className="shrink-0 text-indigo-400" />
            <span className="truncate">{name}</span>
          </div>
          {renderTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Files</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
        {renderTree(tree)}
        {files.length === 0 && (
          <div className="p-4 text-center text-slate-500 text-xs italic">
            No files yet. Ask the AI to create something!
          </div>
        )}
      </div>
    </div>
  );
};
