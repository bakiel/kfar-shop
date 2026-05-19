import imageManifest from './image-manifest.json';

const manifest = imageManifest as Record<string, string>;
const fallbackImage = '/images/placeholder-product.jpg';

function warnMissingImage(path: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[image-resolver] Missing image path: ${path}`);
  }
}

export function resolveImagePath(path: string | undefined | null): string {
  if (!path) {
    return fallbackImage;
  }
  
  // Clean the path
  let cleanPath = path.trim();
  
  // If it's already a full URL, return as is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  const basename = cleanPath.split('/').pop() || cleanPath;
  const manifestHit = manifest[cleanPath] || manifest[basename] || manifest[basename.toLowerCase()];
  if (manifestHit) {
    return manifestHit;
  }

  // Common image path corrections retained for legacy vendor logo rows.
  const pathCorrections: Record<string, string> = {
    // Teva Deli logo
    '/images/vendors/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg': 
      '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
    
    // Garden of Light logo
    '/images/vendors/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg':
      '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
    
    // Queens Cuisine logo
    '/images/vendors/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg':
      '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    
    // Gahn Delight logo
    '/images/vendors/gahn_delight_official_logo_master_brand_ice_cream.jpg':
      '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',

    '/images/gahn-delight/gahn_delight_official_logo_master_brand_vegan_ice_cream.jpg':
      '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',

    '/images/people-store/people_store_official_logo_master_brand_bulk_foods_grocery.jpg':
      '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',

    '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_vegan_gourmet_catering.jpg':
      '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',

    '/images/vop-shop/vop_shop_official_logo_master_brand_community_marketplace.jpg':
      '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
    
    // VOP Shop logo
    '/images/vendors/vop_shop_official_logo_master_brand_village_of_peace.jpg':
      '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
  };
  
  // Apply corrections
  if (pathCorrections[cleanPath]) {
    return pathCorrections[cleanPath];
  }
  
  // Check for common vendor path patterns and correct them
  if (cleanPath.includes('/vendors/') && cleanPath.includes('_official_logo_')) {
    // Extract vendor name from the path
    const vendorMatch = cleanPath.match(/\/vendors\/([^_]+)_/);
    if (vendorMatch) {
      const vendorName = vendorMatch[1];
      const correctedPath = cleanPath.replace('/vendors/', `/${vendorName}/`);
      return correctedPath;
    }
  }

  warnMissingImage(cleanPath);
  return fallbackImage;
}

/**
 * Get vendor logo with fallback
 */
export function getVendorLogo(vendorId: string): string {
  const vendorLogos: Record<string, string> = {
    'teva-deli': '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
    'garden-of-light': '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
    'queens-cuisine': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    'people-store': '/images/vendors/people_store_logo_community_retail.jpg',
    'vop-shop': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
    'gahn-delight': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
  };
  
  return vendorLogos[vendorId] || '/images/logos/kfar_logo_primary_horizontal.png';
}
