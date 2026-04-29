// Retired archive stubs. Archived landing experiments must not import the
// legacy static catalog at runtime.

export interface EnhancedProduct {
  id: string;
  name: string;
  nameHe?: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  vendorId?: string;
  vendorName?: string;
  tags?: string[];
  [key: string]: any;
}

export interface VendorStore {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  products?: EnhancedProduct[];
  categories?: string[];
  [key: string]: any;
}

export const TOTAL_PRODUCTS = 0;
export const VENDOR_COUNT = 0;

export function getFeaturedProducts(): EnhancedProduct[] {
  return [];
}

export function getVendors(): VendorStore[] {
  return [];
}

export function getProductsByVendor(): EnhancedProduct[] {
  return [];
}

export function getProductsByCategory(): EnhancedProduct[] {
  return [];
}

export function getTopCategories(): Array<{ id: string; name: string; count: number }> {
  return [];
}

export function getVendorStore(): VendorStore | undefined {
  return undefined;
}
