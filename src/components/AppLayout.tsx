import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, FilePlus, Clock, CreditCard, User, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/new-analysis', label: 'New Analysis', icon: <FilePlus size={18} /> },
  { to: '/usage', label: 'Usage', icon: <Clock size={18} /> },
  { to: '/pricing', label: 'Pricing', icon: <CreditCard size={18} /> },
  { to: '/account', label: 'Account', icon: <User size={18} /> },
  { to: '/help', label: 'Help', icon: <HelpCircle size={18} /> },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-gray-900" />
            <span className="text-lg font-bold tracking-tight text-gray-900">ReqGuard AI</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
              <p className="truncate text-xs text-gray-500 capitalize">{profile?.plan ?? 'free'} plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-gray-900" />
          <span className="text-base font-bold text-gray-900">ReqGuard AI</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[57px] z-20 bg-gray-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <nav className="space-y-1 bg-white p-3">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
