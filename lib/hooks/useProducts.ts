/**
 * React Hook for fetching products from the API
 * Replaces static data imports with dynamic API calls
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/config';
import { Product } from '@/lib/types/product';

interface UseProductsOptions {
  vendor?: string;
  category?: string;
  search?: string;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options?: UseProductsOptions): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.products.getAll(options);
      
      if (response.success && response.products) {
        setProducts(response.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [options?.vendor, options?.category, options?.search]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}

// Hook for single product
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.products.getById(productId);
        
        if (response.success && response.product) {
          setProduct(response.product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return { product, loading, error };
}

// Hook for vendor products
export function useVendorProducts(vendorId: string) {
  return useProducts({ vendor: vendorId });
}