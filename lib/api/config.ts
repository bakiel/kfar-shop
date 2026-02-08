/**
 * API Configuration for KFAR Marketplace
 * Connects Next.js frontend to Express backend
 */

// API base URL - uses environment variable or defaults to local
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Products
  products: {
    getAll: '/products',
    getById: (id: string) => `/products/${id}`,
    getByVendor: (vendorId: string) => `/products/vendor/${vendorId}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  
  // Vendors
  vendors: {
    getAll: '/vendors',
    getById: (id: string) => `/vendors/${id}`,
    create: '/vendors',
    update: (id: string) => `/vendors/${id}`,
  },
  
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verify: '/auth/verify',
  },
  
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  
  // Orders
  orders: {
    create: '/orders',
    getAll: '/orders',
    getById: (id: string) => `/orders/${id}`,
    update: (id: string) => `/orders/${id}`,
  },
  
  // QR Codes
  qr: {
    generate: '/qr/generate',
  },
  
  // Health check
  health: '/health',
};

// Fetch wrapper with common configuration
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Convenience methods
export const api = {
  // Products
  products: {
    async getAll(params?: { vendor?: string; category?: string; search?: string }) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(API_ENDPOINTS.products.getAll + queryString);
    },
    
    async getById(id: string) {
      return apiFetch(API_ENDPOINTS.products.getById(id));
    },
    
    async getByVendor(vendorId: string) {
      return apiFetch(API_ENDPOINTS.products.getByVendor(vendorId));
    },
  },
  
  // Vendors
  vendors: {
    async getAll() {
      return apiFetch(API_ENDPOINTS.vendors.getAll);
    },
    
    async getById(id: string) {
      return apiFetch(API_ENDPOINTS.vendors.getById(id));
    },
  },
  
  // Health check
  async health() {
    return apiFetch(API_ENDPOINTS.health);
  },
};