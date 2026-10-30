import React from 'react';
import { X, ShieldCheck, Cpu, Cloud, CheckCircle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              Py
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Python Calculator Pro</h3>
              <p className="text-xs text-slate-500">Enterprise mathematical engine & Vercel serverless integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300">
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              100% Python AST Calculation Engine
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Unlike web calculators that rely on client-side JavaScript or insecure JavaScript <code className="font-mono text-blue-600 dark:text-blue-400">eval()</code>, Python Calculator Pro passes all mathematical expressions to a dedicated Python backend. The backend constructs a syntax tree using Python&apos;s native <code className="font-mono text-blue-600 dark:text-blue-400">ast</code> module and walks it through an explicitly audited <code className="font-mono text-blue-600 dark:text-blue-400">SafeMathEvaluator</code>.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Zero-Risk Security Guarantees
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No eval() or exec():</strong> Code injection, dunder access, and system calls are mathematically impossible.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>AST Node Whitelist:</strong> Only BinaryOps, UnaryOps, explicit Constants, and vetted math functions are evaluated.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Resource Protection:</strong> Exponent sizes and factorial bounds are throttled to prevent CPU exhaustion.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-purple-500" />
              Production Vercel Ready
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Configured with <code className="font-mono text-purple-600 dark:text-purple-400">api/index.py</code>, <code className="font-mono text-purple-600 dark:text-purple-400">requirements.txt</code>, and <code className="font-mono text-purple-600 dark:text-purple-400">vercel.json</code>. You can connect this repository to GitHub and deploy straight to Vercel with zero extra server configuration required.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
