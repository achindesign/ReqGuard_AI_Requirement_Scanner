import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Download,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Card, Button, ScoreRing, ScoreBadge, SeverityBadge } from '@/components/ui';
import { getQualityRating } from '@/components/ui';
import type { Document, Requirement, Finding } from '@/types';

interface DemoRequirement extends Requirement {
  findings: Finding[];
}

const demoDoc: Document = {
  id: 'demo',
  user_id: 'demo',
  filename: 'ecommerce-platform-requirements.pdf',
  file_type: 'pdf',
  file_url: null,
  document_type: 'BRD',
  status: 'completed',
  overall_score: 58,
  created_at: new Date().toISOString(),
};

const demoRequirements: DemoRequirement[] = [
  {
    id: 'demo-1',
    document_id: 'demo',
    requirement_code: 'REQ-001',
    original_text: 'The system shall allow users to search for products by name, category, or price range.',
    requirement_type: 'functional',
    priority: 'high',
    clarity_score: 75,
    completeness_score: 65,
    testability_score: 70,
    consistency_score: 85,
    measurability_score: 60,
    overall_score: 71,
    findings: [
      {
        id: 'f1',
        requirement_id: 'demo-1',
        category: 'Acceptance Criteria',
        severity: 'low',
        issue: 'Missing acceptance criteria for search result relevance and ranking',
        explanation: 'The requirement does not specify how search results should be ranked or ordered, which could lead to inconsistent user experience.',
        recommendation: 'Add criteria specifying result ranking (e.g., by relevance score, price, or popularity) and maximum results displayed.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-2',
    document_id: 'demo',
    requirement_code: 'REQ-002',
    original_text: 'The system shall require passwords to be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
    requirement_type: 'security',
    priority: 'critical',
    clarity_score: 90,
    completeness_score: 80,
    testability_score: 95,
    consistency_score: 60,
    measurability_score: 90,
    overall_score: 83,
    findings: [
      {
        id: 'f2',
        requirement_id: 'demo-2',
        category: 'Contradiction',
        severity: 'high',
        issue: 'Contradicts REQ-005 which specifies passwords must be at least 6 characters with no complexity requirements',
        explanation: 'REQ-002 requires 8-character passwords with complexity rules, while REQ-005 states 6 characters with no complexity. These cannot both be enforced simultaneously.',
        recommendation: 'Align both requirements to use the same password policy. Choose one standard and update the other.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-3',
    document_id: 'demo',
    requirement_code: 'REQ-003',
    original_text: 'The system shall load pages quickly and provide a user-friendly experience.',
    requirement_type: 'non_functional',
    priority: 'medium',
    clarity_score: 25,
    completeness_score: 30,
    testability_score: 15,
    consistency_score: 50,
    measurability_score: 10,
    overall_score: 24,
    findings: [
      {
        id: 'f3a',
        requirement_id: 'demo-3',
        category: 'Ambiguity',
        severity: 'critical',
        issue: 'Vague or subjective term(s): "quickly", "user-friendly"',
        explanation: 'The requirement uses subjective language that cannot be objectively measured or tested. "Quickly" and "user-friendly" mean different things to different stakeholders.',
        recommendation: 'Replace "quickly" with a specific, measurable criterion. For example, "page loads within 2 seconds". Replace "user-friendly" with specific usability metrics.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'f3b',
        requirement_id: 'demo-3',
        category: 'Testability',
        severity: 'high',
        issue: 'No measurable acceptance criteria',
        explanation: 'The requirement does not include any quantifiable or testable criteria, making it impossible to verify whether the requirement has been met.',
        recommendation: 'Add specific, measurable thresholds (e.g., response time, quantity, percentage) that can be objectively tested.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-4',
    document_id: 'demo',
    requirement_code: 'REQ-004',
    original_text: 'The system shall allow customers to add products to a shopping cart and proceed to checkout.',
    requirement_type: 'functional',
    priority: 'high',
    clarity_score: 70,
    completeness_score: 55,
    testability_score: 65,
    consistency_score: 80,
    measurability_score: 55,
    overall_score: 64,
    findings: [
      {
        id: 'f4a',
        requirement_id: 'demo-4',
        category: 'Missing Business Rules',
        severity: 'medium',
        issue: 'No conditional logic or business rules specified',
        explanation: 'The requirement does not describe what happens when items are out of stock, when the cart reaches a maximum limit, or when a user is not logged in.',
        recommendation: 'Define conditions: What happens if a product is out of stock? Is there a cart item limit? Can guests checkout or must they register?',
        created_at: new Date().toISOString(),
      },
      {
        id: 'f4b',
        requirement_id: 'demo-4',
        category: 'Exception Handling',
        severity: 'medium',
        issue: 'No exception or error handling defined',
        explanation: 'The requirement does not address what happens when checkout fails, payment is declined, or the session times out.',
        recommendation: 'Specify error handling: payment failures, session timeouts, inventory changes during checkout, and network errors.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-5',
    document_id: 'demo',
    requirement_code: 'REQ-005',
    original_text: 'The system shall allow users to register with an email and password. Passwords must be at least 6 characters.',
    requirement_type: 'functional',
    priority: 'high',
    clarity_score: 80,
    completeness_score: 60,
    testability_score: 75,
    consistency_score: 55,
    measurability_score: 70,
    overall_score: 68,
    findings: [
      {
        id: 'f5a',
        requirement_id: 'demo-5',
        category: 'Contradiction',
        severity: 'high',
        issue: 'Contradicts REQ-002 which requires 8-character passwords with complexity rules',
        explanation: 'This requirement allows 6-character passwords with no complexity, while REQ-002 demands 8 characters with uppercase, numbers, and special characters.',
        recommendation: 'Align both requirements to use the same password policy.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'f5b',
        requirement_id: 'demo-5',
        category: 'Exception Handling',
        severity: 'medium',
        issue: 'No exception or error handling defined',
        explanation: 'The requirement does not address duplicate email registration, invalid email formats, or what happens if the email is already in use.',
        recommendation: 'Specify behavior for duplicate emails, invalid formats, and password confirmation requirements.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-6',
    document_id: 'demo',
    requirement_code: 'REQ-006',
    original_text: 'The system shall process payments through a payment gateway and send an order confirmation email.',
    requirement_type: 'functional',
    priority: 'critical',
    clarity_score: 65,
    completeness_score: 40,
    testability_score: 50,
    consistency_score: 70,
    measurability_score: 45,
    overall_score: 52,
    findings: [
      {
        id: 'f6a',
        requirement_id: 'demo-6',
        category: 'Exception Handling',
        severity: 'critical',
        issue: 'No exception or error handling for failed payment scenarios',
        explanation: 'The requirement does not address what happens when a payment fails, is declined, or the payment gateway is unavailable. This is critical for an e-commerce system.',
        recommendation: 'Define behavior for: declined cards, gateway timeouts, partial payments, refund processes, and email delivery failures.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'f6b',
        requirement_id: 'demo-6',
        category: 'Missing Business Rules',
        severity: 'high',
        issue: 'No conditional logic for different payment methods',
        explanation: 'The requirement does not specify which payment methods are supported, how different currencies are handled, or tax calculation rules.',
        recommendation: 'Specify supported payment methods (credit card, PayPal, etc.), currency handling, tax rules, and order validation before processing.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-7',
    document_id: 'demo',
    requirement_code: 'REQ-007',
    original_text: 'The system shall be scalable and handle a large number of concurrent users.',
    requirement_type: 'non_functional',
    priority: 'medium',
    clarity_score: 30,
    completeness_score: 35,
    testability_score: 20,
    consistency_score: 60,
    measurability_score: 15,
    overall_score: 30,
    findings: [
      {
        id: 'f7a',
        requirement_id: 'demo-7',
        category: 'Ambiguity',
        severity: 'high',
        issue: 'Vague or subjective term(s): "scalable", "large number"',
        explanation: '"Scalable" and "large number" are not measurable. Without specific numbers, this requirement cannot be tested or verified.',
        recommendation: 'Replace with specific numbers: "The system shall support up to 10,000 concurrent users with response times under 2 seconds."',
        created_at: new Date().toISOString(),
      },
      {
        id: 'f7b',
        requirement_id: 'demo-7',
        category: 'Testability',
        severity: 'high',
        issue: 'No measurable acceptance criteria',
        explanation: 'No quantifiable thresholds are provided for concurrent users, response time, or resource limits.',
        recommendation: 'Add specific thresholds: max concurrent users, response time targets, CPU/memory limits, and degradation behavior.',
        created_at: new Date().toISOString(),
      },
    ],
  },
];

type Tab = 'overview' | 'requirements' | 'critical' | 'ambiguity' | 'missing' | 'contradictions' | 'recommendations';

export function DemoResultsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedReq, setSelectedReq] = useState<DemoRequirement | null>(null);

  const allFindings = useMemo(() => {
    return demoRequirements.flatMap((r) => r.findings.map((f) => ({ ...f, requirement: r })));
  }, []);

  const findingsBySeverity = useMemo(() => ({
    critical: allFindings.filter((f) => f.severity === 'critical'),
    high: allFindings.filter((f) => f.severity === 'high'),
    medium: allFindings.filter((f) => f.severity === 'medium'),
    low: allFindings.filter((f) => f.severity === 'low'),
  }), [allFindings]);

  const findingsByCategory = useMemo(() => {
    const cats = new Map<string, typeof allFindings>();
    for (const f of allFindings) {
      const arr = cats.get(f.category) ?? [];
      arr.push(f);
      cats.set(f.category, arr);
    }
    return cats;
  }, [allFindings]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Requirements', count: demoRequirements.length },
    { id: 'critical', label: 'Critical Issues', count: findingsBySeverity.critical.length },
    { id: 'ambiguity', label: 'Ambiguity', count: findingsByCategory.get('Ambiguity')?.length ?? 0 },
    { id: 'missing', label: 'Missing Information', count: (findingsByCategory.get('Missing Business Rules')?.length ?? 0) + (findingsByCategory.get('Exception Handling')?.length ?? 0) },
    { id: 'contradictions', label: 'Contradictions', count: findingsByCategory.get('Contradiction')?.length ?? 0 },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-gray-900" />
            <span className="text-lg font-bold tracking-tight text-gray-900">ReqGuard AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Demo Mode</span>
            <Button size="sm" onClick={() => window.location.href = '/signup'}>
              Sign up free
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowRight size={16} className="rotate-180" />
            Back to Home
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{demoDoc.filename}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {demoDoc.document_type} · Sample E-commerce Requirements · {demoRequirements.length} requirements
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/signup'}>
            <ArrowRight size={18} />
            Try with your document
          </Button>
        </div>

        {/* Health Score */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center">
              <ScoreRing score={demoDoc.overall_score!} size={140} />
              <p className="mt-2 text-sm font-medium text-gray-600">{getQualityRating(demoDoc.overall_score!)}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Requirement Health Score</h3>
              <p className="mt-1 text-sm text-gray-500">Based on {demoRequirements.length} analyzed requirements</p>
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
              onClick={() => { setActiveTab(tab.id); setSelectedReq(null); }}
              className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {selectedReq ? (
          <DemoRequirementDetail req={selectedReq} onBack={() => setSelectedReq(null)} />
        ) : activeTab === 'overview' ? (
          <DemoOverview requirements={demoRequirements} findingsByCategory={findingsByCategory} />
        ) : activeTab === 'requirements' ? (
          <DemoRequirementsTable requirements={demoRequirements} onSelect={setSelectedReq} />
        ) : activeTab === 'critical' ? (
          <DemoFindingsList findings={findingsBySeverity.critical} title="Critical Issues" onSelect={setSelectedReq} />
        ) : activeTab === 'ambiguity' ? (
          <DemoFindingsList findings={findingsByCategory.get('Ambiguity') ?? []} title="Ambiguity Issues" onSelect={setSelectedReq} />
        ) : activeTab === 'missing' ? (
          <div className="space-y-4">
            <DemoFindingsList findings={findingsByCategory.get('Missing Business Rules') ?? []} title="Missing Business Rules" onSelect={setSelectedReq} />
            <DemoFindingsList findings={findingsByCategory.get('Exception Handling') ?? []} title="Missing Exception Handling" onSelect={setSelectedReq} />
            <DemoFindingsList findings={findingsByCategory.get('Acceptance Criteria') ?? []} title="Missing Acceptance Criteria" onSelect={setSelectedReq} />
          </div>
        ) : activeTab === 'contradictions' ? (
          <DemoFindingsList findings={findingsByCategory.get('Contradiction') ?? []} title="Contradictions" onSelect={setSelectedReq} />
        ) : (
          <DemoRecommendations findings={allFindings} onSelect={setSelectedReq} />
        )}

        {/* CTA */}
        <Card className="mt-8 border-gray-900 bg-gray-900 p-8 text-center">
          <h3 className="text-xl font-bold text-white">Ready to analyze your requirements?</h3>
          <p className="mt-2 text-gray-400">Upload your own BRD, PRD, or requirement document and get instant AI-powered analysis.</p>
          <div className="mt-6 flex justify-center">
            <Button size="lg" variant="secondary" onClick={() => window.location.href = '/signup'}>
              Get started free
              <ArrowRight size={18} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
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
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-1 text-xl font-bold">{count}</p>
    </div>
  );
}

function DemoOverview({ requirements, findingsByCategory }: { requirements: DemoRequirement[]; findingsByCategory: Map<string, any[]> }) {
  const avgScores = {
    clarity: Math.round(requirements.reduce((s, r) => s + r.clarity_score, 0) / requirements.length),
    completeness: Math.round(requirements.reduce((s, r) => s + r.completeness_score, 0) / requirements.length),
    testability: Math.round(requirements.reduce((s, r) => s + r.testability_score, 0) / requirements.length),
    consistency: Math.round(requirements.reduce((s, r) => s + r.consistency_score, 0) / requirements.length),
    measurability: Math.round(requirements.reduce((s, r) => s + r.measurability_score, 0) / requirements.length),
  };

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
                <div className={`h-full rounded-full transition-all duration-700 ${bar.score >= 70 ? 'bg-emerald-500' : bar.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bar.score}%` }} />
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
        </div>
      </Card>
    </div>
  );
}

function DemoRequirementsTable({ requirements, onSelect }: { requirements: DemoRequirement[]; onSelect: (req: DemoRequirement) => void }) {
  return (
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
            {requirements.map((req) => {
              const topSeverity = req.findings.length > 0
                ? req.findings.reduce((top, f) => {
                    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                    return order[f.severity] < order[top] ? f.severity : top;
                  }, 'low' as string)
                : null;
              return (
                <tr key={req.id} onClick={() => onSelect(req)} className="cursor-pointer transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{req.requirement_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600"><div className="max-w-md truncate">{req.original_text}</div></td>
                  <td className="px-4 py-3"><ScoreBadge score={req.overall_score} size="sm" /></td>
                  <td className="px-4 py-3">{topSeverity ? <SeverityBadge severity={topSeverity as any} /> : <span className="text-xs text-gray-400">No issues</span>}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs text-gray-500">{req.findings.length > 0 ? `${req.findings.length} finding${req.findings.length !== 1 ? 's' : ''}` : 'Clean'}<ChevronRight size={14} className="text-gray-400" /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DemoFindingsList({ findings, title, onSelect }: { findings: any[]; title: string; onSelect: (req: DemoRequirement) => void }) {
  if (findings.length === 0) {
    return <Card className="p-8"><div className="flex flex-col items-center text-center"><CheckCircle2 size={40} className="text-emerald-500" /><h3 className="mt-4 text-lg font-semibold text-gray-900">No {title.toLowerCase()} found</h3><p className="mt-1 text-sm text-gray-500">No issues were detected in this category.</p></div></Card>;
  }
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {findings.map((f, i) => (
        <Card key={i} className="cursor-pointer p-4 transition-shadow hover:shadow-md" >
          <button onClick={() => onSelect(f.requirement)} className="flex w-full items-start gap-3 text-left">
            <SeverityBadge severity={f.severity} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">{f.requirement?.requirement_code}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{f.category}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{f.issue}</p>
              <p className="mt-1 text-sm text-gray-600">{f.explanation}</p>
              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"><span className="font-medium">Recommendation: </span>{f.recommendation}</div>
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}

function DemoRecommendations({ findings, onSelect }: { findings: any[]; onSelect: (req: DemoRequirement) => void }) {
  const recs = findings.filter((f) => f.recommendation);
  if (recs.length === 0) return <Card className="p-8"><div className="text-center"><h3 className="text-lg font-semibold text-gray-900">No recommendations</h3></div></Card>;
  return (
    <div className="space-y-3">
      {recs.map((f, i) => (
        <Card key={i} className="cursor-pointer p-4 transition-shadow hover:shadow-md">
          <button onClick={() => onSelect(f.requirement)} className="flex w-full items-start gap-3 text-left">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Info size={16} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-500">{f.requirement?.requirement_code}</span><span className="text-xs text-gray-400">·</span><span className="text-xs text-gray-500">{f.category}</span></div>
              <p className="mt-1 text-sm text-gray-700">{f.recommendation}</p>
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}

function DemoRequirementDetail({ req, onBack }: { req: DemoRequirement; onBack: () => void }) {
  const scoreBars = [
    { label: 'Clarity', score: req.clarity_score },
    { label: 'Completeness', score: req.completeness_score },
    { label: 'Testability', score: req.testability_score },
    { label: 'Consistency', score: req.consistency_score },
    { label: 'Measurability', score: req.measurability_score },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowRight size={16} className="rotate-180" /> Back to requirements
        </button>
        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Original Requirement</h3>
          <p className="mt-3 text-base text-gray-900">{req.original_text}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Findings</h3>
          <div className="mt-4 space-y-3">
            {req.findings.map((f) => (
              <div key={f.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-2"><SeverityBadge severity={f.severity} /><span className="text-xs text-gray-500">{f.category}</span></div>
                <p className="mt-2 text-sm font-medium text-gray-900">{f.issue}</p>
                <p className="mt-1 text-sm text-gray-600">{f.explanation}</p>
                <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"><span className="font-medium">Recommendation: </span>{f.recommendation}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            <ScoreRing score={req.overall_score} size={120} />
            <p className="mt-2 text-sm font-medium text-gray-600">{getQualityRating(req.overall_score)}</p>
          </div>
          <div className="mt-6 space-y-3">
            {scoreBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-sm"><span className="text-gray-600">{bar.label}</span><span className="font-semibold text-gray-900">{bar.score}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200"><div className={`h-full rounded-full transition-all duration-700 ${bar.score >= 70 ? 'bg-emerald-500' : bar.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bar.score}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Sign up to generate AI rewrites and acceptance criteria for your requirements.</p>
            <Button className="mt-3" size="sm" onClick={() => window.location.href = '/signup'}>Sign up free</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
