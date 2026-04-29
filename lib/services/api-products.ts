import { Product, Vendor } from '../types/products';
import { api } from '../config/api';
import { getNumericVendorId, getStringVendorId } from '../utils/vendor-id-mapping';

function localApiBase() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function transformLiveProductToProduct(product: any): Product {
  return {
    id: String(product.id),
    vendorId: product.vendorId || product.vendor_id || '',
    vendor: product.vendorName || product.vendor || '',
    name: product.name || '',
    nameHe: product.nameHe || product.name_he,
    description: product.description || '',
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice ?? product.original_price,
    image: product.image || product.images?.[0] || '/images/placeholder-product.jpg',
    images: product.images || [],
    category: product.category || 'general',
    tags: product.tags || [],
    inStock: product.inStock ?? product.in_stock ?? true,
    unit: product.unit || 'unit',
    minimumOrder: product.minimumOrder || product.minimum_order || 1,
    kosher: Boolean(product.kashrut || product.isKosher || product.is_kosher),
    vegan: product.vegan ?? product.isVegan ?? product.is_vegan ?? true,
    organic: product.organic ?? product.isOrganic ?? product.is_organic ?? false,
    glutenFree: product.glutenFree ?? product.isGlutenFree ?? product.is_gluten_free ?? false,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || product.review_count || 0,
    badge: product.badge,
    nutritionalInfo: product.nutritionalInfo || product.nutritional_info,
    allergens: product.allergens || [],
    ingredients: product.ingredients || [],
  };
}

async function fetchLiveProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${localApiBase()}/api/products-db${query ? `?${query}` : ''}`, { cache: 'no-store' });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.products || []).map(transformLiveProductToProduct);
}

async function fetchLiveVendors(params: Record<string, string> = {}): Promise<Vendor[]> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${localApiBase()}/api/vendors${query ? `?${query}` : ''}`, { cache: 'no-store' });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.vendors || []).map((vendor: any) => ({
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo || '/images/vendors/default_logo.jpg',
    banner: vendor.banner,
    description: vendor.description || '',
    rating: vendor.rating || 0,
    reviewCount: vendor.totalReviews || 0,
    categories: vendor.categories || [],
    tags: vendor.categories || [],
  }));
}

// Service for fetching products from the API
export const productService = {
  // Get all products with filtering
  async getProducts(params?: {
    category?: string;
    vendor?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    dietary?: string[];
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; pagination: any }> {
    try {
      const queryParams: Record<string, any> = {};
      
      if (params?.category) queryParams.category = params.category;
      if (params?.vendor) queryParams.vendor = params.vendor;
      if (params?.search) queryParams.search = params.search;
      if (params?.minPrice) queryParams.minPrice = params.minPrice;
      if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params?.dietary?.length) queryParams.dietary = params.dietary.join(',');
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.offset) queryParams.offset = params.offset;
      
      const response = await api.products.list(queryParams);
      
      // Transform API response to match frontend Product interface
      const products = response.products.map(transformApiProductToProduct);
      
      return {
        products,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      const allProducts = await fetchLiveProducts({
        ...(params?.category ? { category: params.category } : {}),
        ...(params?.vendor ? { vendor: params.vendor } : {}),
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.limit ? { limit: String(params.limit) } : {}),
      });
      return { 
        products: allProducts, 
        pagination: { total: allProducts.length, hasMore: false } 
      };
    }
  },
  
  // Get single product
  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = await api.products.get(id);
      return transformApiProductToProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      const response = await fetch(`${localApiBase()}/api/products/${id}`, { cache: 'no-store' });
      if (!response.ok) return null;
      return transformLiveProductToProduct(await response.json());
    }
  },
  
  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await api.products.getFeatured();
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      const products = await fetchLiveProducts({ limit: '24' });
      const featured = products.filter(product => product.badge === 'hot' || product.badge === 'new');
      return (featured.length ? featured : products).slice(0, 6);
    }
  },
  
  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await api.products.search(query);
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      return fetchLiveProducts({ search: query });
    }
  },
  
  // Get product recommendations
  async getRecommendations(productId: string): Promise<Product[]> {
    try {
      const response = await api.products.getRecommendations(productId);
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const product = await this.getProduct(productId);
      if (!product) return [];

      const products = await fetchLiveProducts({ category: product.category || '' });
      return products
        .filter(p => p.id !== productId && p.category === product.category)
        .slice(0, 4);
    }
  },
};

