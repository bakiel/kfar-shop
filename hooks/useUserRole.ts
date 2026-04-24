// useUserRole Hook - Detects current user role
// Used for menu visibility and access control

import { useState, useEffect } from 'react';

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
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
    role: 'guest',
    isGuest: true,
    isCustomer: false,
    isVendor: false,
    isAdmin: false
  });

  useEffect(() => {
    // Check localStorage for tokens
    const customerToken = localStorage.getItem('customerToken');
    const vendorToken = localStorage.getItem('vendorToken');
    const adminToken = localStorage.getItem('adminToken');

    // Determine role based on tokens (priority: admin > vendor > customer > guest)
    if (adminToken) {
      setRoleInfo({
        role: 'admin',
        isGuest: false,
        isCustomer: false,
        isVendor: false,
        isAdmin: true,
        userId: 'admin-001',
        userName: 'Admin User'
      });
    } else if (vendorToken) {
      // Parse vendor info from token if needed
      const vendorInfo = localStorage.getItem('vendorInfo');
      const vendorData = vendorInfo ? JSON.parse(vendorInfo) : null;
      
      setRoleInfo({
        role: 'vendor',
        isGuest: false,
        isCustomer: false,
        isVendor: true,
        isAdmin: false,
        userId: vendorData?.id || 'vendor-001',
        userName: vendorData?.name || 'Vendor User'
      });
    } else if (customerToken) {
      // Parse customer info from token if needed
      const customerInfo = localStorage.getItem('customerInfo');
      const customerData = customerInfo ? JSON.parse(customerInfo) : null;
      
      setRoleInfo({
        role: 'customer',
        isGuest: false,
        isCustomer: true,
        isVendor: false,
        isAdmin: false,
        userId: customerData?.id || 'customer-001',
        userName: customerData?.name || 'Customer User'
      });
    } else {
      setRoleInfo({
        role: 'guest',
        isGuest: true,
        isCustomer: false,
        isVendor: false,
        isAdmin: false
      });
    }
  }, []);

  return roleInfo;
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
  const { isVendor } = useUserRole();

  useEffect(() => {
    if (isVendor) {
      fetch('/api/vendor/orders?limit=1', {
        headers: { 'Authorization': `Bearer ${typeof window !== 'undefined' ? sessionStorage.getItem('kfar_access_token') || '' : ''}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.summary?.total) setOrderCount(data.summary.total); })
        .catch(() => {});
    }
  }, [isVendor]);

  return orderCount;
}