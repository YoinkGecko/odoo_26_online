import { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS, ModuleKey, MODULE_LABELS } from '../types';
import { Badge } from './ui';

interface Props {
  module: ModuleKey;
  onLogout: () => void;
}

const roleToneMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
};

export function TopBar({ module, onLogout }: Props) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) return null;
  const roleColor = roleToneMap[ROLE_COLORS[user.role]];

  return (
    <header className="h-14 bg-white border-b border-ink-100 flex items-center gap-4 px-4 sticky top-0 z-20">
      <div className="text-sm text-ink-400">
        <span className="text-ink-600 font-medium">{MODULE_LABELS[module]}</span>
      </div>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
        <input
          placeholder="Search vehicles, drivers, trips…"
          className="w-full h-8 pl-8 pr-3 text-sm bg-ink-50 border border-transparent rounded focus:outline-none focus:bg-white focus:border-ink-100"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-700 font-medium">{user.name}</span>
          <Badge tone={roleColor}>{ROLE_LABELS[user.role]}</Badge>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-medium hover:bg-brand-200"
          >
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-ink-100 rounded py-1">
                <div className="px-3 py-2 border-b border-ink-50">
                  <div className="text-sm text-ink-800 font-medium">{user.name}</div>
                  <div className="text-2xs text-ink-400">{user.email}</div>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
