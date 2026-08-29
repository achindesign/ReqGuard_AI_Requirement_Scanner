import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  Target,
  Layers,
  GitBranch,
  ListChecks,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { trackEvent } from '@/lib/analytics';

export function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('landing_page_view');
  }, []);

  const features = [
    {
      icon: <Target size={20} />,
      title: 'Requirement Quality Scoring',
      description: 'Every requirement is scored on clarity, completeness, testability, consistency, and measurability.',
    },
    {
      icon: <Eye size={20} />,
      title: 'Ambiguity Detection',
      description: 'Identify vague language, undefined terms, and subjective criteria that lead to misinterpretation.',
    },
    {
      icon: <Layers size={20} />,
      title: 'Missing Requirement Detection',
      description: 'Spot gaps in business rules, edge cases, and exception handling that requirements overlook.',
    },
    {
      icon: <GitBranch size={20} />,
      title: 'Contradiction Detection',
      description: 'Find conflicting requirements across your document before they cause rework.',
    },
    {
      icon: <Sparkles size={20} />,
      title: 'AI Rewriting',
      description: 'Get AI-powered rewrites that fix ambiguity and improve requirement quality instantly.',
    },
    {
      icon: <ListChecks size={20} />,
      title: 'Acceptance Criteria Generation',
      description: 'Automatically generate testable acceptance criteria for every requirement.',
    },
  ];

  const demoSteps = [
    { icon: <FileText size={16} />, label: 'Upload document', description: 'PDF, DOCX, or paste text directly' },
    { icon: <FileSearch size={16} />, label: 'AI analysis', description: 'Requirements are segmented and analyzed' },
    { icon: <CheckCircle2 size={16} />, label: 'Get results', description: 'Scores, findings, and recommendations' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-gray-900" />
            <span className="text-lg font-bold tracking-tight text-gray-900">ReqGuard AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link to="/demo" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Demo
            </Link>
            {session ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-medium text-gray-600">
              <Zap size={14} className="text-amber-500" />
              AI-powered requirement quality analysis
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find requirement gaps before they become development problems.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
              Upload a BRD, PRD or requirement document and get an AI-powered quality, ambiguity, risk and testability analysis.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate(session ? '/new-analysis' : '/signup')} className="w-full sm:w-auto">
                Analyze My Requirements
                <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo')} className="w-full sm:w-auto">
                <Eye size={18} />
                See Example Analysis
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-400">No credit card required. Free plan includes 1 analysis per month.</p>
          </div>
        </div>
      </section>

      {/* Product demonstration section */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How it works</h2>
            <p className="mt-3 text-gray-500">
              Three steps from document to actionable insights.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {demoSteps.map((step, i) => (
              <div key={i} className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                {i < demoSteps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-gray-300 md:block">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Demo preview card */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">ecommerce-requirements.pdf</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Analyzed
                </span>
              </div>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="301.6" strokeDashoffset="120.6" strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-900">60</span>
                    <span className="block text-xs text-gray-500">Health Score</span>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-orange-600">Needs Improvement</p>
              </div>
              <div className="space-y-3 md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700">Key Findings</h4>
                {[
                  { severity: 'critical', text: 'REQ-003: "fast loading" is untestable — no measurable threshold defined' },
                  { severity: 'high', text: 'REQ-005: Contradicts REQ-002 on password complexity requirements' },
                  { severity: 'medium', text: 'REQ-007: Missing exception handling for failed payment scenarios' },
                  { severity: 'low', text: 'REQ-001: Acceptance criteria could be more specific' },
                ].map((finding, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                    <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      finding.severity === 'critical' ? 'bg-red-500' :
                      finding.severity === 'high' ? 'bg-orange-500' :
                      finding.severity === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                    }`} />
                    <p className="text-sm text-gray-600">{finding.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Comprehensive requirement analysis</h2>
            <p className="mt-3 text-gray-500">
              Eight quality dimensions scored per requirement, plus AI-powered improvements.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-900 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Stop shipping requirements that hide problems.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Get your first AI-powered requirement analysis in minutes. Free to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" onClick={() => navigate(session ? '/new-analysis' : '/signup')} className="w-full sm:w-auto">
              <RefreshCw size={18} />
              Analyze My Requirements
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate('/demo')} className="w-full text-white hover:bg-gray-800 sm:w-auto">
              See Example Analysis
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">ReqGuard AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link to="/demo" className="hover:text-gray-900">Demo</Link>
            <Link to="/help" className="hover:text-gray-900">Help</Link>
          </div>
          <p className="text-sm text-gray-400">Find requirement gaps before they become development problems.</p>
        </div>
      </footer>
    </div>
  );
}
