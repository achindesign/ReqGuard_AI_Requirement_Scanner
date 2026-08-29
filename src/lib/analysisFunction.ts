import { supabase } from '@/lib/supabase';

export type AnalysisFunctionAction =
  | { action: 'extract'; filePath: string; fileType: string }
  | { action: 'analyze'; documentId: string; requirements: Array<{ id: string; code: string; text: string }> }
  | { action: 'rewrite'; requirementId: string; originalText: string }
  | { action: 'acceptance-criteria'; requirementId: string; originalText: string };

export async function invokeAnalysisFunction(body: AnalysisFunctionAction): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke('analyze-document', { body });

  if (error) {
    throw new Error('The document analysis service is temporarily unavailable. Please try again.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('The analysis service returned an invalid response. Please try again.');
  }

  const result = data as Record<string, unknown>;
  if (typeof result.error === 'string') {
    throw new Error(result.error);
  }

  return result;
}
