import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 – 9', desc: 'Enter numbers' },
    { key: '+  -  *  /', desc: 'Basic arithmetic operators' },
    { key: 'Enter / =', desc: 'Calculate expression in Python' },
    { key: 'Backspace', desc: 'Delete previous character or function' },
    { key: 'Escape', desc: 'Clear entire equation (AC)' },
    { key: '(', desc: 'Open parenthesis' },
    { key: ')', desc: 'Close parenthesis' },
    { key: '^', desc: 'Power / Exponentiation' },
    { key: '%', desc: 'Percentage / Modulus' },
    { key: '!', desc: 'Factorial postfix' },
    { key: 's', desc: 'Insert sin(' },
    { key: 'c', desc: 'Insert cos(' },
    { key: 't', desc: 'Insert tan(' },
    { key: 'l', desc: 'Insert log₁₀(' },
    { key: 'n', desc: 'Insert natural logarithm ln(' },
    { key: 'r', desc: 'Insert square root √(' },
    { key: 'p', desc: 'Insert constant π (pi)' },
    { key: 'e', desc: 'Insert constant e' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500">Fast keyboard input reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 text-xs"
              >
                <span className="text-slate-600 dark:text-slate-400">{s.desc}</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
