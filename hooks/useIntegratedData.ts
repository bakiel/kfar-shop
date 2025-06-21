// Custom hook for integrated data management
import { useState, useEffect, useCallback } from 'react';
import { IntegratedProduct } from '@/lib/services/data-integration';
import { Customer } from '@/lib/services/customer-analytics';
import { Tag } from '@/lib/services/tag-manager';

interface UseIntegratedDataOptions {
  customerId?: string;
  autoTrack?: boolean;
}

export function useIntegratedData(options: UseIntegratedDataOptions = {}) {
  const { customerId, autoTrack = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product operations
  const getProduct = useCallback(async (productId: string): Promise<IntegratedProduct | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'product',
        id: productId,
        ...(customerId && autoTrack ? { customerId } : {})
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId, autoTrack]);

  // Get products by vendor
  const getVendorProducts = useCallback(async (vendorId: string): Promise<IntegratedProduct[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'vendor-products',
        id: vendorId
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch vendor products: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get products by tags
  const getProductsByTags = useCallback(async (tags: string[]): Promise<IntegratedProduct[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'products-by-tags',
        tags: tags.join(',')
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products by tags: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get personalized recommendations
  const getRecommendations = useCallback(async (
    context?: { currentProduct?: string; category?: string }
  ): Promise<IntegratedProduct[]> => {
    if (!customerId) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'recommendations',
        customerId,
        ...(context?.currentProduct ? { currentProduct: context.currentProduct } : {}),
        ...(context?.category ? { category: context.category } : {})
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Track product view
  const trackView = useCallback(async (productId: string, source?: 'web' | 'app' | 'qr' | 'nfc') => {
    if (!autoTrack) return;
    
    try {
      await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-view',
          data: { productId, customerId, source: source || 'web' }
        })
      });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, [customerId, autoTrack]);

  // Track add to cart
  const trackAddToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!autoTrack || !customerId) return;
    
    try {
      await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-cart',
          data: { productId, customerId, quantity }
        })
      });
    } catch (err) {
      console.error('Failed to track cart add:', err);
    }
  }, [customerId, autoTrack]);

  // Track purchase
  const trackPurchase = useCallback(async (
    orderId: string,
    items: { productId: string; quantity: number; price: number }[]
  ): Promise<{ orderQR?: any } | null> => {
    if (!customerId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-purchase',
          data: { orderId, customerId, items }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to track purchase: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Scan QR code
  const scanQR = useCallback(async (code: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan-qr',
          data: { code, scannerId: customerId }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to scan QR: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Generate QR code
  const generateQR = useCallback(async (
    type: string,
    data: any,
    options?: any
  ): Promise<{ id: string; code: string; url: string; image?: string } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-qr',
          data: { type, qrData: data, options }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate QR: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get customer data
  const getCustomer = useCallback(async (id?: string): Promise<Customer | null> => {
    const targetId = id || customerId;
    if (!targetId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'customer',
        id: targetId
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Tag entity
  const tagEntity = useCallback(async (
    entityId: string,
    entityType: 'product' | 'vendor' | 'customer' | 'order' | 'ticket',
    tags: string[]
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tag-entity',
          data: { entityId, entityType, tags, taggedBy: customerId }
        })
      });
      
      return response.ok;
    } catch (err) {
      console.error('Failed to tag entity:', err);
      return false;
    }
  }, [customerId]);

  // Get trending tags
  const getTrendingTags = useCallback(async (
    category?: string,
    limit: number = 10
  ): Promise<Tag[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'trending-tags',
        limit: limit.toString(),
        ...(category ? { category } : {})
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending tags: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics
  const getAnalytics = useCallback(async (period: string = 'month'): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'analytics',
        period
      });
      
      const response = await fetch(`/api/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Product operations
    getProduct,
    getVendorProducts,
    getProductsByTags,
    getRecommendations,
    
    // Tracking
    trackView,
    trackAddToCart,
    trackPurchase,
    
    // QR operations
    scanQR,
    generateQR,
    
    // Customer operations
    getCustomer,
    
    // Tagging
    tagEntity,
    getTrendingTags,
    
    // Analytics
    getAnalytics
  };
}

// Specialized hook for product pages
export function useProductData(productId: string, customerId?: string) {
  const [product, setProduct] = useState<IntegratedProduct | null>(null);
  const [recommendations, setRecommendations] = useState<IntegratedProduct[]>([]);
  
  const { getProduct, getRecommendations, trackView, loading, error } = useIntegratedData({
    customerId,
    autoTrack: true
  });

  useEffect(() => {
    const loadProductData = async () => {
      const productData = await getProduct(productId);
      if (productData) {
        setProduct(productData);
        
        // Get recommendations based on current product
        if (customerId) {
          const recs = await getRecommendations({
            currentProduct: productId,
            category: productData.category
          });
          setRecommendations(recs);
        }
      }
    };

    loadProductData();
  }, [productId, customerId]);

  return {
    product,
    recommendations,
    loading,
    error
  };
}

// Specialized hook for vendor pages
export function useVendorData(vendorId: string) {
  const [products, setProducts] = useState<IntegratedProduct[]>([]);
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  
  const { getVendorProducts, getTrendingTags, loading, error } = useIntegratedData();

  useEffect(() => {
    const loadVendorData = async () => {
      const vendorProducts = await getVendorProducts(vendorId);
      setProducts(vendorProducts);
      
      // Get trending tags for this vendor's products
      const tags = await getTrendingTags('product', 20);
      setTrendingTags(tags);
    };

    loadVendorData();
  }, [vendorId]);

  return {
    products,
    trendingTags,
    loading,
    error
  };
}