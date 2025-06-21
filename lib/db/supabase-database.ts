/**
 * Supabase Database Service for KFAR Marketplace
 * Replaces raw PostgreSQL with Supabase client
 */

import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Vendor, Product } from './schema';

// Helper to get the right client based on context
function getClient(isAdmin = false) {
  if (typeof window === 'undefined' || isAdmin) {
    // Server-side or admin operations
    return supabaseAdmin;
  }
  // Client-side operations
  return supabase;
}

// Database query helper with logging
export async function query<T = any>(
  tableName: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  params?: any
): Promise<{ data: T[] | T | null; error: any }> {
  const start = Date.now();
  const client = getClient(params?.admin);
  
  try {
    let result;
    
    switch (operation) {
      case 'select':
        result = await client.from(tableName).select(params?.select || '*');
        break;
      case 'insert':
        result = await client.from(tableName).insert(params.data).select();
        break;
      case 'update':
        result = await client.from(tableName).update(params.data).eq('id', params.id).select();
        break;
      case 'delete':
        result = await client.from(tableName).delete().eq('id', params.id);
        break;
    }
    
    const duration = Date.now() - start;
    console.log('Executed Supabase query', { table: tableName, operation, duration });
    
    return result;
  } catch (error) {
    console.error('Supabase query error:', error);
    return { data: null, error };
  }
}

// Vendor CRUD operations
export const vendorDb = {
  // Get all vendors
  async getAll(filters?: {
    status?: string;
    featured?: boolean;
    verified?: boolean;
  }): Promise<Vendor[]> {
    const client = getClient();
    let query = client.from('vendors').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    
    return data || [];
  },

  // Get vendor by ID
  async getById(id: string): Promise<Vendor | null> {
    const client = getClient();
    const { data, error } = await client
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
    
    return data;
  },

  // Create vendor (admin only)
  async create(vendor: Partial<Vendor>): Promise<Vendor | null> {
    const client = getClient(true); // Use admin client
    
    // Convert camelCase to snake_case for database
    const dbVendor = {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      email: vendor.email,
      phone: vendor.phone,
      logo_url: vendor.logoUrl,
      banner_url: vendor.bannerUrl,
      primary_color: vendor.primaryColor,
      secondary_color: vendor.secondaryColor,
      accent_color: vendor.accentColor,
      description: vendor.description,
      short_description: vendor.shortDescription,
      established_year: vendor.establishedYear,
      location: vendor.location,
      address: vendor.address,
      status: vendor.status || 'pending',
      verified: vendor.verified || false,
      featured: vendor.featured || false,
    };
    
    const { data, error } = await client
      .from('vendors')
      .insert(dbVendor)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating vendor:', error);
      return null;
    }
    
    return data;
  },

  // Update vendor (admin only)
  async update(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const client = getClient(true); // Use admin client
    
    // Convert camelCase to snake_case
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    
    const { data, error } = await client
      .from('vendors')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor:', error);
      return null;
    }
    
    return data;
  },

  // Delete vendor (admin only)
  async delete(id: string): Promise<boolean> {
    const client = getClient(true); // Use admin client
    const { error } = await client
      .from('vendors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }
    
    return true;
  },

  // Get vendor analytics
  async getAnalytics(vendorId: string, startDate: Date, endDate: Date) {
    const client = getClient();
    const { data, error } = await client
      .from('vendor_analytics')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date');
    
    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
    
    return data || [];
  }
};

// Product CRUD operations
export const productDb = {
  // Get all products
  async getAll(filters?: {
    vendorId?: string;
    category?: string;
    status?: string;
    inStock?: boolean;
    search?: string;
  }): Promise<Product[]> {
    const client = getClient();
    let query = client.from('products').select('*');
    
    if (filters?.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    // Convert snake_case to camelCase
    return (data || []).map(convertProductFromDb);
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data ? convertProductFromDb(data) : null;
  },

  // Create product (vendor only)
  async create(product: Partial<Product>): Promise<Product | null> {
    const client = getClient(true); // Use admin client for now
    
    const dbProduct = convertProductToDb(product);
    
    const { data, error } = await client
      .from('products')
      .insert(dbProduct)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return null;
    }
    
    return convertProductFromDb(data);
  },

  // Update product (vendor only)
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const client = getClient(true); // Use admin client for now
    
    const dbUpdates = convertProductToDb(updates);
    delete dbUpdates.id; // Don't update ID
    
    const { data, error } = await client
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    
    return convertProductFromDb(data);
  },

  // Delete product (vendor only)
  async delete(id: string): Promise<boolean> {
    const client = getClient(true); // Use admin client for now
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    return true;
  },

  // Update stock
  async updateStock(productId: string, quantity: number): Promise<void> {
    const client = getClient(true);
    const { error } = await client
      .from('products')
      .update({
        stock_quantity: quantity,
        in_stock: quantity > 0
      })
      .eq('id', productId);
    
    if (error) {
      console.error('Error updating stock:', error);
    }
  },

  // Track product view
  async trackView(productId: string): Promise<void> {
    const client = getClient();
    
    // Update view count
    await client.rpc('increment_product_views', { product_id: productId });
    
    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    await client
      .from('product_analytics')
      .upsert({
        product_id: productId,
        date: today,
        views: 1
      }, {
        onConflict: 'product_id,date',
        count: 'exact'
      });
  }
};

