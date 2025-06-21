// API Configuration
// Use internal Next.js API routes instead of external API
export const API_BASE_URL = '/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    profile: `${API_BASE_URL}/auth/profile`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  
  // Products
  products: {
    list: `${API_BASE_URL}/products-enhanced`,
    detail: (id: string) => `${API_BASE_URL}/products-enhanced/${id}`,
    search: `${API_BASE_URL}/products-enhanced/search`,
    featured: `${API_BASE_URL}/products-enhanced/featured`,
    recommendations: (id: string) => `${API_BASE_URL}/products-enhanced/${id}/recommendations`,
  },
  
  // Vendors
  vendors: {
    list: `${API_BASE_URL}/vendors`,
    detail: (id: string) => `${API_BASE_URL}/vendors/${id}`,
    products: (id: string) => `${API_BASE_URL}/vendors/${id}/products`,
    reviews: (id: string) => `${API_BASE_URL}/vendors/${id}/reviews`,
  },
  
  // Cart
  cart: {
    get: `${API_BASE_URL}/cart`,
    addItem: `${API_BASE_URL}/cart/items`,
    updateItem: (id: string) => `${API_BASE_URL}/cart/items/${id}`,
    removeItem: (id: string) => `${API_BASE_URL}/cart/items/${id}`,
    clear: `${API_BASE_URL}/cart/clear`,
    sync: `${API_BASE_URL}/cart/sync`,
  },
  
  // Orders
  orders: {
    create: `${API_BASE_URL}/orders`,
    list: `${API_BASE_URL}/orders`,
    detail: (id: string) => `${API_BASE_URL}/orders/${id}`,
    cancel: (id: string) => `${API_BASE_URL}/orders/${id}/cancel`,
  },
  
  // QR Payments
  qr: {
    generate: `${API_BASE_URL}/qr/generate`,
    verify: `${API_BASE_URL}/qr/verify`,
  },
  
  // AI Features
  ai: {
    search: `${API_BASE_URL}/ai/search`,
    recommendations: `${API_BASE_URL}/ai/recommendations`,
    chat: `${API_BASE_URL}/ai/chat`,
  },
};

// Fetch wrapper with auth
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// API client methods
export const api = {
  // Products
  products: {
    list: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiFetch(`${API_ENDPOINTS.products.list}${queryString}`);
    },
    get: (id: string) => apiFetch(API_ENDPOINTS.products.detail(id)),
    search: (query: string) => apiFetch(`${API_ENDPOINTS.products.search}?q=${encodeURIComponent(query)}`),
    getFeatured: () => apiFetch(API_ENDPOINTS.products.featured),
    getRecommendations: (id: string) => apiFetch(API_ENDPOINTS.products.recommendations(id)),
  },
  
  // Vendors
  vendors: {
    list: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiFetch(`${API_ENDPOINTS.vendors.list}${queryString}`);
    },
    get: (id: string) => apiFetch(API_ENDPOINTS.vendors.detail(id)),
    getProducts: (id: string, params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiFetch(`${API_ENDPOINTS.vendors.products(id)}${queryString}`);
    },
    getReviews: (id: string, params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiFetch(`${API_ENDPOINTS.vendors.reviews(id)}${queryString}`);
    },
  },
  
  // Cart
  cart: {
    get: () => apiFetch(API_ENDPOINTS.cart.get),
    addItem: (productId: string, quantity: number = 1) => 
      apiFetch(API_ENDPOINTS.cart.addItem, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    updateItem: (id: string, quantity: number) =>
      apiFetch(API_ENDPOINTS.cart.updateItem(id), {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (id: string) =>
      apiFetch(API_ENDPOINTS.cart.removeItem(id), {
        method: 'DELETE',
      }),
    clear: () =>
      apiFetch(API_ENDPOINTS.cart.clear, {
        method: 'DELETE',
      }),
    sync: (items: any[]) =>
      apiFetch(API_ENDPOINTS.cart.sync, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
  },
  
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiFetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: any) =>
      apiFetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiFetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      }),
    getProfile: () => apiFetch(API_ENDPOINTS.auth.profile),
  },
  
  // Orders
  orders: {
    create: (data: any) =>
      apiFetch(API_ENDPOINTS.orders.create, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiFetch(`${API_ENDPOINTS.orders.list}${queryString}`);
    },
    get: (id: string) => apiFetch(API_ENDPOINTS.orders.detail(id)),
    cancel: (id: string) =>
      apiFetch(API_ENDPOINTS.orders.cancel(id), {
        method: 'POST',
      }),
  },
  
  // QR
  qr: {
    generate: (orderId: string) =>
      apiFetch(API_ENDPOINTS.qr.generate, {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      }),
    verify: (code: string) =>
      apiFetch(API_ENDPOINTS.qr.verify, {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  },
  
  // AI
  ai: {
    search: (query: string) =>
      apiFetch(API_ENDPOINTS.ai.search, {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
    getRecommendations: (userId?: string) =>
      apiFetch(API_ENDPOINTS.ai.recommendations, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    chat: (message: string, context?: any) =>
      apiFetch(API_ENDPOINTS.ai.chat, {
        method: 'POST',
        body: JSON.stringify({ message, context }),
      }),
  },
};