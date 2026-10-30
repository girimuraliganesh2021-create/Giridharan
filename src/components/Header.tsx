import React from 'react';
import { Sun, Moon, Terminal, History, Keyboard, Info, Code2 } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  activeTab: 'calculator' | 'ast' | 'api';
  onChangeTab: (tab: 'calculator' | 'ast' | 'api') => void;
  historyCount: number;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeTab,
  onChangeTab,
  historyCount,
  isHistoryOpen,
  onToggleHistory,
  onOpenShortcuts,
  onOpenAbout,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-sm shadow-blue-500/20 text-white font-bold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M4 7c0-1.657 1.343-3 3-3h10c1.657 0 3 1.343 3 3v10c0 1.657-1.343 3-3 3H7c-1.657 0-3-1.343-3-3V7z" />
              <path d="M8 8h2" />
              <path d="M14 8h2" />
              <path d="M8 12h8" />
              <path d="M8 16h4" />
              <path d="M15 15l2 2m0-2l-2 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Python Calculator <span className="text-blue-600 dark:text-blue-400">Pro</span>
            </a>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented View Controls */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onChangeTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => onChangeTab('ast')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ast'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AST Inspector</span>
            <span className="sm:hidden">AST</span>
          </button>
          <button
            onClick={() => onChangeTab('api')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API & Vercel</span>
            <span className="sm:hidden">API</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Utility Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* History Drawer Toggle Button */}
          <button
            onClick={onToggleHistory}
            className={`relative p-2 rounded-lg border transition-colors ${
              isHistoryOpen
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle calculation history (H)"
            aria-label="Toggle calculation history"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Keyboard Shortcuts Dialog */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* About / Architecture Dialog */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="About Python Calculator Pro architecture"
            aria-label="About Python Calculator Pro"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
