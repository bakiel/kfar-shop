/**
 * WordPress-Style Data Management Layer for KiFar Marketplace
 * PERFECTED VERSION - All vendors properly integrated
 */

import { Product } from '@/lib/types/product';
import { tevaDeliCompleteProducts } from './teva-deli-complete-catalog';
import queensCuisineData from './queens-cuisine-complete-catalog.json';
import gahnDelightData from './gahn-delight-complete-catalog.json';
import vopShopData from './vop-shop-complete-catalog.json';
import peopleStoreData from './people-store-complete-catalog.json';
import gardenOfLightData from './garden-of-light-complete-catalog.json';

// Enhanced Product type with all vendor fields
export interface EnhancedProduct extends Product {
  viewCount?: number;
  purchaseCount?: number;
  popularityScore?: number;
  lastUpdated?: Date;
  status?: 'published' | 'draft' | 'archived';
  version?: number;
  publishedAt?: Date;
  updatedAt?: Date;
}

// Enhanced vendor store structure
export interface VendorStore {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner?: string;
  products: EnhancedProduct[];
  categories: string[];
  featured: boolean;
  metadata: {
    established?: string;
    location?: string;
    specialty?: string;
    certifications?: string[];
  };
  productCount?: number;
  analytics?: {
    totalViews?: number;
    totalSales?: number;
    averageRating?: number;
    reviewCount?: number;
  };
  imageBuckets?: {
    logo?: string;
    banner?: string;
    products?: string[];
    paths?: string[];
  };
}

// Complete vendor stores with all products properly threaded
export const vendorStores: Record<string, VendorStore> = {
  'teva-deli': {
    id: 'teva-deli',
    name: 'Teva Deli',
    slug: 'teva-deli',
    description: 'Premium vegan deli products made with traditional Israeli recipes and modern plant-based techniques.',
    logo: '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
    banner: '/images/vendors/teva-deli/banner.jpg',
    products: tevaDeliCompleteProducts as EnhancedProduct[],
    categories: ['schnitzels', 'burgers', 'shawarma', 'kebabs', 'tofu', 'seitan'],
    featured: true,
    metadata: {
      established: '2015',
      location: 'Village of Peace, Dimona',
      specialty: 'Plant-based meat alternatives',
      certifications: ['Kosher Parve', 'Vegan Certified']
    }
  },
  
  'garden-of-light': {
    id: 'garden-of-light',
    name: 'Garden of Light',
    slug: 'garden-of-light',
    description: 'Artisanal vegan spreads, cheeses, and gourmet products crafted with love and fresh ingredients.',
    logo: '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
    banner: '/images/vendors/garden-of-light/banner.jpg',
    products: gardenOfLightData.products as EnhancedProduct[],
    categories: ['spreads', 'cheeses', 'salads', 'chocolates'],
    featured: true,
    metadata: {
      established: '2018',
      location: 'Village of Peace, Dimona',
      specialty: 'Vegan spreads and cheeses',
      certifications: ['Kosher Parve', 'Organic']
    }
  },
  
  'queens-cuisine': {
    id: 'queens-cuisine',
    name: "Queen's Cuisine",
    slug: 'queens-cuisine',
    description: 'Gourmet plant-based meat alternatives and ready-to-eat meals for the conscious food lover.',
    logo: '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    banner: '/images/vendors/queens-cuisine/banner.jpg',
    products: queensCuisineData.products as EnhancedProduct[],
    categories: ['burgers', 'kebabs', 'meatballs', 'seitan', 'ready-meals'],
    featured: true,
    metadata: {
      established: '2019',
      location: 'Village of Peace, Dimona',
      specialty: 'Gourmet vegan meat alternatives',
      certifications: ['Kosher Parve']
    }
  },
  
  'gahn-delight': {
    id: 'gahn-delight',
    name: 'Gahn Delight',
    slug: 'gahn-delight',
    description: 'Handcrafted vegan ice creams and frozen desserts made with natural ingredients and creative flavors.',
    logo: '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
    banner: '/images/vendors/gahn-delight/banner.jpg',
    products: gahnDelightData.products as EnhancedProduct[],
    categories: ['ice-cream', 'sorbet', 'parfait', 'popsicles'],
    featured: true,
    metadata: {
      established: '2020',
      location: 'Village of Peace, Dimona',
      specialty: 'Vegan frozen desserts',
      certifications: ['Kosher Parve', 'Natural Ingredients']
    }
  },
  
  'vop-shop': {
    id: 'vop-shop',
    name: 'Village of Peace Shop',
    slug: 'vop-shop',
    description: 'Official Village of Peace merchandise store featuring custom t-shirts, hoodies, mugs, and branded accessories.',
    logo: '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
    banner: '/images/vendors/vop-shop/banner.jpg',
    products: vopShopData.products as EnhancedProduct[],
    categories: ['apparel', 'mugs', 'accessories', 'home-decor'],
    featured: true,
    metadata: {
      established: '2021',
      location: 'Village of Peace, Dimona',
      specialty: 'Custom apparel & branded merchandise',
      certifications: ['Fair Trade', 'Community Made']
    }
  },
  
  'people-store': {
    id: 'people-store',
    name: "People's Store",
    slug: 'people-store',
    description: 'Community grocery offering bulk foods, pantry essentials, and specialty vegan products.',
    logo: '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
    banner: '/images/vendors/people-store/banner.jpg',
    products: peopleStoreData.products as EnhancedProduct[],
    categories: ['bulk-foods', 'pantry', 'snacks', 'beverages'],
    featured: true,
    metadata: {
      established: '2017',
      location: 'Village of Peace, Dimona',
      specialty: 'Bulk foods and pantry essentials',
      certifications: ['Kosher', 'Organic Options']
    }
  }
};

// Helper functions for data access
export function getAllProducts(): EnhancedProduct[] {
  return Object.values(vendorStores).flatMap(vendor => 
    vendor.products.map(product => ({
      ...product,
      vendorName: product.vendorName || vendor.name // Ensure vendorName is always present
    }))
  );
}

export function getProductsByVendor(vendorId: string): EnhancedProduct[] {
  const vendor = vendorStores[vendorId];
  if (!vendor) return [];
  
  return vendor.products.map(product => ({
    ...product,
    vendorName: product.vendorName || vendor.name // Ensure vendorName is always present
  }));
}

export function getVendorStore(vendorId: string): VendorStore | undefined {
  return vendorStores[vendorId];
}

export function getProductById(productId: string): EnhancedProduct | undefined {
  for (const vendor of Object.values(vendorStores)) {
    const product = vendor.products.find(p => p.id === productId);
    if (product) {
      return {
        ...product,
        vendorName: product.vendorName || vendor.name // Ensure vendorName is always present
      };
    }
  }
  return undefined;
}

export function getProductsByCategory(category: string): EnhancedProduct[] {
  return getAllProducts().filter(p => p.category === category);
}

export function getFeaturedProducts(limit: number = 12): EnhancedProduct[] {
  return getAllProducts()
    .filter(p => p.featured || p.badge)
    .slice(0, limit);
}

export function searchProducts(query: string): EnhancedProduct[] {
  const searchTerm = query.toLowerCase();
  return getAllProducts().filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.description?.toLowerCase().includes(searchTerm) ||
    p.category?.toLowerCase().includes(searchTerm) ||
    p.vendorName?.toLowerCase().includes(searchTerm)
  );
}

// Export vendor count for stats
export const VENDOR_COUNT = Object.keys(vendorStores).length;
export const TOTAL_PRODUCTS = getAllProducts().length;
