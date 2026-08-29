import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthLink } from '@/components/AuthLayout';
import { Input, Button } from '@/components/ui';
import { trackEvent } from '@/lib/analytics';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      trackEvent('login');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your ReqGuard AI account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <AuthLink to="/signup">Sign up free</AuthLink>
        </p>
      </div>
    </AuthLayout>
  );
}
