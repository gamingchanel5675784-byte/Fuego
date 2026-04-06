import React, { useState } from 'react';
import { Sparkles, Play, Maximize2, RefreshCw, ExternalLink, Monitor, Smartphone, Tablet, Code } from 'lucide-react';
import { FileNode } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PreviewProps {
  files: FileNode[];
}

export const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const appFile = files.find(f => f.path === 'src/App.tsx' || f.path === 'App.tsx');

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Browser Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          
          <div className="flex-1 max-w-md bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-500 flex items-center gap-2 font-mono">
            <span className="opacity-50">https://</span>
            <span className="text-slate-300">vibecode-preview.local</span>
            <RefreshCw size={10} className="ml-auto cursor-pointer hover:text-slate-200 transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setViewMode('preview')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                viewMode === 'preview' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Preview
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                viewMode === 'code' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Code
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1">
            <button onClick={() => setDevice('desktop')} className={cn("p-1.5 rounded transition-colors", device === 'desktop' ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300")}>
              <Monitor size={14} />
            </button>
            <button onClick={() => setDevice('tablet')} className={cn("p-1.5 rounded transition-colors", device === 'tablet' ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300")}>
              <Tablet size={14} />
            </button>
            <button onClick={() => setDevice('mobile')} className={cn("p-1.5 rounded transition-colors", device === 'mobile' ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300")}>
              <Smartphone size={14} />
            </button>
          </div>

          <button className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
      
      {/* Viewport Area */}
      <div className="flex-1 relative overflow-auto bg-slate-950 p-6 flex justify-center items-start scrollbar-thin scrollbar-thumb-slate-800">
        <motion.div 
          layout
          className={cn(
            "bg-white shadow-2xl transition-all duration-500 overflow-hidden relative",
            device === 'desktop' ? "w-full min-h-full rounded-xl" : 
            device === 'tablet' ? "w-[768px] h-[1024px] rounded-3xl border-[12px] border-slate-900" : 
            "w-[375px] h-[812px] rounded-[3rem] border-[12px] border-slate-900 shadow-[0_0_0_2px_rgba(255,255,255,0.05)]"
          )}
        >
          {viewMode === 'preview' ? (
            appFile ? (
              <div className="h-full overflow-auto bg-white text-slate-900 p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
                      <Sparkles className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">Live Preview Active</h1>
                      <p className="text-slate-600 text-sm mt-2">Your application is being rendered in real-time. Changes will appear here instantly.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Code size={18} className="text-indigo-600" />
                        Source Analysis
                      </h2>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">src/App.tsx</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                      <pre className="text-slate-700">{appFile.content}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 bg-slate-50">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center border border-slate-200 shadow-xl"
                >
                  <Play size={40} className="text-indigo-500 ml-1" />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold text-slate-800">Ready to Build</p>
                  <p className="text-sm text-slate-500 max-w-[200px]">Describe your application to the Master AI to see it come to life.</p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full bg-slate-900 text-slate-300 p-6 font-mono text-sm overflow-auto">
              <pre>{appFile?.content || '// No code generated yet'}</pre>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
