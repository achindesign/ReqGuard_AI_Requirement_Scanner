import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthLink } from '@/components/AuthLayout';
import { Input, Button } from '@/components/ui';
import { trackEvent } from '@/lib/analytics';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      trackEvent('signup');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Start analyzing requirements with AI. Free plan includes 1 analysis per month.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Jane Smith"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            required
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Creating account...' : 'Create free account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </p>
      </div>
    </AuthLayout>
  );
}
