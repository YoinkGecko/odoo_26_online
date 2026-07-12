import { useState } from 'react';
import { Card, CardHeader, Field, Input, Select, Button, Badge } from '../components/ui';
import { Role, ModuleKey, RBAC_MATRIX, ROLE_LABELS, MODULE_LABELS, AccessLevel } from '../types';

const ROLES: Role[] = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const MODULES: ModuleKey[] = ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'fuel-expenses', 'analytics', 'settings'];

const accessTone: Record<AccessLevel, 'success' | 'info' | 'neutral'> = { full: 'success', view: 'info', none: 'neutral' };
const accessLabel: Record<AccessLevel, string> = { full: 'Full', view: 'View', none: '—' };

export function Settings() {
  const [settings, setSettings] = useState({ depotName: 'Nairobi Central Depot', currency: 'USD', distanceUnit: 'km' });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist locally for the demo
    localStorage.setItem('transitops_settings', JSON.stringify(settings));
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500 mt-0.5">Workspace configuration and role-based access control.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="General Settings" subtitle="Workspace defaults" />
          <form onSubmit={save} className="space-y-3 mt-2">
            <Field label="Depot Name"><Input value={settings.depotName} onChange={(e) => setSettings({ ...settings, depotName: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency"><Select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="KES">KES (KSh)</option><option value="GBP">GBP (£)</option></Select></Field>
              <Field label="Distance Unit"><Select value={settings.distanceUnit} onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value })}><option value="km">Kilometers (km)</option><option value="mi">Miles (mi)</option></Select></Field>
            </div>
            <Button type="submit" variant="primary" size="md">Save Changes</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Account" subtitle="Session info" />
          <div className="space-y-2 text-sm">
            <Row label="Platform" value="TransitOps v1.0" />
            <Row label="Database" value="PostgreSQL + Prisma" />
            <Row label="Token TTL" value="15 minutes (access)" />
            <Row label="Rate Limit" value="100 req / 15 min (5 / min on login)" />
            <Row label="Audit Logging" value="Enabled" />
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-4 pb-2"><CardHeader title="RBAC Permission Matrix" subtitle="Roles × modules — full / view-only / none" /></div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left font-medium text-2xs uppercase tracking-wide text-ink-500 px-3 py-2">Role</th>
                {MODULES.map((m) => (
                  <th key={m} className="text-center font-medium text-2xs uppercase tracking-wide text-ink-500 px-3 py-2">{MODULE_LABELS[m]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  <td className="px-3 py-2.5 font-medium text-ink-800">{ROLE_LABELS[role]}</td>
                  {MODULES.map((m) => (
                    <td key={m} className="px-3 py-2.5 text-center">
                      <Badge tone={accessTone[RBAC_MATRIX[role][m]]}>{accessLabel[RBAC_MATRIX[role][m]]}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-ink-50 flex items-center gap-4 text-2xs text-ink-500">
          <span className="flex items-center gap-1.5"><Badge tone="success">Full</Badge> read + write</span>
          <span className="flex items-center gap-1.5"><Badge tone="info">View</Badge> read-only</span>
          <span className="flex items-center gap-1.5"><Badge tone="neutral">—</Badge> no access</span>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-ink-50 last:border-0">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-800 font-medium">{value}</span>
    </div>
  );
}
