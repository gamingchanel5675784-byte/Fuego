import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Paperclip, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments?: string[]) => void;
  isLoading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input, attachments);
      setInput('');
      setAttachments([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For demo, we just add the names. In real app, upload to Storage
      const newAttachments = Array.from(files).map(f => f.name);
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 w-full shrink-0 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[100px] rounded-full" />
      </div>

      <div className="p-4 border-b border-slate-800 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200 tracking-tight">Master AI Agent</h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 relative z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-[95%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                msg.role === 'user' ? "bg-indigo-600" : "bg-slate-800 border border-slate-700"
              )}>
                {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-indigo-400" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-xl",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-800/80 backdrop-blur-sm text-slate-200 rounded-tl-none border border-slate-700"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mr-auto max-w-[90%]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
              <Bot size={18} className="text-indigo-400" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm text-slate-200 rounded-tl-none border border-slate-700 flex items-center gap-3 shadow-xl">
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
              <span className="text-xs font-medium text-slate-400 italic">Master AI is architecting...</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl relative z-10">
        <form onSubmit={handleSubmit} className="space-y-3">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {attachments.map((name, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-[10px] text-slate-300">
                  <Paperclip size={10} />
                  <span className="truncate max-w-[100px]">{name}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-slate-500 hover:text-red-400">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message Master AI..."
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 text-sm rounded-2xl px-4 py-4 pr-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none min-h-[56px] max-h-48 shadow-inner"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              multiple 
            />
          </div>
          <p className="text-[10px] text-center text-slate-600 font-medium">
            Master AI can make mistakes. Verify important code.
          </p>
        </form>
      </div>
    </div>
  );
};
