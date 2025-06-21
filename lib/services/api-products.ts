import { Product, Vendor } from '../types/products';
import { api } from '../config/api';
import { getNumericVendorId, getStringVendorId } from '../utils/vendor-id-mapping';

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
      // Fallback to our data layer
      const { getAllProducts } = await import('../data/wordpress-style-data-layer');
      const allProducts = getAllProducts();
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
      // Fallback to mock data
      const { getProduct } = await import('../data/complete-catalog');
      return getProduct(id) || null;
    }
  },
  
  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await api.products.getFeatured();
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Fallback to our data layer
      const { getAllProducts } = await import('../data/wordpress-style-data-layer');
      return getAllProducts().filter(p => p.badge === 'hot' || p.badge === 'new').slice(0, 6);
    }
  },
  
  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await api.products.search(query);
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback to our data layer
      const { searchProducts } = await import('../data/wordpress-style-data-layer');
      return searchProducts(query);
    }
  },
  
  // Get product recommendations
  async getRecommendations(productId: string): Promise<Product[]> {
    try {
      const response = await api.products.getRecommendations(productId);
      return response.products.map(transformApiProductToProduct);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to our data layer
      const { getProduct, getAllProducts } = await import('../data/wordpress-style-data-layer');
      const product = getProduct(productId);
      if (!product) return [];
      
      return getAllProducts()
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
      // Fallback to our data layer
      const { vendorStores } = await import('../data/wordpress-style-data-layer');
      const vendors = Object.entries(vendorStores).map(([id, store]) => ({
        id,
        name: store.name,
        logo: store.logo,
        description: store.description,
        rating: store.rating || 4.5
      }));
      return { 
        vendors, 
        pagination: { total: Object.keys(vendors).length, hasMore: false } 
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
      // Fallback to our data layer
      const { vendorStores } = await import('../data/wordpress-style-data-layer');
      const store = vendorStores[id];
      if (!store) return null;
      return {
        id,
        name: store.name,
        logo: store.logo,
        description: store.description,
        rating: store.rating || 4.5
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
      // Fallback to data from our complete catalog
      const { getProductsByVendor } = await import('../data/wordpress-style-data-layer');
      const vendorProducts = getProductsByVendor(vendorId);
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
    name: apiProduct.name,
    nameHebrew: apiProduct.nameHebrew || '',
    description: apiProduct.description,
    descriptionHebrew: apiProduct.descriptionHebrew || '',
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
    nameHebrew: apiVendor.nameHebrew || '',
    description: apiVendor.description,
    descriptionHebrew: apiVendor.descriptionHebrew || '',
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