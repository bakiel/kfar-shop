// Authentication API

import { api, auth as authUtils } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'customer' | 'vendor';
  businessName?: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    vendor_id?: number;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Store token and user data
    authUtils.setToken(response.accessToken);
    authUtils.setUser(response.user);
    
    return response;
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse | { message: string; pending: boolean }> {
    const response = await api.post<any>('/auth/register', data);
    
    // If not pending, store token and user data
    if (response.accessToken) {
      authUtils.setToken(response.accessToken);
      authUtils.setUser(response.user);
    }
    
    return response;
  },

  // Register vendor with detailed info
  async registerVendor(data: any): Promise<any> {
    const response = await api.post('/auth/register-vendor', data);
    
    if (response.accessToken) {
      authUtils.setToken(response.accessToken);
      authUtils.setUser(response.user);
    }
    
    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API fails
    }
    
    authUtils.removeToken();
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return api.post('/auth/refresh', { refreshToken });
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!authUtils.getToken();
  },

  // Get current user
  getCurrentUser() {
    return authUtils.getUser();
  },
};