// Service for fetching vendors from the API
export const vendorService = {
  // Get all vendors
  async getVendors(params?: {
    category?: string;
    search?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ vendors: Vendor[]; pagination: any }> {
    try {
      const response = await api.vendors.list(params);
      
      // Transform API response to match frontend Vendor interface
      const vendors = response.vendors.map(transformApiVendorToVendor);
      
      return {
        vendors,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      const vendors = await fetchLiveVendors({
        ...(params?.category ? { category: params.category } : {}),
        ...(params?.search ? { search: params.search } : {}),
      });
      return { 
        vendors, 
        pagination: { total: vendors.length, hasMore: false }
      };
    }
  },
  
  // Get single vendor
  async getVendor(id: string): Promise<Vendor | null> {
    try {
      // Convert string ID to numeric ID for API
      const numericId = getNumericVendorId(id);
      if (!numericId) {
        console.error('Invalid vendor ID:', id);
        return null;
      }
      
      const vendor = await api.vendors.get(numericId.toString());
      return transformApiVendorToVendor(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      const response = await fetch(`${localApiBase()}/api/vendors/${id}`, { cache: 'no-store' });
      if (!response.ok) return null;
      const vendor = await response.json();
      return {
        id: vendor.id,
        name: vendor.name,
        logo: vendor.logo || '/images/vendors/default_logo.jpg',
        banner: vendor.banner,
        description: vendor.description || '',
        rating: vendor.rating || 0,
        reviewCount: vendor.totalReviews || 0,
        categories: vendor.categories || [],
        tags: vendor.categories || [],
      };
    }
  },
  
  // Get vendor products
  async getVendorProducts(vendorId: string, params?: any): Promise<{ products: Product[]; pagination: any }> {
    try {
      // Convert string ID to numeric ID for API
      const numericId = getNumericVendorId(vendorId);
      if (!numericId) {
        console.error('Invalid vendor ID:', vendorId);
        return { products: [], pagination: { total: 0, hasMore: false } };
      }
      
      const response = await api.vendors.getProducts(numericId.toString(), params);
      const products = response.products.map(transformApiProductToProduct);
      
      return {
        products,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      const vendorProducts = await fetchLiveProducts({ vendor: vendorId });
      return { 
        products: vendorProducts, 
        pagination: { total: vendorProducts.length, hasMore: false } 
      };
    }
  },
};

// Transform functions to convert API responses to frontend interfaces
function transformApiProductToProduct(apiProduct: any): Product {
  // Convert numeric vendor ID to string ID
  const vendorIdString = getStringVendorId(parseInt(apiProduct.vendorId)) || apiProduct.vendorId.toString();
  
  return {
    id: apiProduct.id.toString(),
    vendorId: vendorIdString,
    vendor: apiProduct.vendor || apiProduct.vendorName || apiProduct.vendor_name || vendorIdString,
    name: apiProduct.name,
    nameHe: apiProduct.nameHebrew || apiProduct.nameHe || '',
    description: apiProduct.description,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice,
    image: apiProduct.image || apiProduct.images?.[0] || '',
    images: apiProduct.images || [apiProduct.image],
    category: apiProduct.category || apiProduct.categories?.[0] || '',
    tags: apiProduct.tags || [],
    inStock: apiProduct.inStock ?? true,
    stockQuantity: apiProduct.stockQuantity ?? 100,
    unit: apiProduct.unit || 'unit',
    minimumOrder: apiProduct.minimumOrder || 1,
    preparationTime: apiProduct.preparationTime || '20-30 mins',
    ingredients: apiProduct.ingredients || [],
    nutritionInfo: apiProduct.nutritionInfo || null,
    allergens: apiProduct.allergens || [],
    dietaryInfo: apiProduct.dietaryInfo || {},
    isFeatured: apiProduct.isFeatured || false,
    isNew: apiProduct.isNew || false,
    bulkPricing: apiProduct.bulkPricing || null,
    rating: apiProduct.rating || 0,
    reviewCount: apiProduct.reviewCount || 0,
  };
}

function transformApiVendorToVendor(apiVendor: any): Vendor {
  // Convert numeric ID to string ID
  const vendorIdString = getStringVendorId(parseInt(apiVendor.id)) || apiVendor.id.toString();
  
  return {
    id: vendorIdString,
    name: apiVendor.name,
    description: apiVendor.description,
    logo: apiVendor.logo || '',
    banner: apiVendor.banner || '',
    rating: apiVendor.rating || 0,
    reviewCount: apiVendor.reviewCount || 0,
    minimumOrder: apiVendor.minimumOrder || 0,
    deliveryTime: apiVendor.deliveryTime || '30-45 mins',
    deliveryFee: apiVendor.deliveryFee || 0,
    categories: apiVendor.categories || [],
    cuisine: apiVendor.cuisine || [],
    dietary: apiVendor.dietary || [],
    about: apiVendor.about || apiVendor.description,
    location: apiVendor.location || {
      address: apiVendor.address || '',
      city: apiVendor.city || 'Dimona',
      region: apiVendor.region || 'South District',
    },
    contact: apiVendor.contact || {
      phone: apiVendor.phone || '',
      email: apiVendor.email || '',
      whatsapp: apiVendor.whatsapp || '',
    },
    operatingHours: apiVendor.operatingHours || [],
    paymentMethods: apiVendor.paymentMethods || ['cash', 'card'],
    socialMedia: apiVendor.socialMedia || {},
    policies: apiVendor.policies || {},
    established: apiVendor.established || 2015,
  };
}
