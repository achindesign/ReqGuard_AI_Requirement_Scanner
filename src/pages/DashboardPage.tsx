import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, FileText, TrendingUp, AlertTriangle, AlertOctagon, Clock, ArrowRight } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, Button, ScoreBadge, StatusBadge, EmptyState, MetricCard, ProgressBar, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Document } from '@/types';
import { PLAN_LIMITS } from '@/types';

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  criticalIssues: number;
  highIssues: number;
}

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalAnalyses: 0, averageScore: 0, criticalIssues: 0, highIssues: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (docs) {
      setDocuments(docs as Document[]);

      const completed = docs.filter((d) => d.status === 'completed' && d.overall_score !== null);
      const avgScore = completed.length > 0
        ? Math.round(completed.reduce((sum, d) => sum + (d.overall_score ?? 0), 0) / completed.length)
        : 0;

      // Fetch findings counts
      let criticalCount = 0;
      let highCount = 0;
      if (completed.length > 0) {
        const docIds = completed.map((d) => d.id);
        const { data: reqs } = await supabase
          .from('requirements')
          .select('id')
          .in('document_id', docIds);
        if (reqs && reqs.length > 0) {
          const reqIds = reqs.map((r) => r.id);
          const { count: critCount } = await supabase
            .from('findings')
            .select('id', { count: 'exact', head: true })
            .in('requirement_id', reqIds)
            .eq('severity', 'critical');
          const { count: hiCount } = await supabase
            .from('findings')
            .select('id', { count: 'exact', head: true })
            .in('requirement_id', reqIds)
            .eq('severity', 'high');
          criticalCount = critCount ?? 0;
          highCount = hiCount ?? 0;
        }
      }

      setStats({
        totalAnalyses: completed.length,
        averageScore: avgScore,
        criticalIssues: criticalCount,
        highIssues: highCount,
      });
    }
    setLoading(false);
  };

  const planLimits = PLAN_LIMITS[profile?.plan ?? 'free'];
  const analysesUsed = profile?.analyses_used ?? 0;
  const remaining = Math.max(0, planLimits.analyses - analysesUsed);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your requirement analyses and account usage."
        action={
          <Button onClick={() => navigate('/new-analysis')}>
            <FilePlus size={18} />
            New Analysis
          </Button>
        }
      />

      {/* Usage banner */}
      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly analysis usage</p>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{analysesUsed}</span> of{' '}
              <span className="font-semibold text-gray-900">{planLimits.analyses === 999999 ? 'unlimited' : planLimits.analyses}</span> used
              {remaining === 0 && planLimits.analyses !== 999999 && (
                <span className="ml-2 text-red-600">— limit reached</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {remaining === 0 && planLimits.analyses !== 999999 ? (
              <Button size="sm" onClick={() => navigate('/pricing')}>
                Upgrade plan
              </Button>
            ) : (
              <span className="text-sm text-gray-500">
                {planLimits.analyses === 999999 ? 'Unlimited' : `${remaining} remaining`}
              </span>
            )}
          </div>
        </div>
        {planLimits.analyses !== 999999 && (
          <div className="mt-3">
            <ProgressBar value={analysesUsed} max={planLimits.analyses} />
          </div>
        )}
      </Card>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Analyses Completed"
          value={stats.totalAnalyses}
          icon={<FileText size={18} />}
          accent="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Average Score"
          value={stats.averageScore || '—'}
          sublabel={stats.averageScore ? 'across all analyses' : 'no analyses yet'}
          icon={<TrendingUp size={18} />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Critical Issues"
          value={stats.criticalIssues}
          icon={<AlertOctagon size={18} />}
          accent="bg-red-50 text-red-600"
        />
        <MetricCard
          label="High Severity"
          value={stats.highIssues}
          icon={<AlertTriangle size={18} />}
          accent="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Recent analyses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
        </div>

        {documents.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FileText size={40} />}
              title="No analyses yet"
              description="Upload your first requirement document to get started with AI-powered analysis."
              action={
                <Button onClick={() => navigate('/new-analysis')}>
                  <FilePlus size={18} />
                  New Analysis
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="cursor-pointer p-4 transition-shadow hover:shadow-md" >
                <button
                  onClick={() => navigate(`/analysis/${doc.id}`)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FileText size={18} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-xs text-gray-500">
                        {doc.document_type} · {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <StatusBadge status={doc.status} />
                    {doc.overall_score !== null && doc.status === 'completed' && (
                      <ScoreBadge score={doc.overall_score} />
                    )}
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
