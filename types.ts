
export interface StartupMetric {
  subject: string;
  A: number;
  fullMark: number;
}

export interface ResearchSource {
  title: string;
  url: string;
  relevance: string;
}

export interface CompetitorDetail {
  name: string;
  stage: string;
  strategy: string;
  strengths: string[];
  weaknesses: string[];
}

export interface HistoricalTrend {
  year: string;
  successRate: number;
}

export interface EvaluationResult {
  summary: string;
  successRate: number;
  improvedSuccessRate?: number;
  metrics: StartupMetric[];
  competitors: CompetitorDetail[];
  historicalTrends: HistoricalTrend[];
  marketGaps: string[];
  strategicSuggestions: string[];
  technicalRequirements: string[];
  specialistHiringGuide: string[];
  deepMarketMap: {
    sectors: string[];
    riskHeatmap: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evaluation?: EvaluationResult;
  sources?: ResearchSource[];
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

export interface UserProfile {
  name: string;
  email: string;
  existingCompany?: {
    name: string;
    domain: string;
    stage: string;
  };
}
