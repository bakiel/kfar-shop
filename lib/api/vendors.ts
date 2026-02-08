// Vendors API

import { api } from './client';
import { Vendor } from '@/lib/data/products';

export interface VendorsQuery {
  category?: string;
  status?: 'active' | 'pending' | 'suspended' | 'inactive';
  search?: string;
}

export interface ApiVendor {
  id: string;
  user_id?: number;
  business_name: string;
  description?: string;
  category?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  logo?: string;
  banner_image?: string;
  delivery_options?: string[];
  payment_methods?: string[];
  minimum_order?: number;
  status: string;
  product_count?: number;
  average_rating?: number;
  review_count?: number;
  operating_hours?: any[];
  created_at: string;
  updated_at: string;
}

// Convert API vendor to frontend Vendor interface
function convertApiVendor(apiVendor: ApiVendor): Vendor {
  return {
    id: apiVendor.id,
    businessName: apiVendor.business_name,
    businessNameHe: apiVendor.business_name, // TODO: Add Hebrew name to API
    description: apiVendor.description || '',
    descriptionHe: apiVendor.description || '', // TODO: Add Hebrew description
    logo: apiVendor.logo || '/images/vendors/default-logo.jpg',
    bannerImage: apiVendor.banner_image || '/images/vendors/default-banner.jpg',
    category: apiVendor.category || 'other',
    rating: apiVendor.average_rating || 0,
    reviewCount: apiVendor.review_count || 0,
    productCount: apiVendor.product_count || 0,
    deliveryOptions: apiVendor.delivery_options || ['pickup'],
    paymentMethods: apiVendor.payment_methods || ['cash'],
    minimumOrder: apiVendor.minimum_order || 0,
    operatingHours: apiVendor.operating_hours || {},
    contactInfo: {
      phone: apiVendor.contact_phone || '',
      email: apiVendor.contact_email || '',
      address: apiVendor.address || '',
      city: apiVendor.city || 'Dimona',
    },
    socialMedia: {},
    certifications: [],
    specialties: [],
    createdAt: apiVendor.created_at,
    updatedAt: apiVendor.updated_at,
  };
}

export const vendorsApi = {
  // Get all vendors
  async getVendors(query?: VendorsQuery): Promise<Vendor[]> {
    const queryString = new URLSearchParams(
      Object.entries(query || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const endpoint = `/vendors${queryString ? `?${queryString}` : ''}`;
    const vendors = await api.get<ApiVendor[]>(endpoint);
    
    return vendors.map(convertApiVendor);
  },

  // Get single vendor
  async getVendor(id: string): Promise<Vendor> {
    const vendor = await api.get<ApiVendor>(`/vendors/${id}`);
    return convertApiVendor(vendor);
  },

  // Get vendor profile (for logged-in vendor)
  async getMyProfile(): Promise<ApiVendor> {
    return api.get('/vendors/profile/me');
  },

  // Update vendor profile (vendor only)
  async updateProfile(data: Partial<ApiVendor>): Promise<{ message: string }> {
    return api.put('/vendors/profile/me', data);
  },

  // Upload vendor logo
  async uploadLogo(file: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/profile/logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload logo');
    }

    return response.json();
  },

  // Upload vendor banner
  async uploadBanner(file: File): Promise<{ banner: string }> {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/profile/banner`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload banner');
    }

    return response.json();
  },

  // Get vendor statistics (vendor only)
  async getStats(): Promise<any> {
    return api.get('/vendors/profile/stats');
  },

  // Update vendor status (admin only)
  async updateStatus(id: string, status: string): Promise<{ message: string }> {
    return api.put(`/vendors/${id}/status`, { status });
  },

  // Delete vendor (admin only)
  async deleteVendor(id: string): Promise<{ message: string }> {
    return api.delete(`/vendors/${id}`);
  },

  // Get active vendors
  async getActiveVendors(): Promise<Vendor[]> {
    return this.getVendors({ status: 'active' });
  },

  // Search vendors
  async searchVendors(query: string): Promise<Vendor[]> {
    return this.getVendors({ search: query });
  },

  // Get vendors by category
  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return this.getVendors({ category });
  },
};