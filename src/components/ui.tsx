import { type ReactNode } from 'react';

type ScoreColor = 'green' | 'yellow' | 'orange' | 'red';

function getScoreColor(score: number): ScoreColor {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

const colorClasses: Record<ScoreColor, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

const dotClasses: Record<ScoreColor, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = getScoreColor(score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colorClasses[color]} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[color]}`} />
      {score}
    </span>
  );
}

export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const strokeColors: Record<ScoreColor, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
  };
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

export function getQualityRating(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

type Severity = 'critical' | 'high' | 'medium' | 'low';

const severityClasses: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-gray-100 text-gray-600 border-gray-300',
};

const severityDotClasses: Record<Severity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-400',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${severityClasses[severity]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${severityDotClasses[severity]}`} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Pending' },
    extracting: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Extracting' },
    analyzing: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Analyzing' },
    completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    failed: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
  };
  const config = statusMap[status] ?? statusMap.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {status === 'analyzing' || status === 'extracting' ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {config.label}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{value} / {max}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function MetricCard({ label, value, sublabel, icon, accent }: { label: string; value: string | number; sublabel?: string; icon?: ReactNode; accent?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>}
        </div>
        {icon && <div className={`rounded-lg p-2 ${accent ?? 'bg-gray-100 text-gray-600'}`}>{icon}</div>}
      </div>
    </Card>
  );
}
