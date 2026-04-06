import React, { useState } from 'react';
import { GitBranch, GitCommit, GitPullRequest, GitMerge, History, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export const GitPanel: React.FC = () => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [history, setHistory] = useState([
    { id: '1', msg: 'Initial commit', date: '2 mins ago', hash: 'a1b2c3d' },
    { id: '2', msg: 'Add layout and styles', date: '10 mins ago', hash: 'e5f6g7h' }
  ]);

  const handleCommit = () => {
    if (!commitMsg.trim()) return;
    setIsCommitting(true);
    setTimeout(() => {
      setHistory([{
        id: Math.random().toString(),
        msg: commitMsg,
        date: 'Just now',
        hash: Math.random().toString(16).substring(2, 9)
      }, ...history]);
      setCommitMsg('');
      setIsCommitting(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.8, y: 0.8 }
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-72 shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Source Control</h2>
        </div>
        <div className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">main</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <textarea
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit message..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-20"
          />
          <button
            onClick={handleCommit}
            disabled={isCommitting || !commitMsg.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isCommitting ? <Loader2 size={14} className="animate-spin" /> : <GitCommit size={14} />}
            Commit to main
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors">
            <GitPullRequest size={12} /> Pull
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors">
            <GitMerge size={12} /> Push
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-slate-500">
            <History size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Commit History</span>
          </div>
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="group cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-500 mt-0.5" />
                    <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-indigo-400 transition-colors">{item.msg}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{item.hash}</span>
                </div>
                <p className="text-[10px] text-slate-600 ml-5 mt-0.5">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
