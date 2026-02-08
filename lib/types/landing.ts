/**
 * Landing Page Types for KFAR Marketplace
 * All types are serializable (ISO strings, no Date objects)
 */

export interface LandingProduct {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface LandingVendor {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner?: string;
  productCount: number;
  categories: string[];
  rating?: number;
  reviewCount?: number;
  established?: string;
  location?: string;
  specialty?: string;
  certifications?: string[];
  topProducts: LandingProduct[];
}

export interface LandingCategory {
  id: string;
  name: string;
  nameHe?: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface FlashDeal {
  id: string;
  productId: string;
  productName: string;
  productNameHe?: string;
  productImage: string;
  vendorName: string;
  dealPrice: number;
  originalPrice: number;
  savingsPercent: number;
  stockLimit: number;
  stockRemaining: number;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  isActive: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  products: BundleProduct[];
  bundlePrice: number;
  originalPrice: number;
  savingsPercent: number;
  image: string;
  isFeatured: boolean;
  loyaltyPointsBonus: number;
  vendorId?: string;
  vendorName?: string;
}

export interface BundleProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface EnrichedBundleProduct extends BundleProduct {
  description?: string;
  descriptionHe?: string;
  nameHe?: string;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string;
  category: string;
  tags?: string[];
}

export interface EnrichedBundle extends Omit<Bundle, 'products'> {
  products: EnrichedBundleProduct[];
}

export interface Promotion {
  id: string;
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  type: 'welcome' | 'seasonal' | 'flash' | 'loyalty' | 'first_purchase' | 'founding_member';
  discountPercent?: number;
  badgeText?: string;
  badgeTextHe?: string;
  image?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
}

export interface MarketplaceStats {
  totalVendors: number;
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  yearsInBusiness: number;
}

export interface LandingPageData {
  vendors: LandingVendor[];
  featuredProducts: LandingProduct[];
  categories: LandingCategory[];
  flashDeals: FlashDeal[];
  bundles: Bundle[];
  promotions: Promotion[];
  stats: MarketplaceStats;
}
