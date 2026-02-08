// Customer Authentication Service
// Uses PostgreSQL instead of Supabase Auth

import bcrypt from 'bcryptjs';

export const customerAuth = {
  // Sign up a new customer
  async signUp(email: string, password: string, metadata?: any) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'customer',
          ...metadata
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign up failed');

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerId', data.user?.id);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in customer
  async signIn(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign in failed');

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerId', data.user?.id);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerId');
    } catch (error) {
      throw error;
    }
  },

  // Get current customer
  async getCurrentCustomer() {
    try {
      const token = localStorage.getItem('customerToken');
      const customerId = localStorage.getItem('customerId');

      if (!token || !customerId) return null;

      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.customer;
    } catch (error) {
      console.error('Error getting current customer:', error);
      return null;
    }
  },

  // Update customer profile
  async updateProfile(customerId: string, updates: any) {
    try {
      const token = localStorage.getItem('customerToken');

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');

      return data.customer;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('customerToken');
  },

  // Get auth token
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('customerToken');
  }
};
