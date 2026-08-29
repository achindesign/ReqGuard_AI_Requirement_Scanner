import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { Input, Button } from '@/components/ui';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reset password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              If an account exists for {email}, a password reset link has been sent. Check your inbox.
            </div>
            <Link
              to="/login"
              className="block text-center text-sm font-medium text-gray-900 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              required
            />
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
