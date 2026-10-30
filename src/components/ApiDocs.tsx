import React from 'react';
import { Code2, Server, ShieldCheck, CheckCircle2, CloudUpload } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Vercel Architecture Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vercel Python Serverless Architecture</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean full-stack deployment architecture compliant with Vercel serverless function guidelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <Server className="w-4 h-4 text-blue-500" />
              <span>Python 3 Runtime</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured via <code className="font-mono text-blue-600 dark:text-blue-400">requirements.txt</code> with Flask and native AST evaluation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <Code2 className="w-4 h-4 text-purple-500" />
              <span>API Gateway Route</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <code className="font-mono text-purple-600 dark:text-purple-400">api/index.py</code> handles incoming JSON via WSGI serverless execution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Eval Security</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AST node whitelist strictly prohibits <code className="font-mono text-emerald-600 dark:text-emerald-400">eval()</code>, exec, and system calls.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Reference */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">API Reference</h3>

        {/* POST /api/calculate */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-600 text-white">
              POST
            </span>
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              /api/calculate
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Evaluates a mathematical expression string using the safe Python AST engine.
          </p>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Request Body</span>
              <pre className="mt-1 p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
{`{
  "expression": "sin(90) + sqrt(144) * 2^3",
  "angle_mode": "deg" // "deg" or "rad"
}`}
              </pre>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Response (200 OK)</span>
              <pre className="mt-1 p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
{`{
  "status": "success",
  "result": 97,
  "formatted": "97",
  "expression": "sin(90) + sqrt(144) * 2^3",
  "normalized_expression": "sin(90) + sqrt(144) * 2**3",
  "angle_mode": "deg",
  "ast_summary": "Add(sin(90), Mult(sqrt(144), Pow(2, 3)))",
  "type": "integer",
  "execution_time_ms": 1.25,
  "operations_count": 8
}`}
              </pre>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Error Response (400 Bad Request)</span>
              <pre className="mt-1 p-3 rounded-lg bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto">
{`{
  "status": "error",
  "error": "Division by zero",
  "expression": "42 / (10 - 10)",
  "angle_mode": "deg",
  "execution_time_ms": 0.6
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Supported Function Catalog */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Supported Mathematical Tokens
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Arithmetic</span>
              <code className="text-slate-500 font-mono">+ - * / // % ^ **</code>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trigonometry</span>
              <code className="text-slate-500 font-mono">sin cos tan asin acos atan</code>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Logs & Powers</span>
              <code className="text-slate-500 font-mono">log ln log2 exp sqrt cbrt</code>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Constants & Misc</span>
              <code className="text-slate-500 font-mono">pi (π) e tau n! abs</code>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
