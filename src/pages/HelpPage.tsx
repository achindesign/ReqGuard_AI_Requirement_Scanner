import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Upload, BarChart3, Sparkles, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card } from '@/components/ui';

const faqs = [
  {
    category: 'Getting Started',
    icon: <HelpCircle size={18} />,
    questions: [
      {
        q: 'What types of documents can I upload?',
        a: 'You can upload PDF, DOCX, or TXT files, or paste text directly into the analysis form. The maximum file size is 10MB.',
      },
      {
        q: 'What document types are supported?',
        a: 'We support Business Requirements Documents (BRD), Product Requirements Documents (PRD), User Stories, Functional Requirements, and Other document types.',
      },
      {
        q: 'How do I get started?',
        a: 'Sign up for a free account, then click "New Analysis" to upload your first document. The free plan includes 2 analyses per month with up to 10 requirements.',
      },
    ],
  },
  {
    category: 'Analysis',
    icon: <BarChart3 size={18} />,
    questions: [
      {
        q: 'How are requirements scored?',
        a: 'Each requirement is scored on 8 dimensions: Clarity (15%), Completeness (15%), Testability (15%), Consistency (10%), Measurability (10%), Business Rules (15%), Exception Handling (10%), and Acceptance Criteria (10%). Each dimension is scored 0-100.',
      },
      {
        q: 'What types of issues does ReqGuard AI detect?',
        a: 'We detect ambiguity (vague language), missing business rules, missing exception handling, contradictions between requirements, untestable requirements, and missing acceptance criteria.',
      },
      {
        q: 'How does the AI rewriting work?',
        a: 'Click "Improve Requirement" on any requirement detail page. The AI generates a rewritten version with specific, measurable language and adds assumptions and edge cases to consider.',
      },
      {
        q: 'Can I generate acceptance criteria?',
        a: 'Yes. Click "Generate Acceptance Criteria" on any requirement detail page. The AI creates Given/When/Then format acceptance criteria for testing.',
      },
    ],
  },
  {
    category: 'Plans & Limits',
    icon: <CreditCard size={18} />,
    questions: [
      {
        q: 'What are the plan limits?',
        a: 'Free: 2 analyses/month, 10 requirements. Pro ($9/mo): 50 analyses/month, 1,000 requirements. Professional ($19/mo): unlimited reasonable usage, bulk analysis, advanced features.',
      },
      {
        q: 'What happens when I reach my limit?',
        a: 'You will see a clear upgrade message. Your existing analyses remain accessible. Upgrade your plan to continue analyzing new documents.',
      },
      {
        q: 'Can I export my analysis?',
        a: 'PDF export is available on the Pro and Professional plans. Click "Export PDF" on any completed analysis results page.',
      },
    ],
  },
  {
    category: 'Security',
    icon: <ShieldCheck size={18} />,
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes. All documents are stored securely with row-level access controls. Only you can access your own documents and analyses. We never expose your uploaded documents publicly.',
      },
      {
        q: 'Do you store payment information?',
        a: 'No. We use Stripe for payment processing and never store card details on our servers.',
      },
    ],
  },
];

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <AppLayout>
      <PageHeader title="Help" subtitle="Find answers to common questions about ReqGuard AI." />

      {/* Quick links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/new-analysis">
          <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
            <Upload size={20} className="text-gray-500" />
            <p className="mt-2 text-sm font-medium text-gray-900">Upload a document</p>
          </Card>
        </Link>
        <Link to="/dashboard">
          <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
            <FileText size={20} className="text-gray-500" />
            <p className="mt-2 text-sm font-medium text-gray-900">View my analyses</p>
          </Card>
        </Link>
        <Link to="/pricing">
          <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
            <CreditCard size={20} className="text-gray-500" />
            <p className="mt-2 text-sm font-medium text-gray-900">View pricing</p>
          </Card>
        </Link>
        <Link to="/demo">
          <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
            <Sparkles size={20} className="text-gray-500" />
            <p className="mt-2 text-sm font-medium text-gray-900">See demo analysis</p>
          </Card>
        </Link>
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                {section.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{section.category}</h2>
            </div>
            <div className="space-y-2">
              {section.questions.map((faq) => {
                const key = `${section.category}-${faq.q}`;
                const isOpen = openFaq === key;
                return (
                  <Card key={key} className="overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 px-5 py-4">
                        <p className="text-sm text-gray-600">{faq.a}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <Card className="mt-8 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Still have questions?</h3>
        <p className="mt-1 text-sm text-gray-500">
          We are here to help. Reach out and we will get back to you as soon as possible.
        </p>
        <a
          href="mailto:support@reqguard.ai"
          className="mt-4 inline-block text-sm font-medium text-gray-900 underline"
        >
          support@reqguard.ai
        </a>
      </Card>
    </AppLayout>
  );
}
