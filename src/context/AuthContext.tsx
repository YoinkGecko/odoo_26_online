import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Role, ROLE_LANDING } from '../types';
import { authApi } from '../api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string, role: Role) => { success: boolean; error?: { code: string; message: string } };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = 'transitops_user';
const TOKEN_KEY = 'transitops_token';

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser());

  const login = useCallback((email: string, password: string, role: Role) => {
    const res = authApi.login(email, password, role);
    if (res.success && res.data) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function landingRoute(role: Role): string {
  return ROLE_LANDING[role];
}
