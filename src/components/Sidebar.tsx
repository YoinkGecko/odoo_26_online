import { Truck } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { Role, canAccess, ROLE_LABELS } from '../types';
import { cn } from '../utils/cn';

interface Props {
  role: Role;
  active: string;
  onNavigate: (key: string) => void;
}

export function Sidebar({ role, active, onNavigate }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-ink-100 flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-ink-100">
        <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center">
          <Truck className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium text-ink-900">TransitOps</div>
          <div className="text-2xs text-ink-400">Transport Operations</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {NAV_ITEMS.map((item) => {
          const accessible = canAccess(role, item.key);
          if (!accessible) return null;
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium border-r-2 border-brand-600'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-ink-100">
        <div className="text-2xs text-ink-400">Signed in as</div>
        <div className="text-2xs text-ink-600 font-medium">{ROLE_LABELS[role]}</div>
      </div>
    </aside>
  );
}
