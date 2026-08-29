import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, Button, ScoreRing, ScoreBadge, SeverityBadge, StatusBadge, Spinner, EmptyState } from '@/components/ui';
import { getQualityRating } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { Document, Requirement, Finding } from '@/types';

type Tab = 'overview' | 'requirements' | 'critical' | 'ambiguity' | 'missing' | 'contradictions' | 'recommendations';

interface RequirementWithFindings extends Requirement {
  findings: Finding[];
}

export function AnalysisResultsPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [requirements, setRequirements] = useState<RequirementWithFindings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (documentId) loadAnalysis(documentId);
  }, [documentId]);

  const loadAnalysis = async (id: string) => {
    setLoading(true);
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!docData) {
      setLoading(false);
      return;
    }
    setDoc(docData as Document);

    const { data: reqs } = await supabase
      .from('requirements')
      .select('*')
      .eq('document_id', id)
      .order('requirement_code', { ascending: true });

    if (!reqs) {
      setLoading(false);
      return;
    }

    const reqIds = reqs.map((r) => r.id);
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .in('requirement_id', reqIds)
      .order('severity', { ascending: false });

    const findingsByReq = new Map<string, Finding[]>();
    for (const f of findings ?? []) {
      const arr = findingsByReq.get(f.requirement_id) ?? [];
      arr.push(f as Finding);
      findingsByReq.set(f.requirement_id, arr);
    }

    const reqsWithFindings = reqs.map((r) => ({
      ...(r as Requirement),
      findings: findingsByReq.get(r.id) ?? [],
    }));

    setRequirements(reqsWithFindings);
    setLoading(false);
  };

  const allFindings = useMemo(() => {
    return requirements.flatMap((r) => r.findings.map((f) => ({ ...f, requirement: r })));
  }, [requirements]);

  const findingsBySeverity = useMemo(() => {
    return {
      critical: allFindings.filter((f) => f.severity === 'critical'),
      high: allFindings.filter((f) => f.severity === 'high'),
      medium: allFindings.filter((f) => f.severity === 'medium'),
      low: allFindings.filter((f) => f.severity === 'low'),
    };
  }, [allFindings]);

  const findingsByCategory = useMemo(() => {
    const categories = new Map<string, typeof allFindings>();
    for (const f of allFindings) {
      const arr = categories.get(f.category) ?? [];
      arr.push(f);
      categories.set(f.category, arr);
    }
    return categories;
  }, [allFindings]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter((r) => {
      if (severityFilter !== 'all' && !r.findings.some((f) => f.severity === severityFilter)) return false;
      if (scoreFilter === 'low' && r.overall_score >= 40) return false;
      if (scoreFilter === 'medium' && (r.overall_score < 40 || r.overall_score >= 70)) return false;
      if (scoreFilter === 'high' && r.overall_score < 70) return false;
      if (categoryFilter !== 'all' && !r.findings.some((f) => f.category === categoryFilter)) return false;
      return true;
    });
  }, [requirements, severityFilter, scoreFilter, categoryFilter]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Requirements', count: requirements.length },
    { id: 'critical', label: 'Critical Issues', count: findingsBySeverity.critical.length },
    { id: 'ambiguity', label: 'Ambiguity', count: findingsByCategory.get('Ambiguity')?.length ?? 0 },
    { id: 'missing', label: 'Missing Information', count: findingsByCategory.get('Missing Business Rules')?.length ?? 0 },
    { id: 'contradictions', label: 'Contradictions', count: findingsByCategory.get('Contradiction')?.length ?? 0 },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!doc) {
    return (
      <AppLayout>
        <EmptyState
          icon={<FileText size={40} />}
          title="Analysis not found"
          description="This analysis may have been deleted or you don't have access to it."
          action={<Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}
        />
      </AppLayout>
    );
  }

  const overallScore = doc.overall_score ?? 0;
  const qualityRating = getQualityRating(overallScore);

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <PageHeader
        title={doc.filename}
        subtitle={`${doc.document_type} · ${new Date(doc.created_at).toLocaleDateString()}`}
        action={
          <Button variant="outline" onClick={() => exportToPDF(doc, requirements, allFindings)}>
            <Download size={18} />
            Export PDF
          </Button>
        }
      />

      {doc.status !== 'completed' && (
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={doc.status} />
            <p className="text-sm text-gray-500">
              {doc.status === 'analyzing' ? 'Analysis is in progress...' : 'This analysis is pending.'}
            </p>
          </div>
        </Card>
      )}

      {/* Health Score section */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center">
            <ScoreRing score={overallScore} size={140} />
            <p className="mt-2 text-sm font-medium text-gray-600">{qualityRating}</p>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Requirement Health Score</h3>
            <p className="mt-1 text-sm text-gray-500">
              Based on {requirements.length} analyzed requirement{requirements.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SeverityCount label="Critical" count={findingsBySeverity.critical.length} color="red" icon={<AlertOctagon size={16} />} />
              <SeverityCount label="High" count={findingsBySeverity.high.length} color="orange" icon={<AlertTriangle size={16} />} />
              <SeverityCount label="Medium" count={findingsBySeverity.medium.length} color="amber" icon={<AlertCircle size={16} />} />
              <SeverityCount label="Low" count={findingsBySeverity.low.length} color="gray" icon={<Info size={16} />} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab requirements={requirements} findingsBySeverity={findingsBySeverity} findingsByCategory={findingsByCategory} />
      )}

      {activeTab === 'requirements' && (
        <div>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-900"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-900"
            >
              <option value="all">All scores</option>
              <option value="low">Low (0-39)</option>
              <option value="medium">Medium (40-69)</option>
              <option value="high">High (70-100)</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-900"
            >
              <option value="all">All categories</option>
              {[...findingsByCategory.keys()].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Requirement table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Requirement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequirements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No requirements match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRequirements.map((req) => {
                      const topSeverity = req.findings.length > 0
                        ? req.findings.reduce((top, f) => {
                            const order = { critical: 0, high: 1, medium: 2, low: 3 };
                            return order[f.severity as keyof typeof order] < order[top as keyof typeof order] ? f.severity : top;
                          }, 'low' as string)
                        : null;
                      return (
                        <tr
                          key={req.id}
                          onClick={() => navigate(`/analysis/${documentId}/requirement/${req.id}`)}
                          className="cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{req.requirement_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="max-w-md truncate">{req.original_text}</div>
                          </td>
                          <td className="px-4 py-3"><ScoreBadge score={req.overall_score} size="sm" /></td>
                          <td className="px-4 py-3">
                            {topSeverity ? <SeverityBadge severity={topSeverity as 'critical' | 'high' | 'medium' | 'low'} /> : <span className="text-xs text-gray-400">No issues</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {req.findings.length > 0 ? `${req.findings.length} finding${req.findings.length !== 1 ? 's' : ''}` : 'Clean'}
                              <ChevronRight size={14} className="text-gray-400" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'critical' && (
        <FindingsList findings={findingsBySeverity.critical} title="Critical Issues" documentId={documentId!} />
      )}

      {activeTab === 'ambiguity' && (
        <FindingsList findings={findingsByCategory.get('Ambiguity') ?? []} title="Ambiguity Issues" documentId={documentId!} />
      )}

      {activeTab === 'missing' && (
        <div className="space-y-4">
          <FindingsList findings={findingsByCategory.get('Missing Business Rules') ?? []} title="Missing Business Rules" documentId={documentId!} />
          <FindingsList findings={findingsByCategory.get('Exception Handling') ?? []} title="Missing Exception Handling" documentId={documentId!} />
          <FindingsList findings={findingsByCategory.get('Acceptance Criteria') ?? []} title="Missing Acceptance Criteria" documentId={documentId!} />
        </div>
      )}

      {activeTab === 'contradictions' && (
        <FindingsList findings={findingsByCategory.get('Contradiction') ?? []} title="Contradictions" documentId={documentId!} />
      )}

      {activeTab === 'recommendations' && (
        <RecommendationsTab findings={allFindings} documentId={documentId!} />
      )}
    </AppLayout>
  );
}

function SeverityCount({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold">{count}</p>
    </div>
  );
}

function OverviewTab({
  requirements,
  findingsBySeverity,
  findingsByCategory,
}: {
  requirements: RequirementWithFindings[];
  findingsBySeverity: Record<string, typeof requirements extends never ? never : any[]>;
  findingsByCategory: Map<string, any[]>;
}) {
  const avgScores = requirements.length > 0
    ? {
        clarity: Math.round(requirements.reduce((s, r) => s + r.clarity_score, 0) / requirements.length),
        completeness: Math.round(requirements.reduce((s, r) => s + r.completeness_score, 0) / requirements.length),
        testability: Math.round(requirements.reduce((s, r) => s + r.testability_score, 0) / requirements.length),
        consistency: Math.round(requirements.reduce((s, r) => s + r.consistency_score, 0) / requirements.length),
        measurability: Math.round(requirements.reduce((s, r) => s + r.measurability_score, 0) / requirements.length),
      }
    : { clarity: 0, completeness: 0, testability: 0, consistency: 0, measurability: 0 };

  const scoreBars = [
    { label: 'Clarity', score: avgScores.clarity },
    { label: 'Completeness', score: avgScores.completeness },
    { label: 'Testability', score: avgScores.testability },
    { label: 'Consistency', score: avgScores.consistency },
    { label: 'Measurability', score: avgScores.measurability },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Breakdown</h3>
        <p className="mt-1 text-sm text-gray-500">Average scores across all requirements</p>
        <div className="mt-4 space-y-4">
          {scoreBars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">{bar.label}</span>
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Findings Summary</h3>
        <p className="mt-1 text-sm text-gray-500">Issues found by category</p>
        <div className="mt-4 space-y-2">
          {[...findingsByCategory.entries()].sort((a, b) => b[1].length - a[1].length).map(([category, findings]) => (
            <div key={category} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
              <span className="text-sm font-medium text-gray-700">{category}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{findings.length}</span>
            </div>
          ))}
          {findingsByCategory.size === 0 && (
            <p className="text-sm text-gray-500">No findings detected. All requirements look good!</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function FindingsList({ findings, title, documentId }: { findings: any[]; title: string; documentId: string }) {
  if (findings.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={<CheckCircle2 size={40} className="text-emerald-500" />}
          title={`No ${title.toLowerCase()} found`}
          description="No issues were detected in this category."
        />
    </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {findings.map((f, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <SeverityBadge severity={f.severity} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/analysis/${documentId}/requirement/${f.requirement_id}`}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  {f.requirement?.requirement_code}
                </Link>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{f.category}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{f.issue}</p>
              <p className="mt-1 text-sm text-gray-600">{f.explanation}</p>
              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">Recommendation: </span>{f.recommendation}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RecommendationsTab({ findings, documentId }: { findings: any[]; documentId: string }) {
  const recommendations = findings.filter((f) => f.recommendation);

  if (recommendations.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState title="No recommendations" description="All requirements appear to be well-written." />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((f, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Info size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link to={`/analysis/${documentId}/requirement/${f.requirement_id}`} className="text-xs font-medium text-gray-500 hover:text-gray-900">
                  {f.requirement?.requirement_code}
                </Link>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{f.category}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{f.recommendation}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function exportToPDF(doc: Document, requirements: RequirementWithFindings[], findings: any[]) {
  // Generate a printable HTML view and trigger browser print
  const html = generatePrintableHTML(doc, requirements, findings);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
}

function generatePrintableHTML(doc: Document, requirements: RequirementWithFindings[], findings: any[]): string {
  const rows = requirements.map((r) => `
    <tr>
      <td>${r.requirement_code}</td>
      <td>${r.original_text.substring(0, 100)}${r.original_text.length > 100 ? '...' : ''}</td>
      <td>${r.overall_score}</td>
      <td>${r.findings.length}</td>
    </tr>
  `).join('');

  const findingRows = findings.map((f) => `
    <div class="finding">
      <h4>${f.requirement?.requirement_code ?? ''} — ${f.category} (${f.severity})</h4>
      <p><strong>Issue:</strong> ${f.issue}</p>
      <p><strong>Recommendation:</strong> ${f.recommendation}</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ReqGuard AI Analysis — ${doc.filename}</title>
      <style>
        body { font-family: -apple-system, sans-serif; margin: 40px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
        .score { font-size: 48px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        th { background: #f9fafb; font-weight: 600; }
        .finding { margin-bottom: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .finding h4 { margin: 0 0 8px; font-size: 14px; }
        .finding p { margin: 4px 0; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>ReqGuard AI Analysis Report</h1>
      <div class="meta">${doc.filename} · ${doc.document_type} · ${new Date(doc.created_at).toLocaleDateString()}</div>
      <div class="score">${doc.overall_score ?? '—'}</div>
      <p>Overall Requirement Health Score</p>
      <h2>Requirement Scores</h2>
      <table>
        <thead><tr><th>ID</th><th>Requirement</th><th>Score</th><th>Findings</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <h2>Findings & Recommendations</h2>
      ${findingRows || '<p>No findings detected.</p>'}
    </body>
    </html>
  `;
}
