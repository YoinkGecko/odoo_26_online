import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, type LucideIcon } from 'lucide-react';
import { ModuleKey } from '../types';

export interface NavItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'fleet', label: 'Fleet', icon: Truck },
  { key: 'drivers', label: 'Drivers', icon: Users },
  { key: 'trips', label: 'Trips', icon: Route },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];
