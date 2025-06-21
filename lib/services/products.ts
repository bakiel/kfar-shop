// Product service using backend API
import { productsApi } from '@/lib/api/products';
import { vendorsApi } from '@/lib/api/vendors';
import { Product as ApiProduct } from '@/lib/data/products';

export type Vendor = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
};

export type Product = {
  id: string;
  vendor_id: string;
  vendor?: Vendor;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  image_url?: string;
  images?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  tags?: string[];
  created_at?: string;
};

// Convert API product to service product
function convertToServiceProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    vendor_id: apiProduct.vendorId,
    name: apiProduct.nameEn,
    description: apiProduct.descriptionEn,
    price: apiProduct.price,
    currency: 'ILS',
    category: apiProduct.category,
    image_url: apiProduct.images?.[0],
    images: apiProduct.images,
    is_active: apiProduct.stockStatus !== 'out_of_stock',
    is_featured: apiProduct.featured,
    tags: apiProduct.tags,
    created_at: apiProduct.createdAt,
  };
}

// Get all active products with vendor info
export async function getProducts(): Promise<Product[]> {
  try {
    const apiProducts = await productsApi.getProducts();
    return apiProducts.map(convertToServiceProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock data if API fails
    const { products: localProducts } = await import('@/lib/data/products');
    return localProducts.filter(p => p.is_active !== false);
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const apiProduct = await productsApi.getProduct(id);
    return convertToServiceProduct(apiProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get products by vendor
export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  try {
    const apiProducts = await productsApi.getVendorProducts(vendorId);
    return apiProducts.map(convertToServiceProduct);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const apiProducts = await productsApi.getCategoryProducts(category);
    return apiProducts.map(convertToServiceProduct);
  } catch (error) {
    console.error('Error fetching category products:', error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const apiProducts = await productsApi.getFeaturedProducts(8);
    return apiProducts.map(convertToServiceProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const apiProducts = await productsApi.searchProducts(query);
    return apiProducts.map(convertToServiceProduct);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Get all vendors
export async function getVendors(): Promise<Vendor[]> {
  try {
    const apiVendors = await vendorsApi.getActiveVendors();
    return apiVendors.map(v => ({
      id: v.id,
      name: v.businessName,
      slug: v.businessName.toLowerCase().replace(/\s+/g, '-'),
      logo_url: v.logo,
      description: v.description,
      category: v.category,
      is_active: true,
    }));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

// Get vendor by ID
export async function getVendorById(id: string): Promise<Vendor | null> {
  try {
    const apiVendor = await vendorsApi.getVendor(id);
    return {
      id: apiVendor.id,
      name: apiVendor.businessName,
      slug: apiVendor.businessName.toLowerCase().replace(/\s+/g, '-'),
      logo_url: apiVendor.logo,
      description: apiVendor.description,
      category: apiVendor.category,
      is_active: true,
    };
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

// Get vendor by slug
export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  // Since our API doesn't support slug lookup, fetch all and find
  const vendors = await getVendors();
  const vendor = vendors.find(v => v.slug === slug);
  return vendor || null;
}

// Format product image (ensure full URL)
export function formatProductImage(product: Product): Product {
  // Prepend API URL if image paths are relative
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  return {
    ...product,
    image_url: product.image_url?.startsWith('http') 
      ? product.image_url 
      : `${apiUrl}${product.image_url}`,
    images: product.images?.map(img => 
      img.startsWith('http') ? img : `${apiUrl}${img}`
    ),
  };
}