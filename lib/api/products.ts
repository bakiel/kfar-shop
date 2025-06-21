// Products API

import { api } from './client';
import { Product } from '@/lib/data/products';

export interface ProductsQuery {
  category?: string;
  vendor_id?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'created_at' | 'price' | 'name_en' | 'average_rating';
  order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  dietary_info?: string;
}

export interface ApiProduct {
  id: string;
  vendor_id: string;
  name_en: string;
  name_he?: string;
  name_ar?: string;
  name_ru?: string;
  description_en: string;
  description_he?: string;
  description_ar?: string;
  description_ru?: string;
  price: number;
  unit: string;
  category: string;
  images: string[];
  dietary_info: string[];
  tags: string[];
  hardware_tags: string[];
  stock_quantity: number;
  average_rating?: number;
  review_count?: number;
  vendor_name?: string;
  vendor_logo?: string;
  created_at: string;
  updated_at: string;
}

// Convert API product to frontend Product interface
function convertApiProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    vendorId: apiProduct.vendor_id,
    nameEn: apiProduct.name_en,
    nameHe: apiProduct.name_he || apiProduct.name_en,
    descriptionEn: apiProduct.description_en,
    descriptionHe: apiProduct.description_he || apiProduct.description_en,
    price: apiProduct.price,
    unit: apiProduct.unit,
    category: apiProduct.category,
    images: apiProduct.images,
    tags: apiProduct.tags,
    dietaryInfo: apiProduct.dietary_info,
    stockStatus: apiProduct.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
    featured: apiProduct.tags?.includes('featured') || false,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at,
  };
}

export const productsApi = {
  // Get all products
  async getProducts(query?: ProductsQuery): Promise<Product[]> {
    const queryString = new URLSearchParams(
      Object.entries(query || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const products = await api.get<ApiProduct[]>(endpoint);
    
    return products.map(convertApiProduct);
  },

  // Get single product
  async getProduct(id: string): Promise<Product & { reviews?: any[] }> {
    const product = await api.get<ApiProduct & { reviews?: any[] }>(`/products/${id}`);
    return {
      ...convertApiProduct(product),
      reviews: product.reviews,
    };
  },

  // Create product (vendor only)
  async createProduct(data: FormData): Promise<{ id: string; message: string }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: data, // FormData for file upload
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    return response.json();
  },

  // Update product (vendor only)
  async updateProduct(id: string, data: any): Promise<{ message: string }> {
    return api.put(`/products/${id}`, data);
  },

  // Update product images (vendor only)
  async updateProductImages(id: string, formData: FormData): Promise<{ images: string[] }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update images');
    }

    return response.json();
  },

  // Delete product (vendor only)
  async deleteProduct(id: string): Promise<{ message: string }> {
    return api.delete(`/products/${id}`);
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.getProducts({ 
      tags: 'featured',
      limit,
      sort: 'created_at',
      order: 'DESC' 
    });
  },

  // Get products by vendor
  async getVendorProducts(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendor_id: vendorId });
  },

  // Get products by category
  async getCategoryProducts(category: string): Promise<Product[]> {
    return this.getProducts({ category });
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  },

  // AI enhance product description
  async enhanceProduct(id: string): Promise<{ enhanced: any }> {
    return api.post(`/products/${id}/enhance`);
  },
};