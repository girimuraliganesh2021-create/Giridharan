import React, { useState } from 'react';
import { CalculationRecord } from '../types';
import { Trash2, Copy, Check, ArrowUpRight, Search, Download, X } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: CalculationRecord[];
  onSelectRecord: (record: CalculationRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.formatted.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `python_calculator_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Calculation History
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            ({records.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {records.length > 0 && (
            <button
              onClick={handleExportJSON}
              title="Export history as JSON"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      {records.length > 0 && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search past equations or results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-3">
              <ArrowUpRight className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No calculations yet</p>
            <p className="text-xs mt-1 text-slate-400 dark:text-slate-500 max-w-xs">
              Equations evaluated by the Python backend will automatically be recorded here.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No history matches &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 hover:border-blue-500/40 transition-all text-left"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                <span className="uppercase font-semibold tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                  {item.angleMode.toUpperCase()} MODE
                </span>
                <span className="tabular-nums">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Equation */}
              <button
                onClick={() => onSelectRecord(item)}
                className="w-full text-left font-mono text-xs text-slate-600 dark:text-slate-400 truncate hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                title="Click to load equation into calculator"
              >
                {item.expression}
              </button>

              {/* Result */}
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <button
                  onClick={() => onSelectRecord(item)}
                  className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums truncate text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Click to load into calculator"
                >
                  = {item.formatted}
                </button>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, String(item.result))}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Copy result"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Insert equation"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.astSummary && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                  AST: {item.astSummary}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Clear Action */}
      {records.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Clear all?</span>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-1.5 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-2 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear calculation history
            </button>
          )}
        </div>
      )}
    </div>
  );
};
