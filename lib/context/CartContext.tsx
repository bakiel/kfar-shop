'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity?: number;
  bulkPricing?: Array<{ quantity: number; price: number }>;
  originalPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemsByVendor: () => Record<string, CartItem[]>;
  isInCart: (id: string) => boolean;
  getQuantity: (id: string) => number;
  // Persistent shopping list — authenticated customers only (Task #3)
  loadFromServer: (accessToken: string) => Promise<void>;
  syncToServer: (accessToken: string) => Promise<void>;
  reorderFromOrder: (orderId: string, accessToken: string, mode?: 'replace' | 'merge') => Promise<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kfar-cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
      localStorage.removeItem('kfar-cart');
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('kfar-cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      // Check for bulk pricing
      let itemPrice = item.price;
      if (item.bulkPricing && item.bulkPricing.length > 0) {
        // Find the best bulk price for the quantity
        const applicableBulk = item.bulkPricing
          .filter(bulk => item.quantity >= bulk.quantity)
          .sort((a, b) => b.quantity - a.quantity)[0];
        
        if (applicableBulk) {
          itemPrice = applicableBulk.price;
        }
      }
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemsByVendor = () => {
    return items.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };

  const getQuantity = (id: string) => {
    const item = items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  // --- Persistent shopping list (Task #3) -----------------------------------
  // For authenticated customers, the cart is persisted server-side so the list
  // survives device changes. Guest carts remain localStorage-only.

  const loadFromServer = async (accessToken: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/customer/cart', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      }
    } catch (e) {
      console.warn('Cart load from server failed:', e);
    }
  };

  const syncToServer = async (accessToken: string) => {
    if (!accessToken) return;
    try {
      await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      console.warn('Cart sync to server failed:', e);
    }
  };

  const reorderFromOrder = async (
    orderId: string,
    accessToken: string,
    mode: 'replace' | 'merge' = 'replace',
  ): Promise<number> => {
    if (!accessToken) return 0;
    try {
      const res = await fetch(`/api/customer/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      const incoming: CartItem[] = Array.isArray(data.items) ? data.items : [];
      if (incoming.length === 0) return 0;

      setItems(prev => {
        if (mode === 'replace') return incoming;
        // merge: bump quantity if id already present, else append
        const map = new Map(prev.map(it => [it.id, it]));
        for (const it of incoming) {
          const existing = map.get(it.id);
          map.set(it.id, existing
            ? { ...existing, quantity: existing.quantity + it.quantity }
            : it);
        }
        return Array.from(map.values());
      });
      return incoming.length;
    } catch (e) {
      console.warn('Reorder failed:', e);
      return 0;
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getItemsByVendor,
      isInCart,
      getQuantity,
      loadFromServer,
      syncToServer,
      reorderFromOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const defaultCartContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  getItemsByVendor: () => ({}),
  isInCart: () => false,
  getQuantity: () => 0,
  loadFromServer: async () => {},
  syncToServer: async () => {},
  reorderFromOrder: async () => 0,
};

export const useCartSafe = (): CartContextType => {
  const context = useContext(CartContext);
  return context ?? defaultCartContext;
};