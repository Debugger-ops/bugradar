export type Severity = 'critical' | 'warning' | 'info';
export type AnalysisMode = 'static' | 'ai';

export interface Bug {
  id: string;
  line: number;
  severity: Severity;
  type: string;
  title: string;
  description: string;
  codeSnippet?: string;
  fix: {
    explanation: string;
    code?: string;
  };
}

export interface AIInsights {
  overallAssessment: string;
  architecturalNotes?: string;
  securitySummary?: string;
  performanceSummary?: string;
  topPriorities?: string[];
}

export interface AnalysisResult {
  language: string;
  totalBugs: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  score: number;
  bugs: Bug[];
  summary: string;
  analysisMode?: AnalysisMode;
  aiInsights?: AIInsights;
}

export interface AnalyzeRequest {
  code: string;
  language: string;
}

export interface AnalyzeResponse {
  result?: AnalysisResult;
  error?: string;
}

export interface FixRequest {
  code: string;
  language: string;
  bugs: Bug[];
}

export interface FixResponse {
  fixedCode?: string;
  changes?: string[];
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  code: string;
  language: string;
  messages: ChatMessage[];
  analysisResult?: AnalysisResult;
}

export interface ChatResponse {
  message?: string;
  error?: string;
}
