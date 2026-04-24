/**
 * Intelligent Image Fallback System for KiFar Marketplace
 * Ensures brand integrity and prevents vendor confusion
 */

export interface FallbackOptions {
  vendorId?: string;
  vendorName?: string;
  category?: string;
  productType?: string;
}

// Vendor-specific fallback configurations
const vendorFallbacks: Record<string, {
  logo: string;
  color: string;
  fallbackImage?: string;
}> = {
  'teva-deli': {
    logo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
    color: '#2E7D32',
    fallbackImage: '/images/fallbacks/teva-deli-product.svg'
  },
  'queens-cuisine': {
    logo: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
    color: '#8B4513',
    fallbackImage: '/images/fallbacks/queens-cuisine-product.svg'
  },
  'gahn-delight': {
    logo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
    color: '#E91E63',
    fallbackImage: '/images/fallbacks/gahn-delight-product.svg'
  },
  'vop-shop': {
    logo: '/images/vendors/vop_shop_logo_village_marketplace.jpg',
    color: '#5C6BC0',
    fallbackImage: '/images/fallbacks/vop-shop-product.svg'
  },
  'people-store': {
    logo: '/images/vendors/people_store_logo_community_retail.jpg',
    color: '#1976D2',
    fallbackImage: '/images/fallbacks/people-store-product.svg'
  },
  'garden-of-light': {
    logo: '/images/vendors/Garden of Light Logo.jpg',
    color: '#00897B',
    fallbackImage: '/images/fallbacks/garden-of-light-product.svg'
  },
  'quintessence': {
    logo: '/images/vendors/quintessence_logo_placeholder.svg',
    color: '#4A148C',
    fallbackImage: '/images/fallbacks/quintessence-product.svg'
  }
};

// Category-specific fallbacks
const categoryFallbacks: Record<string, string> = {
  'meat-alternatives': '/images/fallbacks/category-meat-alternatives.svg',
  'dairy-alternatives': '/images/fallbacks/category-dairy.svg',
  'beverages': '/images/fallbacks/category-beverages.svg',
  'snacks': '/images/fallbacks/category-snacks.svg',
  'bulk-foods': '/images/fallbacks/category-bulk.svg',
  'fermented-foods': '/images/fallbacks/category-fermented.svg',
  'desserts': '/images/fallbacks/category-desserts.svg',
  'wellness': '/images/fallbacks/category-wellness.svg'
};

/**
 * Get appropriate fallback image based on context
 * Priority: Vendor-specific > Category-specific > KFAR generic
 */
export function getImageFallback(options: FallbackOptions = {}): string {
  const { vendorId, category } = options;
  
  // 1. Try vendor-specific fallback
  if (vendorId && vendorFallbacks[vendorId]?.fallbackImage) {
    return vendorFallbacks[vendorId].fallbackImage;
  }
  
  // 2. Try category-specific fallback
  if (category && categoryFallbacks[category]) {
    return categoryFallbacks[category];
  }
  
  // 3. Default to KFAR generic fallback
  return '/images/fallbacks/kfar-product-fallback.svg';
}

/**
 * Get vendor logo for fallback use (never cross-vendor)
 */
export function getVendorLogo(vendorId: string): string {
  return vendorFallbacks[vendorId]?.logo || '/images/fallbacks/kfar-logo.svg';
}

/**
 * Create data URL for dynamic fallback
 */
export function createDynamicFallback(text: string, vendorColor?: string): string {
  const color = vendorColor || '#478c0b';
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fef9ef"/>
      <rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="${color}" stroke-width="2" opacity="0.3"/>
      <text x="200" y="200" font-family="Arial" font-size="18" text-anchor="middle" fill="${color}">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Enhanced image error handler
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackOptions: FallbackOptions = {}
): void {
  const img = event.currentTarget;
  
  // Prevent infinite loop
  if (img.dataset.fallbackApplied === 'true') {
    return;
  }
  
  // Get appropriate fallback
  const fallbackSrc = getImageFallback(fallbackOptions);
  
  // Apply fallback
  img.src = fallbackSrc;
  img.dataset.fallbackApplied = 'true';
  
  // Log for debugging
  console.warn('Image failed to load:', {
    originalSrc: img.getAttribute('src'),
    fallback: fallbackSrc,
    vendor: fallbackOptions.vendorId,
    category: fallbackOptions.category
  });
}

/**
 * React hook for image fallback
 */
export function useImageFallback(
  src: string,
  fallbackOptions: FallbackOptions = {}
): [string, (e: React.SyntheticEvent<HTMLImageElement>) => void] {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageError(e, fallbackOptions);
  };
  
  return [src || getImageFallback(fallbackOptions), handleError];
}

// Export all vendor IDs for reference
export const VENDOR_IDS = Object.keys(vendorFallbacks);

// Validation function
export function isValidVendorId(vendorId: string): boolean {
  return VENDOR_IDS.includes(vendorId);
}