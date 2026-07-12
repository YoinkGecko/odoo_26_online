import type {
  AuthUser,
  DashboardKPIs,
  Driver,
  ExpenseLog,
  FuelLog,
  MaintenanceLog,
  StatusBreakdown,
  Trip,
  UtilizationPoint,
  Vehicle,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('transitops_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(err.message || 'Request failed', res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => apiFetch<{ user: AuthUser }>('/auth/me'),
  },

  vehicles: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return apiFetch<Vehicle[]>(`/vehicles${qs}`);
    },
    create: (data: Partial<Vehicle>) =>
      apiFetch<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Vehicle>) =>
      apiFetch<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/vehicles/${id}`, { method: 'DELETE' }),
  },

  drivers: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return apiFetch<Driver[]>(`/drivers${qs}`);
    },
    create: (data: Partial<Driver>) =>
      apiFetch<Driver>('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Driver>) =>
      apiFetch<Driver>(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    suspend: (id: string) => apiFetch<Driver>(`/drivers/${id}/suspend`, { method: 'PATCH' }),
    reactivate: (id: string) => apiFetch<Driver>(`/drivers/${id}/reactivate`, { method: 'PATCH' }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/drivers/${id}`, { method: 'DELETE' }),
  },

  trips: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return apiFetch<Trip[]>(`/trips${qs}`);
    },
    create: (data: Record<string, unknown>) =>
      apiFetch<Trip>('/trips', { method: 'POST', body: JSON.stringify(data) }),
    dispatch: (id: string) => apiFetch<Trip>(`/trips/${id}/dispatch`, { method: 'POST' }),
    complete: (id: string, data?: { finalOdometer?: number; fuelConsumed?: number }) =>
      apiFetch<Trip>(`/trips/${id}/complete`, { method: 'POST', body: JSON.stringify(data || {}) }),
    cancel: (id: string) => apiFetch<Trip>(`/trips/${id}/cancel`, { method: 'POST' }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/trips/${id}`, { method: 'DELETE' }),
  },

  maintenance: {
    list: () => apiFetch<MaintenanceLog[]>('/maintenance'),
    create: (data: Record<string, unknown>) =>
      apiFetch<MaintenanceLog>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch<MaintenanceLog>(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    close: (id: string) => apiFetch<MaintenanceLog>(`/maintenance/${id}/close`, { method: 'PATCH' }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/maintenance/${id}`, { method: 'DELETE' }),
  },

  fuelLogs: {
    list: () => apiFetch<FuelLog[]>('/fuel-logs'),
    create: (data: Record<string, unknown>) =>
      apiFetch<FuelLog>('/fuel-logs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch<FuelLog>(`/fuel-logs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/fuel-logs/${id}`, { method: 'DELETE' }),
  },

  expenses: {
    list: () => apiFetch<ExpenseLog[]>('/expenses'),
    create: (data: Record<string, unknown>) =>
      apiFetch<ExpenseLog>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch<ExpenseLog>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<{ success: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
  },

  dashboard: {
    kpis: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return apiFetch<DashboardKPIs>(`/dashboard/kpis${qs}`);
    },
    vehicleStatusBreakdown: () => apiFetch<StatusBreakdown[]>('/dashboard/vehicle-status-breakdown'),
    utilizationTrend: (days = 14) =>
      apiFetch<UtilizationPoint[]>(`/dashboard/utilization-trend?days=${days}`),
  },
};
