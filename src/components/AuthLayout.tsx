import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Left panel — branding */}
      <div className="relative hidden flex-col justify-between bg-gray-900 p-12 text-white lg:flex lg:w-1/2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={28} />
          <span className="text-xl font-bold tracking-tight">ReqGuard AI</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Find requirement gaps before they become development problems.
          </h2>
          <p className="mt-4 text-gray-400">
            Upload a BRD, PRD or requirement document and get an AI-powered quality, ambiguity, risk and testability analysis.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Ambiguity detection across every requirement',
              'Missing business rules and edge case identification',
              'Contradiction detection between requirements',
              'AI-powered rewrites and acceptance criteria generation',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500">Trusted by business analysts, product managers, and QA engineers.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <ShieldCheck size={24} className="text-gray-900" />
            <span className="text-lg font-bold tracking-tight text-gray-900">ReqGuard AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-gray-900 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