// Helper functions to convert between camelCase and snake_case
function convertProductFromDb(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    vendorId: dbProduct.vendor_id,
    sku: dbProduct.sku,
    slug: dbProduct.slug,
    name: dbProduct.name,
    nameHe: dbProduct.name_he,
    description: dbProduct.description,
    shortDescription: dbProduct.short_description,
    longDescription: dbProduct.long_description,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    tags: dbProduct.tags,
    price: parseFloat(dbProduct.price),
    originalPrice: dbProduct.original_price ? parseFloat(dbProduct.original_price) : undefined,
    cost: dbProduct.cost ? parseFloat(dbProduct.cost) : undefined,
    currency: dbProduct.currency,
    inStock: dbProduct.in_stock,
    stockQuantity: dbProduct.stock_quantity,
    trackInventory: dbProduct.track_inventory,
    lowStockThreshold: dbProduct.low_stock_threshold,
    primaryImage: dbProduct.primary_image,
    imageGallery: dbProduct.image_gallery,
    thumbnails: dbProduct.thumbnails,
    videoUrls: dbProduct.video_urls,
    status: dbProduct.status,
    isFeatured: dbProduct.is_featured,
    isVegan: dbProduct.is_vegan,
    isKosher: dbProduct.is_kosher,
    isOrganic: dbProduct.is_organic,
    isGlutenFree: dbProduct.is_gluten_free,
    viewCount: dbProduct.view_count,
    purchaseCount: dbProduct.purchase_count,
    wishlistCount: dbProduct.wishlist_count,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    publishedAt: dbProduct.published_at ? new Date(dbProduct.published_at) : undefined,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
  };
}

function convertProductToDb(product: Partial<Product>): any {
  const dbProduct: any = {};
  
  if (product.id !== undefined) dbProduct.id = product.id;
  if (product.vendorId !== undefined) dbProduct.vendor_id = product.vendorId;
  if (product.sku !== undefined) dbProduct.sku = product.sku;
  if (product.slug !== undefined) dbProduct.slug = product.slug;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.nameHe !== undefined) dbProduct.name_he = product.nameHe;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.price !== undefined) dbProduct.price = product.price;
  if (product.originalPrice !== undefined) dbProduct.original_price = product.originalPrice;
  if (product.inStock !== undefined) dbProduct.in_stock = product.inStock;
  if (product.stockQuantity !== undefined) dbProduct.stock_quantity = product.stockQuantity;
  if (product.primaryImage !== undefined) dbProduct.primary_image = product.primaryImage;
  if (product.imageGallery !== undefined) dbProduct.image_gallery = product.imageGallery;
  if (product.status !== undefined) dbProduct.status = product.status;
  if (product.isVegan !== undefined) dbProduct.is_vegan = product.isVegan;
  if (product.isKosher !== undefined) dbProduct.is_kosher = product.isKosher;
  if (product.tags !== undefined) dbProduct.tags = product.tags;
  
  return dbProduct;
}

// Audit logging
export async function logAudit(
  vendorId: string,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  changes?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const client = getClient(true);
  const { error } = await client
    .from('vendor_audit_log')
    .insert({
      vendor_id: vendorId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  
  if (error) {
    console.error('Error logging audit:', error);
  }
}

// Initialize database (check connection)
export async function initializeDatabase(): Promise<void> {
  try {
    const { data, error } = await getClient().from('vendors').select('count').limit(1);
    
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase database');
  } catch (error) {
    console.error('Failed to initialize Supabase database:', error);
    throw error;
  }
}

// Export the same interface as the old database.ts
export { query, vendorDb, productDb, logAudit, initializeDatabase };