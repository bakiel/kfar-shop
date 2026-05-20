'use client';

// useUserRole Hook - Detects current user role
// Used for menu visibility and access control

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

export type UserRole = 'guest' | 'customer' | 'vendor' | 'admin';

export interface UserRoleInfo {
  role: UserRole;
  isGuest: boolean;
  isCustomer: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  userId?: string;
  userName?: string;
}

export function useUserRole(): UserRoleInfo {
  const { user, isAuthenticated, isLoading } = useAuth();

  return useMemo(() => {
    const role: UserRole = !isLoading && isAuthenticated && user ? user.role : 'guest';
    const userId = user?.customerId || user?.vendorId || user?.id;

    return {
      role,
      isGuest: role === 'guest',
      isCustomer: role === 'customer',
      isVendor: role === 'vendor',
      isAdmin: role === 'admin',
      userId,
      userName: user?.displayName,
    };
  }, [isAuthenticated, isLoading, user]);
}

// Helper function to check if user has access to a specific route
export function hasAccess(role: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    customer: 1,
    vendor: 2,
    admin: 3
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

// Helper to get pending order count for vendors
export function useVendorOrderCount(): number {
  const [orderCount, setOrderCount] = useState(0);
  const { accessToken } = useAuth();
  const { isVendor } = useUserRole();

  useEffect(() => {
    if (!isVendor || !accessToken) {
      setOrderCount(0);
      return;
    }

    const controller = new AbortController();

    fetch('/api/vendor/orders?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!controller.signal.aborted) {
          setOrderCount(Number(data?.summary?.total || 0));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setOrderCount(0);
      });

    return () => controller.abort();
  }, [isVendor, accessToken]);

  return orderCount;
}
