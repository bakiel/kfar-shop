// Storage configuration for handling images - Local version (no Supabase)

// Always use local images
export const USE_SUPABASE_IMAGES = false;

// Storage bucket names (kept for compatibility but not used)
export const STORAGE_BUCKETS = {
  VENDOR_LOGOS: 'vendor-logos',
  VENDOR_BANNERS: 'vendor-banners',
  PRODUCT_IMAGES: 'product-images',
  USER_AVATARS: 'user-avatars',
  COMMUNITY_IMAGES: 'community-images'
} as const;

// Get the correct image URL (always local)
export function getImageUrl(imagePath: string | null | undefined, bucket?: keyof typeof STORAGE_BUCKETS): string {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Always use local images
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

// Helper to get vendor logo URL
export function getVendorLogoUrl(logoPath: string | null | undefined): string {
  return getImageUrl(logoPath);
}

// Helper to get product image URL
export function getProductImageUrl(imagePath: string | null | undefined): string {
  return getImageUrl(imagePath);
}

// Helper to get community image URL
export function getCommunityImageUrl(imagePath: string | null | undefined): string {
  return getImageUrl(imagePath);
}

// Get multiple product images
export function getProductImagesUrls(images: string[] | null | undefined): string[] {
  if (!images || images.length === 0) return [];
  return images.map(img => getProductImageUrl(img));
}