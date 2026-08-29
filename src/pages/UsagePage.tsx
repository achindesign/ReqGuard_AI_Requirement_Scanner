import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, TrendingUp, Calendar } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, MetricCard, ProgressBar, Spinner, EmptyState, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { AnalysisUsage, Document } from '@/types';
import { PLAN_LIMITS } from '@/types';

export function UsagePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [usageRecords, setUsageRecords] = useState<AnalysisUsage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    setLoading(true);
    const { data: usage } = await supabase
      .from('analysis_usage')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(20);

    setUsageRecords((usage ?? []) as AnalysisUsage[]);

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    setDocuments((docs ?? []) as Document[]);
    setLoading(false);
  };

  const planLimits = PLAN_LIMITS[profile?.plan ?? 'free'];
  const analysesUsed = profile?.analyses_used ?? 0;
  const remaining = Math.max(0, planLimits.analyses - analysesUsed);
  const totalRequirements = usageRecords.reduce((sum, u) => sum + u.requirements_count, 0);
  const totalTokens = usageRecords.reduce((sum, u) => sum + u.tokens_used, 0);

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
      <PageHeader title="Usage" subtitle="Track your analysis usage and plan limits." />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Analyses Used"
          value={analysesUsed}
          sublabel={`of ${planLimits.analyses === 999999 ? 'unlimited' : planLimits.analyses} monthly`}
          icon={<Clock size={18} />}
          accent="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Remaining"
          value={planLimits.analyses === 999999 ? 'Unlimited' : remaining}
          icon={<Calendar size={18} />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Requirements Analyzed"
          value={totalRequirements}
          icon={<FileText size={18} />}
          accent="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Plan"
          value={planLimits.label}
          icon={<TrendingUp size={18} />}
          accent="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Usage bar */}
      {planLimits.analyses !== 999999 && (
        <Card className="mb-6 p-5">
          <ProgressBar
            value={analysesUsed}
            max={planLimits.analyses}
            label="Monthly analysis usage"
          />
          {remaining === 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
              <p className="text-sm text-orange-700">You've reached your monthly limit.</p>
              <Button size="sm" onClick={() => navigate('/pricing')}>Upgrade</Button>
            </div>
          )}
        </Card>
      )}

      {/* Usage history */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Usage History</h2>
        {usageRecords.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Clock size={40} />}
              title="No usage yet"
              description="Your analysis history will appear here once you run your first analysis."
              action={<Button onClick={() => navigate('/new-analysis')}>New Analysis</Button>}
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Requirements</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usageRecords.map((record) => {
                    const doc = documents.find((d) => d.id === record.document_id);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {new Date(record.analysis_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {doc?.filename ?? 'Unknown document'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.requirements_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.tokens_used || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
