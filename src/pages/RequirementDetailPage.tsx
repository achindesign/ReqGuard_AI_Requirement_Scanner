import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  ListChecks,
  AlertCircle,
  Info,
  Lightbulb,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, Button, ScoreRing, SeverityBadge, Spinner, EmptyState } from '@/components/ui';
import { getQualityRating } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { invokeAnalysisFunction } from '@/lib/analysisFunction';
import type { Requirement, Finding, Improvement } from '@/types';

export function RequirementDetailPage() {
  const { documentId, requirementId } = useParams<{ documentId: string; requirementId: string }>();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [improvement, setImprovement] = useState<Improvement | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewriting, setRewriting] = useState(false);
  const [generatingCriteria, setGeneratingCriteria] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requirementId) loadRequirement(requirementId);
  }, [requirementId]);

  const loadRequirement = async (id: string) => {
    setLoading(true);
    const { data: req } = await supabase
      .from('requirements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!req) {
      setLoading(false);
      return;
    }
    setRequirement(req as Requirement);

    const { data: findingsData } = await supabase
      .from('findings')
      .select('*')
      .eq('requirement_id', id)
      .order('severity', { ascending: false });
    setFindings((findingsData ?? []) as Finding[]);

    const { data: impData } = await supabase
      .from('improvements')
      .select('*')
      .eq('requirement_id', id)
      .maybeSingle();
    setImprovement(impData as Improvement | null);

    setLoading(false);
  };

  const handleRewrite = async () => {
    if (!requirement) return;
    setRewriting(true);
    setError(null);
    try {
      const data = await invokeAnalysisFunction({
        action: 'rewrite',
        requirementId: requirement.id,
        originalText: requirement.original_text,
      });
      if (data.success !== true) throw new Error('Failed to generate rewrite');

      await loadRequirement(requirement.id);
    } catch {
      setError('Unable to generate a rewrite at this time. Please try again.');
    }
    setRewriting(false);
  };

  const handleGenerateCriteria = async () => {
    if (!requirement) return;
    setGeneratingCriteria(true);
    setError(null);
    try {
      const data = await invokeAnalysisFunction({
        action: 'acceptance-criteria',
        requirementId: requirement.id,
        originalText: requirement.original_text,
      });
      if (data.success !== true) throw new Error('Failed to generate acceptance criteria');

      await loadRequirement(requirement.id);
    } catch {
      setError('Unable to generate acceptance criteria at this time. Please try again.');
    }
    setGeneratingCriteria(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!requirement) {
    return (
      <AppLayout>
        <EmptyState
          title="Requirement not found"
          description="This requirement may have been deleted or you don't have access."
          action={<Button onClick={() => navigate(`/analysis/${documentId}`)}>Back to Analysis</Button>}
        />
      </AppLayout>
    );
  }

  const scoreBars = [
    { label: 'Clarity', score: requirement.clarity_score, weight: '15%' },
    { label: 'Completeness', score: requirement.completeness_score, weight: '15%' },
    { label: 'Testability', score: requirement.testability_score, weight: '15%' },
    { label: 'Consistency', score: requirement.consistency_score, weight: '10%' },
    { label: 'Measurability', score: requirement.measurability_score, weight: '10%' },
  ];

  const missingInfo = findings.filter((f) => f.category === 'Missing Business Rules' || f.category === 'Exception Handling' || f.category === 'Acceptance Criteria');
  const recommendations = findings.filter((f) => f.recommendation);

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to={`/analysis/${documentId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16} />
          Back to Analysis
        </Link>
      </div>

      <PageHeader
        title={requirement.requirement_code}
        subtitle={`Type: ${requirement.requirement_type} · Priority: ${requirement.priority}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRewrite} disabled={rewriting}>
              {rewriting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Improve Requirement
            </Button>
            <Button onClick={handleGenerateCriteria} disabled={generatingCriteria}>
              {generatingCriteria ? <Loader2 size={18} className="animate-spin" /> : <ListChecks size={18} />}
              Generate Acceptance Criteria
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Original requirement + score */}
        <div className="space-y-6 lg:col-span-2">
          {/* Original requirement */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Original Requirement</h3>
            <p className="mt-3 text-base text-gray-900">{requirement.original_text}</p>
          </Card>

          {/* Findings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Findings</h3>
            {findings.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No issues detected for this requirement.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {findings.map((f) => (
                  <div key={f.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      <span className="text-xs text-gray-500">{f.category}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">{f.issue}</p>
                    <p className="mt-1 text-sm text-gray-600">{f.explanation}</p>
                    <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      <span className="font-medium">Recommendation: </span>{f.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Missing information */}
          {missingInfo.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Missing Information</h3>
              <div className="mt-4 space-y-2">
                {missingInfo.map((f) => (
                  <div key={f.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <Info size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <span>{f.issue}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
              <div className="mt-4 space-y-2">
                {recommendations.map((f, i) => (
                  <div key={f.id ?? i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <span>{f.recommendation}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggested rewrite */}
          {improvement?.rewritten_requirement && (
            <Card className="border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Suggested Rewrite</h3>
              </div>
              <p className="mt-3 text-base text-gray-900">{improvement.rewritten_requirement}</p>
              {improvement.assumptions && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assumptions</p>
                  <pre className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{improvement.assumptions}</pre>
                </div>
              )}
              {improvement.edge_cases && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Edge Cases</p>
                  <pre className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{improvement.edge_cases}</pre>
                </div>
              )}
            </Card>
          )}

          {/* Acceptance criteria */}
          {improvement?.acceptance_criteria && (
            <Card className="border-blue-200 bg-blue-50/50 p-6">
              <div className="flex items-center gap-2">
                <ListChecks size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Acceptance Criteria</h3>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{improvement.acceptance_criteria}</pre>
            </Card>
          )}
        </div>

        {/* Right: Score breakdown */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <ScoreRing score={requirement.overall_score} size={120} />
              <p className="mt-2 text-sm font-medium text-gray-600">{getQualityRating(requirement.overall_score)}</p>
            </div>
            <div className="mt-6 space-y-3">
              {scoreBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{bar.label} <span className="text-xs text-gray-400">({bar.weight})</span></span>
                    <span className="font-semibold text-gray-900">{bar.score}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        bar.score >= 70 ? 'bg-emerald-500' : bar.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${bar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw size={14} />
              <span>Use the buttons above to generate AI improvements</span>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
