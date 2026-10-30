import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AngleMode, CalculationRecord, CalculationResult, KeypadMode } from '../types';
import { Copy, Check, Delete, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

interface CalculatorProps {
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  onCalculationSuccess: (record: CalculationRecord, fullResult: CalculationResult) => void;
  initialExpression?: string;
}

export const Calculator: React.FC<CalculatorProps> = ({
  angleMode,
  onToggleAngleMode,
  onCalculationSuccess,
  initialExpression,
}) => {
  const [expression, setExpression] = useState('');
  const [displayResult, setDisplayResult] = useState<string>('0');
  const [lastEvaluatedExpression, setLastEvaluatedExpression] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keypadMode, setKeypadMode] = useState<KeypadMode>('scientific');
  const [isSecondFunction, setIsSecondFunction] = useState(false);
  const [memory, setMemory] = useState<number | null>(null);
  const [lastCalculationMetadata, setLastCalculationMetadata] = useState<{
    timeMs?: number;
    astSummary?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial expression if selected from history
  useEffect(() => {
    if (initialExpression !== undefined) {
      setExpression(initialExpression);
      setErrorMsg(null);
    }
  }, [initialExpression]);

  // Evaluate mathematical expression using the Python backend API
  const handleCalculate = useCallback(async (exprToEval?: string) => {
    const targetExpr = (exprToEval ?? expression).trim();
    if (!targetExpr) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: targetExpr,
          angle_mode: angleMode,
        }),
      });

      const data: CalculationResult = await response.json();

      if (response.ok && data.status === 'success' && data.result !== undefined) {
        setDisplayResult(data.formatted || String(data.result));
        setLastEvaluatedExpression(targetExpr);
        setLastCalculationMetadata({
          timeMs: data.execution_time_ms,
          astSummary: data.ast_summary,
        });

        const newRecord: CalculationRecord = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          expression: targetExpr,
          result: data.result,
          formatted: data.formatted || String(data.result),
          angleMode,
          astSummary: data.ast_summary,
          executionTimeMs: data.execution_time_ms,
        };

        onCalculationSuccess(newRecord, data);
      } else {
        setErrorMsg(data.error || 'Calculation error in Python engine');
      }
    } catch (err: any) {
      setErrorMsg(`Failed to connect to Python calculation backend: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [expression, angleMode, onCalculationSuccess]);

  // Insert token into expression
  const handleInsert = useCallback((token: string) => {
    setErrorMsg(null);
    setExpression((prev) => {
      // If we just got a result and user starts with an operator, append to result
      if (lastEvaluatedExpression && !prev && ['+', '-', '×', '÷', '^', '%', 'mod'].includes(token)) {
        return displayResult + token;
      }
      return prev + token;
    });
  }, [lastEvaluatedExpression, displayResult]);

  // Backspace
  const handleBackspace = useCallback(() => {
    setErrorMsg(null);
    setExpression((prev) => {
      if (!prev) return '';
      // Check if ending with multi-character function like "sin(", "sqrt(", "log("
      const funcMatches = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'sqrt(', 'log(', 'ln(', 'fact(', 'mod '];
      for (const func of funcMatches) {
        if (prev.endsWith(func)) {
          return prev.slice(0, -func.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setExpression('');
    setDisplayResult('0');
    setLastEvaluatedExpression('');
    setErrorMsg(null);
    setLastCalculationMetadata(null);
  }, []);

  // Toggle positive/negative on current operand
  const handleToggleSign = useCallback(() => {
    setErrorMsg(null);
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, []);

  // Copy result to clipboard
  const handleCopyResult = () => {
    navigator.clipboard.writeText(displayResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Memory functions
  const handleMemoryClear = () => setMemory(null);
  const handleMemoryRecall = () => {
    if (memory !== null) {
      handleInsert(String(memory));
    }
  };
  const handleMemoryAdd = () => {
    const val = parseFloat(displayResult.replace(/,/g, ''));
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) + val);
    }
  };
  const handleMemorySubtract = () => {
    const val = parseFloat(displayResult.replace(/,/g, ''));
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) - val);
    }
  };
  const handleMemoryStore = () => {
    const val = parseFloat(displayResult.replace(/,/g, ''));
    if (!isNaN(val)) {
      setMemory(val);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in another input (e.g. search)
      if (
        document.activeElement &&
        document.activeElement.tagName === 'INPUT' &&
        document.activeElement !== inputRef.current
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInsert(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleInsert('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleInsert('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleInsert('-');
      } else if (e.key === '*' || e.key === 'x') {
        e.preventDefault();
        handleInsert('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInsert('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        handleInsert('%');
      } else if (e.key === '^') {
        e.preventDefault();
        handleInsert('^');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleInsert(e.key);
      } else if (e.key === '!') {
        e.preventDefault();
        handleInsert('!');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClearAll();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleInsert('sin(');
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleInsert('cos(');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleInsert('tan(');
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleInsert('log(');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleInsert('ln(');
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleInsert('√(');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleInsert('π');
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleInsert('e');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInsert, handleCalculate, handleBackspace, handleClearAll]);

  // Compute parenthesis balance
  const openParens = (expression.match(/\(/g) || []).length;
  const closedParens = (expression.match(/\)/g) || []).length;
  const unclosedParens = Math.max(0, openParens - closedParens);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Top Utility Bar */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        
        {/* Angle Mode Switch (DEG / RAD) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg">
          <button
            onClick={() => angleMode !== 'deg' && onToggleAngleMode()}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              angleMode === 'deg'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            DEG
          </button>
          <button
            onClick={() => angleMode !== 'rad' && onToggleAngleMode()}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              angleMode === 'rad'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            RAD
          </button>
        </div>

        {/* Keypad Layout Mode (Standard / Scientific) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg">
          <button
            onClick={() => setKeypadMode('standard')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              keypadMode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setKeypadMode('scientific')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              keypadMode === 'scientific'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Scientific
          </button>
        </div>

        {/* Python AST & Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-blue-500/80"></span>
          <span>Python 3 AST Engine</span>
        </div>
      </div>

      {/* Screen / Display Area */}
      <div className="p-6 bg-slate-50/60 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-end min-h-[160px] relative">
        
        {/* Meta / Parenthesis tracker */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
          <div className="flex items-center gap-2 font-mono">
            {unclosedParens > 0 && (
              <span className="text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-[10px]">
                {unclosedParens} unclosed &apos;)&apos;
              </span>
            )}
            {memory !== null && (
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                [M: {memory}]
              </span>
            )}
          </div>
          {lastCalculationMetadata?.timeMs !== undefined && (
            <span className="font-mono text-[10px] tabular-nums text-slate-400">
              Evaluated in {lastCalculationMetadata.timeMs}ms
            </span>
          )}
        </div>

        {/* Expression Input Line */}
        <div className="relative mb-2">
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => {
              setErrorMsg(null);
              setExpression(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCalculate();
              }
            }}
            placeholder="0"
            className="w-full bg-transparent font-mono text-xl sm:text-2xl text-slate-600 dark:text-slate-300 tracking-wide outline-none placeholder:text-slate-400 text-right selection:bg-blue-600 selection:text-white"
            aria-label="Mathematical expression"
          />
        </div>

        {/* Main Result Line */}
        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResult}
              title="Copy result to clipboard"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-baseline gap-2 justify-end overflow-x-auto max-w-full">
            <span className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums select-all">
              {displayResult}
            </span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-mono flex-1">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Memory Action Strip */}
      <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 w-full justify-between">
          <button
            onClick={handleMemoryClear}
            className="px-2.5 py-1 font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            MC
          </button>
          <button
            onClick={handleMemoryRecall}
            disabled={memory === null}
            className={`px-2.5 py-1 font-mono font-medium rounded transition-colors ${
              memory !== null
                ? 'text-purple-600 dark:text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold'
                : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            MR
          </button>
          <button
            onClick={handleMemoryAdd}
            className="px-2.5 py-1 font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            M+
          </button>
          <button
            onClick={handleMemorySubtract}
            className="px-2.5 py-1 font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            M-
          </button>
          <button
            onClick={handleMemoryStore}
            className="px-2.5 py-1 font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            MS
          </button>
          {keypadMode === 'scientific' && (
            <button
              onClick={() => setIsSecondFunction(!isSecondFunction)}
              className={`px-2.5 py-1 font-mono font-semibold rounded transition-colors ${
                isSecondFunction
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              2nd
            </button>
          )}
        </div>
      </div>

      {/* Button Matrix */}
      <div className="p-4 sm:p-5">
        {/* If Scientific mode, show upper math functions grid */}
        {keypadMode === 'scientific' && (
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleInsert(isSecondFunction ? 'asin(' : 'sin(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              {isSecondFunction ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(isSecondFunction ? 'acos(' : 'cos(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              {isSecondFunction ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(isSecondFunction ? 'atan(' : 'tan(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              {isSecondFunction ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              type="button"
              onClick={() => handleInsert('log(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              log₁₀
            </button>
            <button
              type="button"
              onClick={() => handleInsert('ln(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              ln
            </button>
            <button
              type="button"
              onClick={() => handleInsert('^2')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 hidden sm:block cursor-pointer select-none"
            >
              x²
            </button>

            {/* Row 2 scientific */}
            <button
              type="button"
              onClick={() => handleInsert('√(')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              √x
            </button>
            <button
              type="button"
              onClick={() => handleInsert('^')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              xʸ
            </button>
            <button
              type="button"
              onClick={() => handleInsert('!')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              n!
            </button>
            <button
              type="button"
              onClick={() => handleInsert('π')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              π
            </button>
            <button
              type="button"
              onClick={() => handleInsert('e')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer select-none"
            >
              e
            </button>
            <button
              type="button"
              onClick={() => handleInsert(' mod ')}
              className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 hidden sm:block cursor-pointer select-none"
            >
              mod
            </button>
          </div>
        )}

        {/* Primary Keypad Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Row 1: AC, Backspace, %, ÷ */}
          <button
            type="button"
            onClick={handleClearAll}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
            title="Backspace (Delete)"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('%')}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleInsert('÷')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            ÷
          </button>

          {/* Row 2: (, ), ±, × */}
          <button
            type="button"
            onClick={() => handleInsert('(')}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            (
          </button>
          <button
            type="button"
            onClick={() => handleInsert(')')}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            )
          </button>
          <button
            type="button"
            onClick={handleToggleSign}
            className="h-14 sm:h-16 rounded-xl text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => handleInsert('×')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            ×
          </button>

          {/* Row 3: 7, 8, 9, - */}
          <button
            type="button"
            onClick={() => handleInsert('7')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleInsert('8')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleInsert('9')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleInsert('-')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            -
          </button>

          {/* Row 4: 4, 5, 6, + */}
          <button
            type="button"
            onClick={() => handleInsert('4')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleInsert('5')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleInsert('6')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleInsert('+')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            +
          </button>

          {/* Row 5: 1, 2, 3, = (row-span-2) */}
          <button
            type="button"
            onClick={() => handleInsert('1')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleInsert('2')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleInsert('3')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            3
          </button>

          {/* Equals Button (=) spans rows 5 and 6 */}
          <button
            type="button"
            onClick={() => handleCalculate()}
            disabled={isLoading}
            className="row-span-2 h-full min-h-[7.25rem] rounded-xl text-2xl font-mono font-bold text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-md shadow-blue-500/30 border border-blue-500/40 active:scale-95 flex items-center justify-center transition-all disabled:opacity-60 cursor-pointer select-none"
            aria-label="Calculate result"
          >
            {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-white" /> : '='}
          </button>

          {/* Row 6: 0 (col-span-2), . */}
          <button
            type="button"
            onClick={() => handleInsert('0')}
            className="col-span-2 h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleInsert('.')}
            className="h-14 sm:h-16 rounded-xl text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            .
          </button>
        </div>
      </div>
      
    </div>
  );
};
