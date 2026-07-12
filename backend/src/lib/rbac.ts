// RBAC permission matrix — single source of truth for backend guards.

export type ModuleKey = 'dashboard' | 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'fuel-expenses' | 'analytics' | 'settings';
export type AccessLevel = 'full' | 'view' | 'none';
export type Role = 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export const RBAC_MATRIX: Record<Role, Record<ModuleKey, AccessLevel>> = {
  FLEET_MANAGER: { dashboard: 'full', fleet: 'full', drivers: 'full', trips: 'full', maintenance: 'full', 'fuel-expenses': 'full', analytics: 'full', settings: 'full' },
  DISPATCHER: { dashboard: 'full', fleet: 'view', drivers: 'view', trips: 'full', maintenance: 'none', 'fuel-expenses': 'none', analytics: 'none', settings: 'none' },
  SAFETY_OFFICER: { dashboard: 'view', fleet: 'view', drivers: 'full', trips: 'view', maintenance: 'full', 'fuel-expenses': 'view', analytics: 'view', settings: 'none' },
  FINANCIAL_ANALYST: { dashboard: 'view', fleet: 'view', drivers: 'view', trips: 'view', maintenance: 'view', 'fuel-expenses': 'full', analytics: 'full', settings: 'none' },
};

export function accessFor(role: Role, module: ModuleKey): AccessLevel {
  return RBAC_MATRIX[role][module];
}

export function canAccess(role: Role, module: ModuleKey): boolean {
  return RBAC_MATRIX[role][module] !== 'none';
}

export function canWrite(role: Role, module: ModuleKey): boolean {
  return RBAC_MATRIX[role][module] === 'full';
}
