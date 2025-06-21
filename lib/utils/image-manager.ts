/**
 * Image Manager - Central image management for all vendors and products
 * Now uses vendor bucket manager for enhanced functionality
 */

// Re-export from vendor bucket manager for backward compatibility
export { 
  getProductImage,
  getProductImages,
  getVendorLogo,
  getVendorImagePaths,
  VENDOR_PRODUCT_IMAGES
} from './vendor-bucket-manager';

// Legacy image paths for backward compatibility
export const VENDOR_IMAGE_PATHS = {
  'teva-deli': {
    logo: '/images/vendors/teva-deli/logo/teva_deli_logo_vegan_factory.jpg',
    products: {
      'td-001': '/images/vendors/teva-deli/products/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
      'td-002': '/images/vendors/teva-deli/products/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-003': '/images/vendors/teva-deli/products/teva_deli_vegan_tofu_natural_organic_plant_based_protein_block_israeli_made.png',
      // Add more mappings as needed
    }
  },
  'queens-cuisine': {
    logo: '/images/vendors/queens-cuisine/logo/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    products: {}
  },
  'gahn-delight': {
    logo: '/images/vendors/gahn-delight/logo/gahn_delight_official_logo_master_brand_ice_cream.jpg',
    products: {}
  },
  'vop-shop': {
    logo: '/images/vendors/vop-shop/logo/vop_shop_official_logo_master_brand_village_of_peace.jpg',
    products: {}
  },
  'people-store': {
    logo: '/images/vendors/people-store/logo/people_store_logo_community_retail.jpg',
    products: {}
  },
  'garden-of-light': {
    logo: '/images/vendors/garden-of-light/logo/Garden of Light Logo.jpg',
    products: {}
  }
};

// Legacy validation function
export function validateImagePath(path: string): boolean {
  return path.startsWith('/images/') && !path.includes('undefined');
}

// Legacy fallback function
export function getFallbackImage(type: 'product' | 'vendor' = 'product'): string {
  return type === 'vendor' 
    ? '/images/placeholder-logo.jpg'
    : '/images/placeholder-product.jpg';
}
