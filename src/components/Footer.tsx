import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Python Calculator Pro</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Python 3 AST & Vercel Serverless</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Safe Math AST Whitelist</span>
          <span aria-hidden="true">·</span>
          <span>Full Vercel Runtime</span>
          <span aria-hidden="true">·</span>
          <span>© 2026</span>
        </div>

      </div>
    </footer>
  );
};
