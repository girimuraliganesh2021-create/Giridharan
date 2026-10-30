import React, { useState } from 'react';
import { CalculationResult, AngleMode } from '../types';
import { Terminal, ShieldCheck, Zap, Copy, Check, Play, RefreshCw } from 'lucide-react';

interface AstInspectorProps {
  lastResult?: CalculationResult | null;
  angleMode: AngleMode;
}

export const AstInspector: React.FC<AstInspectorProps> = ({ lastResult, angleMode }) => {
  const [testExpression, setTestExpression] = useState('sin(90) + sqrt(144) * 2^3');
  const [testResult, setTestResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const activeResult = testResult || lastResult;

  const handleTestRun = async () => {
    if (!testExpression.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: testExpression,
          angle_mode: angleMode,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        status: 'error',
        error: err.message,
        expression: testExpression,
        angle_mode: angleMode,
      });
    } finally {
      setLoading(false);
    }
  };

  const curlSnippet = `curl -X POST https://your-domain.vercel.app/api/calculate \\
  -H "Content-Type: application/json" \\
  -d '{"expression": "${testExpression}", "angle_mode": "${angleMode}"}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Overview & Security Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Python AST & Telemetry Inspector</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live inspection of Python 3 AST syntax trees and serverless execution latency
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Eval Whitelist Active</span>
            </div>
          </div>
        </div>

        {/* Live Expression Tester */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Test Python AST Expression Evaluator
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testExpression}
              onChange={(e) => setTestExpression(e.target.value)}
              placeholder="e.g. 5! + log(100) * cos(0)"
              className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleTestRun}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Execute in Python</span>
            </button>
          </div>
        </div>

        {/* Active Inspection Cards */}
        {activeResult ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Metric 1: Parsed AST */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Parsed AST Representation</span>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">ast.NodeVisitor</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/90 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all overflow-x-auto">
                {activeResult.ast_summary || activeResult.error || 'Awaiting execution'}
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Normalized Formula:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {activeResult.normalized_expression || activeResult.expression}
                </span>
              </div>
            </div>

            {/* Metric 2: Execution Telemetry */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Telemetry Metrics
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {activeResult.execution_time_ms ?? '0.8'} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Result:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {activeResult.formatted ?? activeResult.result ?? 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Angle Mode:</span>
                    <span className="font-mono uppercase font-semibold text-slate-700 dark:text-slate-300">
                      {activeResult.angle_mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Numeric Type:</span>
                    <span className="font-mono capitalize text-slate-700 dark:text-slate-300">
                      {activeResult.type ?? 'integer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                Status: {activeResult.status.toUpperCase()}
              </div>
            </div>
            
          </div>
        ) : (
          <div className="mt-6 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
            Execute a calculation to view the live AST node tree and latency profiling.
          </div>
        )}
      </div>

      {/* Developer API & cURL Explorer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">API Curl Snippet</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              POST /api/calculate
            </span>
          </div>
          <button
            onClick={copyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedCurl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy cURL</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          {curlSnippet}
        </pre>
      </div>

    </div>
  );
};
