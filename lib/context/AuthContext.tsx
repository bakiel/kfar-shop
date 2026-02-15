'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  vendorId?: string;
  customerId?: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule token refresh 1 minute before expiry (14 min)
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshAuth();
    }, 14 * 60 * 1000); // 14 minutes
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        setAccessToken(null);
        return false;
      }
      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleRefresh();
      return true;
    } catch {
      setUser(null);
      setAccessToken(null);
      return false;
    }
  }, [scheduleRefresh]);

  // On mount: try to refresh from cookie
  useEffect(() => {
    const init = async () => {
      // Check if we have a stored token (for quick restore)
      const storedToken = sessionStorage.getItem('kfar_access_token');
      const storedUser = sessionStorage.getItem('kfar_user');
      if (storedToken && storedUser) {
        try {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch { /* ignore */ }
      }

      // Always try to refresh
      await refreshAuth();
      setIsLoading(false);
    };
    init();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [refreshAuth]);

  // Persist to sessionStorage for quick hydration
  useEffect(() => {
    if (accessToken && user) {
      sessionStorage.setItem('kfar_access_token', accessToken);
      sessionStorage.setItem('kfar_user', JSON.stringify(user));

      // Also set legacy localStorage keys for backward compat with existing pages
      if (user.role === 'admin') {
        localStorage.setItem('adminAuth', JSON.stringify({ email: user.email, role: user.role }));
      } else if (user.role === 'vendor') {
        localStorage.setItem('vendorAuth', JSON.stringify({ vendorId: user.vendorId, vendorName: user.displayName, name: user.displayName }));
      } else if (user.role === 'customer') {
        localStorage.setItem('customerToken', accessToken);
        localStorage.setItem('customerName', user.displayName);
        localStorage.setItem('customerId', user.customerId || '');
      }
      localStorage.setItem('userRole', user.role);
    } else {
      sessionStorage.removeItem('kfar_access_token');
      sessionStorage.removeItem('kfar_user');
    }
  }, [accessToken, user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleRefresh();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [scheduleRefresh]);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      setUser(result.user);
      setAccessToken(result.accessToken);
      scheduleRefresh();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        credentials: 'include',
      });
    } catch { /* ignore */ }

    setUser(null);
    setAccessToken(null);

    // Clear all legacy storage
    sessionStorage.removeItem('kfar_access_token');
    sessionStorage.removeItem('kfar_user');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('vendorAuth');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerId');
    localStorage.removeItem('userRole');

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
