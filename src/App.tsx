import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AstInspector } from './components/AstInspector';
import { ApiDocs } from './components/ApiDocs';
import { AboutModal } from './components/AboutModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Footer } from './components/Footer';
import { AngleMode, CalculationRecord, CalculationResult, Theme } from './types';

export default function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('py_calc_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Angle mode state (deg / rad)
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    const saved = localStorage.getItem('py_calc_angle_mode');
    return (saved === 'rad') ? 'rad' : 'deg';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'ast' | 'api'>('calculator');

  // Calculation history with localStorage persistence
  const [history, setHistory] = useState<CalculationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('py_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last evaluated calculation result for AST inspector
  const [lastCalculationResult, setLastCalculationResult] = useState<CalculationResult | null>(null);

  // Expression loaded from history selection
  const [loadedExpression, setLoadedExpression] = useState<string | undefined>(undefined);

  // Drawers and modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('py_calc_theme', theme);
  }, [theme]);

  // Persist angle mode
  useEffect(() => {
    localStorage.setItem('py_calc_angle_mode', angleMode);
  }, [angleMode]);

  // Persist history changes
  useEffect(() => {
    try {
      localStorage.setItem('py_calc_history', JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to persist history to localStorage', err);
    }
  }, [history]);

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle angle mode
  const handleToggleAngleMode = () => {
    setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'));
  };

  // Record a successful calculation
  const handleCalculationSuccess = (record: CalculationRecord, fullResult: CalculationResult) => {
    setHistory((prev) => [record, ...prev.slice(0, 99)]); // Store up to 100 history items
    setLastCalculationResult(fullResult);
  };

  // Select item from history
  const handleSelectHistoryRecord = (record: CalculationRecord) => {
    setLoadedExpression(record.expression);
    setActiveTab('calculator');
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('py_calc_history');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        historyCount={history.length}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Python Calculator Pro
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Precision scientific computing powered by Python 3 AST safe evaluation & Vercel serverless runtime.
              </p>
            </div>

            <Calculator
              angleMode={angleMode}
              onToggleAngleMode={handleToggleAngleMode}
              onCalculationSuccess={handleCalculationSuccess}
              initialExpression={loadedExpression}
            />
          </div>
        )}

        {activeTab === 'ast' && (
          <AstInspector
            lastResult={lastCalculationResult}
            angleMode={angleMode}
          />
        )}

        {activeTab === 'api' && (
          <ApiDocs />
        )}

      </main>

      {/* Side History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={handleSelectHistoryRecord}
        onClearHistory={handleClearHistory}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* About & Architecture Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
