import React from 'react';
import { Sparkles, LogIn } from 'lucide-react';
import { signIn } from '../firebase';

export const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VibeCode AI</h1>
          <p className="text-slate-400 text-sm">Professional AI-powered coding environment. Build anything with just a vibe.</p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => signIn()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Secure Access</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
          
          <p className="text-center text-[10px] text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
