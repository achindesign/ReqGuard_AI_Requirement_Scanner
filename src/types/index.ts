export type Plan = 'free' | 'pro' | 'professional';
export type DocumentType = 'BRD' | 'PRD' | 'User Stories' | 'Functional Requirements' | 'Other';
export type DocumentStatus = 'pending' | 'extracting' | 'analyzing' | 'completed' | 'failed';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan: Plan;
  monthly_analysis_limit: number;
  analyses_used: number;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_url: string | null;
  document_type: string;
  status: DocumentStatus;
  overall_score: number | null;
  created_at: string;
}

export interface Requirement {
  id: string;
  document_id: string;
  requirement_code: string;
  original_text: string;
  requirement_type: string;
  priority: string;
  clarity_score: number;
  completeness_score: number;
  testability_score: number;
  consistency_score: number;
  measurability_score: number;
  overall_score: number;
}

export interface Finding {
  id: string;
  requirement_id: string;
  category: string;
  severity: Severity;
  issue: string;
  explanation: string;
  recommendation: string;
  created_at: string;
}

export interface Improvement {
  id: string;
  requirement_id: string;
  rewritten_requirement: string;
  acceptance_criteria: string;
  assumptions: string;
  edge_cases: string;
  created_at: string;
}

export interface AnalysisUsage {
  id: string;
  user_id: string;
  document_id: string | null;
  requirements_count: number;
  tokens_used: number;
  analysis_date: string;
}

export interface Payment {
  id: string;
  user_id: string;
  provider: string;
  customer_id: string;
  subscription_id: string;
  plan: Plan;
  status: string;
  created_at: string;
}

export interface RequirementWithFindings extends Requirement {
  findings?: Finding[];
  improvements?: Improvement[];
}

export interface DocumentWithRequirements extends Document {
  requirements?: RequirementWithFindings[];
}

export const SCORE_WEIGHTS = {
  clarity: 0.15,
  completeness: 0.15,
  testability: 0.15,
  consistency: 0.10,
  measurability: 0.10,
  business_rules: 0.15,
  exception_handling: 0.10,
  acceptance_criteria: 0.10,
} as const;

export const PLAN_LIMITS: Record<Plan, { analyses: number; requirements: number; label: string }> = {
  free: { analyses: 2, requirements: 10, label: 'Free' },
  pro: { analyses: 50, requirements: 1000, label: 'Pro' },
  professional: { analyses: 999999, requirements: 999999, label: 'Professional' },
};

export const PLAN_PRICES: Record<Plan, { monthly: number; description: string }> = {
  free: { monthly: 0, description: '2 analyses/month · 10 requirements · Basic findings' },
  pro: { monthly: 9, description: '50 analyses/month · 1,000 requirements · Full analysis + AI rewriting + PDF export' },
  professional: { monthly: 19, description: 'Unlimited reasonable usage · Bulk analysis · Advanced contradiction detection' },
};
