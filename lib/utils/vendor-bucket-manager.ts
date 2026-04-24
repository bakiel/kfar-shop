/**
 * Vendor Bucket Image Management System
 * 
 * Provides WordPress-style media management with vendor-specific buckets
 * and intelligent image organization
 */

// Import actual image paths
import { ACTUAL_IMAGE_PATHS, getProductImagePath, getVendorLogoPath } from './actual-image-paths';

export interface ImageBucket {
  vendorId: string;
  bucketName: string;
  basePath: string;
  allowedTypes: string[];
  maxSize?: number;
}

export interface VendorImageBuckets {
  logo: ImageBucket;
  banners: ImageBucket;
  products: ImageBucket;
  gallery: ImageBucket;
  certificates: ImageBucket;
  team: ImageBucket;
  promotional: ImageBucket;
  storefront: ImageBucket;
}

export interface ImageAsset {
  id: string;
  vendorId: string;
  bucket: string;
  filename: string;
  path: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    uploadedAt?: Date;
    modifiedAt?: Date;
  };
}

// Vendor bucket configurations
export const VENDOR_BUCKET_CONFIG: Record<string, VendorImageBuckets> = {
  'teva-deli': {
    logo: {
      vendorId: 'teva-deli',
      bucketName: 'logo',
      basePath: '/images/vendors/teva-deli/logo',
      allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    banners: {
      vendorId: 'teva-deli',
      bucketName: 'banners',
      basePath: '/images/vendors/teva-deli/banners',
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    products: {
      vendorId: 'teva-deli',
      bucketName: 'products',
      basePath: '/images/vendors/teva-deli/products',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    gallery: {
      vendorId: 'teva-deli',
      bucketName: 'gallery',
      basePath: '/images/vendors/teva-deli/gallery',
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 8 * 1024 * 1024 // 8MB
    },
    certificates: {
      vendorId: 'teva-deli',
      bucketName: 'certificates',
      basePath: '/images/vendors/teva-deli/certificates',
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    team: {
      vendorId: 'teva-deli',
      bucketName: 'team',
      basePath: '/images/vendors/teva-deli/team',
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    promotional: {
      vendorId: 'teva-deli',
      bucketName: 'promotional',
      basePath: '/images/vendors/teva-deli/promotional',
      allowedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
      maxSize: 50 * 1024 * 1024 // 50MB
    },
    storefront: {
      vendorId: 'teva-deli',
      bucketName: 'storefront',
      basePath: '/images/vendors/teva-deli/storefront',
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 8 * 1024 * 1024 // 8MB
    }
  },
  // Add configurations for other vendors...
};

// Image organization functions
export function getVendorBucket(vendorId: string, bucketName: keyof VendorImageBuckets): ImageBucket | null {
  const vendorBuckets = VENDOR_BUCKET_CONFIG[vendorId];
  return vendorBuckets ? vendorBuckets[bucketName] : null;
}

export function getImagePath(vendorId: string, bucket: keyof VendorImageBuckets, filename: string): string {
  // Special handling for logos - they're in the parent vendors directory
  if (bucket === 'logo') {
    return `/images/vendors/${filename}`;
  }
  
  const bucketConfig = getVendorBucket(vendorId, bucket);
  if (!bucketConfig) {
    console.warn(`Bucket ${bucket} not found for vendor ${vendorId}`);
    return `/images/placeholder.jpg`;
  }
  
  return `${bucketConfig.basePath}/${filename}`;
}

export function getProductImageSet(vendorId: string, productId: string): {
  primary: string;
  gallery: string[];
  thumbnails: string[];
  lifestyle?: string[];
} {
  const basePath = `/images/vendors/${vendorId}/products`;
  
  return {
    primary: `${basePath}/${productId}_main.jpg`,
    gallery: [
      `${basePath}/${productId}_main.jpg`,
      `${basePath}/${productId}_angle1.jpg`,
      `${basePath}/${productId}_angle2.jpg`,
      `${basePath}/${productId}_detail.jpg`
    ].filter(path => checkImageExists(path)),
    thumbnails: [
      `${basePath}/${productId}_thumb.jpg`
    ],
    lifestyle: [
      `${basePath}/${productId}_lifestyle1.jpg`,
      `${basePath}/${productId}_lifestyle2.jpg`
    ].filter(path => checkImageExists(path))
  };
}

// Placeholder function - in production, this would check actual file existence
function checkImageExists(path: string): boolean {
  // For now, return true for main images, false for others
  return path.includes('_main') || !path.includes('_');
}

// Image metadata management
export function generateImageMetadata(file: File): Partial<ImageAsset['metadata']> {
  return {
    size: file.size,
    format: file.type,
    uploadedAt: new Date(),
    modifiedAt: new Date()
  };
}

// SEO-friendly image naming
export function generateSEOFilename(originalName: string, vendorId: string, productName?: string): string {
  // Remove extension
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  // Clean and format
  let seoName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add vendor prefix
  seoName = `${vendorId}-${seoName}`;
  
  // Add product name if provided
  if (productName) {
    const cleanProductName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    seoName = `${vendorId}-${cleanProductName}-${seoName}`;
  }
  
  // Get extension
  const ext = originalName.split('.').pop() || 'jpg';
  
  return `${seoName}.${ext}`;
}

// Image optimization settings
export const IMAGE_OPTIMIZATION_CONFIG = {
  products: {
    main: { width: 800, height: 800, quality: 85 },
    gallery: { width: 1200, height: 1200, quality: 90 },
    thumbnail: { width: 300, height: 300, quality: 80 },
    lifestyle: { width: 1600, height: 1000, quality: 85 }
  },
  banners: {
    desktop: { width: 1920, height: 600, quality: 85 },
    mobile: { width: 768, height: 400, quality: 80 }
  },
  logos: {
    standard: { width: 400, height: 400, quality: 90 },
    small: { width: 150, height: 150, quality: 85 }
  }
};

// Vendor-specific image mappings (backward compatibility)
export const VENDOR_PRODUCT_IMAGES: Record<string, Record<string, string>> = {
  'teva-deli': {
    'td-001': 'teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
    'td-002': 'teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg',
    'td-003': 'teva_deli_vegan_tofu_natural_organic_plant_based_protein_block_israeli_made.png',
    // ... rest of mappings
  },
  'queens-cuisine': {
    'qc-001': 'queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg',
    // ... rest of mappings
  },
  // ... other vendors
};

// Helper function to get product image with fallback
export function getProductImage(vendorId: string, productId: string): string {
  // Use the actual image paths from the file system
  return getProductImagePath(vendorId, productId);
}

// Get all images for a product
export function getProductImages(vendorId: string, productId: string): string[] {
  const mainImage = getProductImage(vendorId, productId);
  const imageSet = getProductImageSet(vendorId, productId);
  
  // Combine and deduplicate
  const allImages = [mainImage, ...imageSet.gallery, ...(imageSet.lifestyle || [])];
  return [...new Set(allImages)];
}

// Get vendor logo with fallback
export function getVendorLogo(vendorId: string): string {
  const logos: Record<string, string> = {
    'teva-deli': 'teva_deli_logo_vegan_factory.jpg',
    'queens-cuisine': 'queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    'gahn-delight': 'gahn_delight_official_logo_master_brand_ice_cream.jpg',
    'vop-shop': 'vop_shop_official_logo_master_brand_village_of_peace.jpg',
    'people-store': 'people_store_logo_community_retail.jpg',
    'garden-of-light': 'Garden of Light Logo.jpg'
  };
  
  const logoFile = logos[vendorId];
  // Logos are in the parent vendors directory, not in subdirectories
  return logoFile ? `/images/vendors/${logoFile}` : '/images/placeholder-logo.jpg';
}

// Export all bucket paths for a vendor
export function getVendorImagePaths(vendorId: string): Record<string, string> {
  const buckets = VENDOR_BUCKET_CONFIG[vendorId];
  if (!buckets) return {};
  
  const paths: Record<string, string> = {};
  for (const [bucketName, bucket] of Object.entries(buckets)) {
    paths[bucketName] = bucket.basePath;
  }
  
  return paths;
}