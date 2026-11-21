import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, getStoredToken, setStoredToken } from '../lib/api';
import type { UserRecord } from '../shared/types';

interface AuthContextValue {
  user: UserRecord | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserRecord>;
  signup: (name: string, email: string, password: string) => Promise<UserRecord>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<{ user: UserRecord }>('/api/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: UserRecord }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: UserRecord }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
