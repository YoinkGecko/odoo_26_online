import type { UserRole } from "@prisma/client";

export type ApiPermission = "full" | "view" | "none";

export type ModuleKey =
  | "dashboard"
  | "fleet"
  | "drivers"
  | "trips"
  | "maintenance"
  | "fuel"
  | "analytics"
  | "settings";

export const ROLE_PERMISSIONS: Record<UserRole, Record<ModuleKey, ApiPermission>> = {
  FLEET_MANAGER: {
    dashboard: "full", fleet: "full", drivers: "full", trips: "full",
    maintenance: "full", fuel: "full", analytics: "full", settings: "full",
  },
  DISPATCHER: {
    dashboard: "view", fleet: "view", drivers: "view", trips: "full",
    maintenance: "view", fuel: "view", analytics: "view", settings: "none",
  },
  SAFETY_OFFICER: {
    dashboard: "view", fleet: "view", drivers: "full", trips: "view",
    maintenance: "full", fuel: "view", analytics: "view", settings: "none",
  },
  FINANCIAL_ANALYST: {
    dashboard: "view", fleet: "view", drivers: "view", trips: "view",
    maintenance: "view", fuel: "full", analytics: "full", settings: "none",
  },
};

export function roleDisplayName(role: UserRole): string {
  const map: Record<UserRole, string> = {
    FLEET_MANAGER: "Fleet Manager",
    DISPATCHER: "Dispatcher",
    SAFETY_OFFICER: "Safety Officer",
    FINANCIAL_ANALYST: "Financial Analyst",
  };
  return map[role];
}

export function roleFromDisplayName(name: string): UserRole | null {
  const map: Record<string, UserRole> = {
    "Fleet Manager": "FLEET_MANAGER",
    Dispatcher: "DISPATCHER",
    "Safety Officer": "SAFETY_OFFICER",
    "Financial Analyst": "FINANCIAL_ANALYST",
  };
  return map[name] ?? null;
}

export function emailForRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    FLEET_MANAGER: "fleet@transitops.co",
    DISPATCHER: "dispatcher@transitops.co",
    SAFETY_OFFICER: "safety@transitops.co",
    FINANCIAL_ANALYST: "finance@transitops.co",
  };
  return map[role];
}
