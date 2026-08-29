import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, CreditCard, LogOut } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { PLAN_LIMITS } from '@/types';

export function AccountPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user!.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const planLimits = PLAN_LIMITS[profile?.plan ?? 'free'];

  return (
    <AppLayout>
      <PageHeader title="Account" subtitle="Manage your profile and account settings." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          </div>
          <div className="mt-4 space-y-4">
            <Input
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your name"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-400">Email cannot be changed here.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved!</span>}
            </div>
          </div>
        </Card>

        {/* Plan */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="mt-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan</p>
                  <p className="mt-1 text-xl font-bold capitalize text-gray-900">{profile?.plan ?? 'free'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Monthly limit</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {planLimits.analyses === 999999 ? 'Unlimited' : planLimits.analyses}
                  </p>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500">
                  Requirements per document: {planLimits.requirements === 999999 ? 'Unlimited' : planLimits.requirements}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Analyses used this month: {profile?.analyses_used ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                Change plan
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">Sign out</h3>
          <p className="mt-1 text-sm text-gray-500">Sign out of your account on this device.</p>
          <div className="mt-4">
            <Button variant="danger" onClick={handleSignOut}>
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
