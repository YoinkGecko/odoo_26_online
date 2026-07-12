import { useState } from 'react';
import { Truck, AlertCircle, Lock } from 'lucide-react';
import { useAuth, landingRoute } from '../context/AuthContext';
import { Role, ROLE_LABELS } from '../types';
import { Button, Field, Input, Select } from '../components/ui';

const ROLES: Role[] = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const ROLE_INFO: Array<{ role: Role; screen: string }> = [
  { role: 'FLEET_MANAGER', screen: 'Dashboard' },
  { role: 'DISPATCHER', screen: 'Trips — Live Board' },
  { role: 'SAFETY_OFFICER', screen: 'Maintenance' },
  { role: 'FINANCIAL_ANALYST', screen: 'Analytics' },
];

const DEMO_ACCOUNTS: Array<{ email: string; role: Role }> = [
  { email: 'manager@transitops.io', role: 'FLEET_MANAGER' },
  { email: 'dispatch@transitops.io', role: 'DISPATCHER' },
  { email: 'safety@transitops.io', role: 'SAFETY_OFFICER' },
  { email: 'finance@transitops.io', role: 'FINANCIAL_ANALYST' },
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('FLEET_MANAGER');
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = login(email, password, role);
    setLoading(false);
    if (!res.success && res.error) setError(res.error);
  };

  const fillDemo = (acct: { email: string; role: Role }) => {
    setEmail(acct.email);
    setPassword('demo1234');
    setRole(acct.role);
    setError(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-canvas">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center">
              <Truck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-base font-medium text-ink-900">TransitOps</div>
              <div className="text-2xs text-ink-400">Transport Operations Platform</div>
            </div>
          </div>

          <h1 className="text-xl font-medium text-ink-900 mb-1">Sign in to your workspace</h1>
          <p className="text-sm text-ink-500 mb-6">Use your company credentials to continue.</p>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-4 bg-danger-soft border border-danger-border rounded">
              <AlertCircle className="w-4 h-4 text-danger-text shrink-0 mt-0.5" />
              <div>
                <div className="text-2xs font-medium text-danger-text">{error.code.replace(/_/g, ' ')}</div>
                <div className="text-2xs text-danger-text">{error.message}</div>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@transitops.io" required />
            </Field>
            <Field label="Password" required>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>
            <Field label="Role" required>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </Select>
            </Field>
            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full h-9">
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-ink-100">
            <div className="text-2xs text-ink-400 mb-2 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Demo accounts — click to fill
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  onClick={() => fillDemo(acct)}
                  className="text-left px-2 py-1.5 text-2xs text-ink-600 bg-white border border-ink-100 rounded hover:border-brand-300 hover:bg-brand-50"
                >
                  <div className="font-medium text-ink-800">{ROLE_LABELS[acct.role]}</div>
                  <div className="text-ink-400">{acct.email}</div>
                </button>
              ))}
            </div>
            <p className="text-2xs text-ink-400 mt-2">Password for all demo accounts: <span className="font-mono text-ink-600">demo1234</span></p>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="hidden lg:flex w-[420px] bg-brand-600 text-white p-10 flex-col justify-center">
        <h2 className="text-lg font-medium mb-1">One login, four roles</h2>
        <p className="text-sm text-brand-100 mb-8">Each role lands on its own default screen with permissions tailored to the job.</p>
        <div className="space-y-3">
          {ROLE_INFO.map(({ role: r, screen }) => (
            <div key={r} className="flex items-center justify-between py-3 border-b border-brand-500">
              <div>
                <div className="text-sm font-medium">{ROLE_LABELS[r]}</div>
                <div className="text-2xs text-brand-200">Lands on: {screen}</div>
              </div>
              <div className="text-2xs text-brand-200 px-2 py-0.5 border border-brand-500 rounded">{landingRoute(r)}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-2xs text-brand-200">
          Account locks after 5 failed attempts. Access &amp; refresh tokens rotate every 15 minutes.
        </div>
      </div>
    </div>
  );
}
