'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { clearAuth, getAuthUser } from '@/lib/auth';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'Squares2X2Icon', href: '/kpi-dashboard' },
  { label: 'Vehicles', icon: 'TruckIcon', href: '/vehicles' },
  { label: 'Drivers', icon: 'UserGroupIcon', href: '/drivers' },
  { label: 'Trips', icon: 'MapIcon', href: '/trip-management', badge: 3 },
  { label: 'Maintenance', icon: 'WrenchScrewdriverIcon', href: '/maintenance', badge: 2 },
  { label: 'Fuel & Expenses', icon: 'BanknotesIcon', href: '/fuel-expenses' },
  { label: 'Reports', icon: 'ChartBarIcon', href: '/reports' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeRoute: string;
}

export default function Sidebar({ collapsed, onToggle, activeRoute }: SidebarProps) {
  const router = useRouter();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuth();
    router.replace('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TO';

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!user) return false;
    if (user.role === 'Fleet Manager') return true;
    if (user.role === 'Driver') {
      return ['/kpi-dashboard', '/trip-management'].includes(item.href);
    }
    if (user.role === 'Safety Officer') {
      return ['/kpi-dashboard', '/vehicles', '/drivers', '/maintenance'].includes(item.href);
    }
    if (user.role === 'Financial Analyst') {
      return ['/kpi-dashboard', '/fuel-expenses', '/reports'].includes(item.href);
    }
    return false;
  });

  return (
    <aside
      className={`
        relative flex flex-col bg-card border-r border-border h-full flex-shrink-0
        sidebar-transition overflow-hidden
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-3 gap-3 flex-shrink-0`}>
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground text-base tracking-tight whitespace-nowrap overflow-hidden">
            TransitOps
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {/* Group label */}
        {!collapsed && (
          <p className="px-2 pb-1 pt-1 text-[11px] font-600 tracking-widest uppercase text-muted-foreground">
            Operations
          </p>
        )}
        {visibleNav.slice(0, 4).map((item) => (
          <SidebarNavItem
            key={`nav-${item.href}`}
            item={item}
            collapsed={collapsed}
            active={activeRoute === item.href || (item.href === '/kpi-dashboard' && activeRoute === '/')}
          />
        ))}
        {!collapsed && (
          <p className="px-2 pb-1 pt-3 text-[11px] font-600 tracking-widest uppercase text-muted-foreground">
            Management
          </p>
        )}
        {collapsed && <div className="h-2" />}
        {visibleNav.slice(4).map((item) => (
          <SidebarNavItem
            key={`nav-${item.href}`}
            item={item}
            collapsed={collapsed}
            active={activeRoute === item.href}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted transition-colors mb-1">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-600 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-500 text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={14} />
            </button>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center h-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={16}
          />
        </button>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-500
        transition-all duration-150
        ${active
          ? 'bg-accent text-primary font-600' :'text-secondary-foreground hover:bg-muted hover:text-foreground'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <Icon
        name={item.icon as Parameters<typeof Icon>[0]['name']}
        size={18}
        className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
      />
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {!collapsed && item.badge && item.badge > 0 ? (
        <span className="ml-auto text-[10px] font-600 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
          {item.badge}
        </span>
      ) : null}
      {collapsed && item.badge && item.badge > 0 ? (
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-[9px] font-700 bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}