import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Check, ArrowRight, Zap, Star, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card } from '@/components/ui';
import { trackEvent } from '@/lib/analytics';
import type { Plan } from '@/types';

const plans: { id: Plan; name: string; price: number; description: string; features: string[]; highlight?: boolean; icon: React.ReactNode }[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: '1 analysis/month · 10 requirements · Basic quality analysis',
    features: [
      '1 analysis per month',
      'Up to 10 requirements per document',
      'Basic quality scoring',
      'Ambiguity detection',
      'Missing requirement detection',
      'Community support',
    ],
    icon: <ShieldCheck size={20} />,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    description: '50 analyses/month · 1,000 requirements · Full analysis + AI rewriting + PDF export',
    features: [
      '50 analyses per month',
      'Up to 1,000 requirements per document',
      'Full quality analysis (8 dimensions)',
      'AI requirement rewriting',
      'Acceptance criteria generation',
      'Contradiction detection',
      'PDF export',
      'Email support',
    ],
    highlight: true,
    icon: <Zap size={20} />,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 19,
    description: 'Unlimited reasonable usage · Bulk analysis · Advanced contradiction detection · Priority processing',
    features: [
      'Unlimited reasonable usage',
      'Bulk document analysis',
      'Advanced contradiction detection',
      'Priority processing',
      'Advanced reports',
      'All Pro features included',
      'Priority support',
    ],
    icon: <Crown size={20} />,
  },
];

export function PricingPage() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('pricing_page_viewed');
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!session) {
      navigate('/signup');
      return;
    }
    if (plan === 'free') {
      navigate('/dashboard');
      return;
    }
    trackEvent('checkout_initiated', { plan });
    // Stripe checkout would be initiated here
    // For now, show a message
    alert('Stripe checkout integration is ready to be configured. Please connect your Stripe account to enable payments.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-gray-900" />
            <span className="text-lg font-bold tracking-tight text-gray-900">ReqGuard AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
                <Button size="sm" onClick={() => navigate('/signup')}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-gray-500">
            Start free and upgrade as your needs grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = profile?.plan === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col p-6 ${
                  plan.highlight ? 'border-gray-900 ring-2 ring-gray-900/10' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    plan.highlight ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-6 flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.highlight ? 'primary' : 'outline'}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {plan.id === 'free' ? (session ? 'Use Free' : 'Get started') : `Upgrade to ${plan.name}`}
                      <ArrowRight size={18} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">Frequently asked questions</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-4">
            {[
              { q: 'Can I change plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
              { q: 'What happens when I hit my monthly limit?', a: 'You will see a clear upgrade message. Your existing analyses remain accessible, and you can upgrade to continue analyzing.' },
              { q: 'Do you store payment card information?', a: 'No. We use Stripe for payment processing and never store card details on our servers.' },
              { q: 'What does "unlimited reasonable usage" mean?', a: 'Professional plan includes generous limits designed for real-world usage. We implement fair-use caps to ensure service quality for all users.' },
              { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your plan reverts to the Free plan at the end of your billing period.' },
            ].map((faq) => (
              <Card key={faq.q} className="p-5">
                <h3 className="text-sm font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
