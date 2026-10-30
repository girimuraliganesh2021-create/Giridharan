export type AngleMode = 'deg' | 'rad';

export type KeypadMode = 'standard' | 'scientific';

export type Theme = 'dark' | 'light';

export interface CalculationResult {
  status: 'success' | 'error';
  result?: number;
  formatted?: string;
  expression: string;
  normalized_expression?: string;
  angle_mode: AngleMode;
  ast_summary?: string;
  type?: 'integer' | 'float' | 'scientific' | 'infinity' | 'nan';
  execution_time_ms?: number;
  operations_count?: number;
  error?: string;
}

export interface CalculationRecord {
  id: string;
  timestamp: number;
  expression: string;
  result: number | string;
  formatted: string;
  angleMode: AngleMode;
  astSummary?: string;
  executionTimeMs?: number;
}
