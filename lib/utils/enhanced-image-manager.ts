/**
 * Enhanced Image Management System with Vendor Buckets
 * Each vendor has segregated storage for all image types
 */

// Define image types for each vendor bucket
export interface VendorImageBucket {
  logo: string;
  banner: string;
  storefront?: string;
  products: Record<string, string>;
  gallery?: string[];
  certificates?: string[];
  team?: string[];
  promotional?: string[];
}

// Complete vendor image buckets with all assets
export const VENDOR_IMAGE_BUCKETS: Record<string, VendorImageBucket> = {
  'teva-deli': {
    logo: '/images/vendors/teva-deli/logo/teva_deli_logo_vegan_factory.jpg',
    banner: '/images/vendors/teva-deli/banners/teva_deli_banner_plant_based_factory.jpg',
    storefront: '/images/vendors/teva-deli/storefront/teva_deli_factory_entrance.jpg',
    products: {
      // Schnitzels
      'td-001': '/images/vendors/teva-deli/products/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
      'td-028': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_28_burger_schnitzel_plant_based_deli.jpg',
      'td-025': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_25_burger_schnitzel_plant_based_deli.jpg',
      'td-030': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_30_burger_schnitzel_plant_based_deli.jpg',
      'td-009': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_09_plant_based_meat_alternative_israeli_cuisine.jpg',
      // Specialty Items
      'td-002': '/images/vendors/teva-deli/products/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-006': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_06_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-014': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_14_seitan_tofu_based_protein_alternative.jpg',
      'td-019': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_19_seitan_tofu_based_protein_alternative.jpg',
      // Tofu & Seitan
      'td-003': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_03_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-005': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_05_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-033': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_33_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-012': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_12_seitan_tofu_based_protein_alternative.jpg',
      'td-011': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_13_seitan_tofu_based_protein_alternative.jpg',
      'td-015': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_15_seitan_tofu_based_protein_alternative.jpg',
      'td-041': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_41_shawarma_kebab_middle_eastern_plant_based.jpg',
      // Ready Meals
      'td-004': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_04_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-008': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_08_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-010': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_10_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-017': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_17_seitan_tofu_based_protein_alternative.jpg',
      'td-018': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_18_seitan_tofu_based_protein_alternative.jpg',
      'td-037': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_37_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-038': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_38_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-042': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_42_shawarma_kebab_middle_eastern_plant_based.jpg',
      // Burgers
      'td-021': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg',
      'td-022': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_22_burger_schnitzel_plant_based_deli.jpg',
      'td-023': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_23_burger_schnitzel_plant_based_deli.jpg',
      'td-026': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_26_burger_schnitzel_plant_based_deli.jpg',
      'td-027': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_27_burger_schnitzel_plant_based_deli.jpg',
      'td-029': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_29_burger_schnitzel_plant_based_deli.jpg',
      // Sausages
      'td-013': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_11_seitan_tofu_based_protein_alternative.jpg',
      'td-031': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_31_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-016': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_16_seitan_tofu_based_protein_alternative.jpg',
      'td-043': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_43_shawarma_kebab_middle_eastern_plant_based.jpg',
      // Kebabs
      'td-032': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_32_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-034': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_34_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-036': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_36_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-040': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_40_shawarma_kebab_middle_eastern_plant_based.jpg',
      // Deli Meats
      'td-007': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_07_plant_based_meat_alternative_israeli_cuisine.jpg',
      'td-024': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_24_burger_schnitzel_plant_based_deli.jpg',
      'td-035': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_35_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-039': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_39_shawarma_kebab_middle_eastern_plant_based.jpg',
      // Breakfast
      'td-020': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_20_seitan_tofu_based_protein_alternative.jpg',
      // Meal Kits
      'td-044': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_44_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-045': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_43_shawarma_kebab_middle_eastern_plant_based.jpg',
      'td-046': '/images/vendors/teva-deli/products/teva_deli_vegan_specialty_product_42_shawarma_kebab_middle_eastern_plant_based.jpg'
    },
    certificates: [
      '/images/vendors/teva-deli/certificates/badatz_kosher_certificate.jpg',
      '/images/vendors/teva-deli/certificates/vegan_society_certificate.jpg'
    ],
    promotional: [
      '/images/vendors/teva-deli/promotional/holiday_special_banner.jpg',
      '/images/vendors/teva-deli/promotional/new_product_launch.jpg'
    ]
  },

  'queens-cuisine': {
    logo: '/images/vendors/queens-cuisine/logo/queens_cuisine_logo_vegan_food_art.jpg',
    banner: '/images/vendors/queens-cuisine/banners/queens_cuisine_banner_artisanal.jpg',
    storefront: '/images/vendors/queens-cuisine/storefront/queens_cuisine_restaurant_front.jpg',
    products: {
      'qc-001': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg',
      'qc-002': '/images/vendors/queens-cuisine/products/queens_cuisine_middle_eastern_shawarma_pita_wrap_plant_based_meat_alternative.jpg',
      'qc-003': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_seitan_strips_teriyaki_sauce_sesame_seeds_scallions_asian_style.jpg',
      'qc-004': '/images/vendors/queens-cuisine/products/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_01.jpg',
      'qc-005': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_meat_kabab_skewer_dish_plant_based_middle_eastern_cuisine.jpg',
      'qc-006': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_meatballs_pasta_dish_plant_based_italian_cuisine_tomato_sauce.jpg',
      'qc-007': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_seitan_cutlets_breaded_crispy_herb_dip_arugula_salad_cherry_tomatoes.jpg',
      'qc-008': '/images/vendors/queens-cuisine/products/queens_cuisine_vegan_meat_grilled_seitan_steaks_plant_based_protein_alternative.jpg'
    },
    gallery: [
      '/images/vendors/queens-cuisine/gallery/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_02.jpg',
      '/images/vendors/queens-cuisine/gallery/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_03.jpg',
      '/images/vendors/queens-cuisine/gallery/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_04.jpg',
      '/images/vendors/queens-cuisine/gallery/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_05.jpg'
    ],
    team: [
      '/images/vendors/queens-cuisine/team/chef_preparing_vegan_meal.jpg',
      '/images/vendors/queens-cuisine/team/kitchen_staff_action.jpg'
    ]
  },

  'gahn-delight': {
    logo: '/images/vendors/gahn-delight/logo/gahn_delight_logo_handcrafted_foods.jpg',
    banner: '/images/vendors/gahn-delight/banners/1.jpg',
    storefront: '/images/vendors/gahn-delight/storefront/gahn_delight_ice_cream_shop.jpg',
    products: {
      'gd-001': '/images/vendors/gahn-delight/products/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg',
      'gd-002': '/images/vendors/gahn-delight/products/gahn_delight_ice_cream_passion_mango_double_scoop_cup.jpg',
      'gd-003': '/images/vendors/gahn-delight/products/gahn_delight_ice_cream_pistachio_rose_triple_scoop_ceramic_bowl.jpeg',
      'gd-004': '/images/vendors/gahn-delight/products/gahn_delight_parfait_chocolate_almond_caramel_layered_glass.jpg',
      'gd-005': '/images/vendors/gahn-delight/products/gahn_delight_popsicle_berry_hibiscus_frozen_bar_wooden_stick.jpeg',
      'gd-006': '/images/vendors/gahn-delight/products/gahn_delight_sorbet_lime_coconut_fresh_garnish_bowl.jpg',
      'gd-007': '/images/vendors/gahn-delight/products/gahn_delight_sundae_date_caramel_vanilla_walnut_toppings_glass.jpeg'
    },
    promotional: [
      '/images/vendors/gahn-delight/promotional/summer_special_flavors.jpg',
      '/images/vendors/gahn-delight/promotional/holiday_ice_cream_cakes.jpg'
    ]
  },

  'garden-of-light': {
    logo: '/images/vendors/garden-of-light/logo/garden_of_light_logo.jpg',
    banner: '/images/vendors/garden-of-light/banners/2.jpg',
    storefront: '/images/vendors/garden-of-light/storefront/garden_of_light_deli_counter.jpg',
    products: {
      'aa-001': '/images/vendors/garden-of-light/products/smoothie_bowl_mix_healthy_breakfast.jpg',
      'aa-002': '/images/vendors/garden-of-light/products/roasted_vegetables_mediterranean.jpg',
      'aa-003': '/images/vendors/garden-of-light/products/superfood_mix_premium_blend.jpg',
      'gol-001': '/images/vendors/garden-of-light/products/mediterranean_quinoa_bowl.jpg',
      'gol-002': '/images/vendors/garden-of-light/products/raw_energy_balls_dates_nuts.jpg',
      'gol-003': '/images/vendors/garden-of-light/products/green_goddess_salad_organic.jpg'
    },
    certificates: [
      '/images/vendors/garden-of-light/certificates/organic_certification.jpg'
    ]
  },

  'people-store': {
    logo: '/images/vendors/people-store/logo/people_store_logo_community_retail.jpg',
    banner: '/images/vendors/people-store/banners/4.jpg',
    storefront: '/images/vendors/people-store/storefront/people_store_entrance.jpg',
    products: {
      'ps-001': '/images/vendors/people-store/products/Peoples Store - Bulk Beans Oats Rice and Grains Basket Display.jpg',
      'ps-002': '/images/vendors/people-store/products/Peoples Store - Bulk Flour and Powder Ingredients.jpg',
      'ps-003': '/images/vendors/people-store/products/Peoples Store - FOCO Coconut Water Variety Pack.jpg',
      'ps-004': '/images/vendors/people-store/products/Peoples Store - Great Northern Organic Maple Syrup.jpg',
      'ps-005': '/images/vendors/people-store/products/Peoples Store - Laverland Crunch Sea Salt Seaweed Snack 9-Pack.jpg',
      'ps-006': '/images/vendors/people-store/products/Peoples Store - Laverland Crunch Wasabi Seaweed Snack 9-Pack.jpg',
      'ps-007': '/images/vendors/people-store/products/Peoples Store - Natural Herb Seasoning Mix Hebrew.jpg',
      'ps-008': '/images/vendors/people-store/products/Peoples Store - Pure Sesame Oil Taiwan Large 2L Bottle.jpg',
      'ps-009': '/images/vendors/people-store/products/Peoples Store - Pure Sesame Oil Taiwan.jpg',
      'ps-010': '/images/vendors/people-store/products/Peoples Store - Quintessence Blueberry Non-Dairy Yogurt.jpg',
      'ps-011': '/images/vendors/people-store/products/Peoples Store - Quintessence Fermented Hot Peppers.jpg',
      'ps-012': '/images/vendors/people-store/products/Peoples Store - Quintessence Fermented Okra with Live Culture.jpg',
      'ps-013': '/images/vendors/people-store/products/Peoples Store - Quintessence Organic Cucumber Relish.jpg',
      'ps-014': '/images/vendors/people-store/products/Peoples Store - Quintessence Organic Kosher Dill Pickles.jpg',
      'ps-015': '/images/vendors/people-store/products/Peoples Store - Quintessence Organic Spicy Relish.jpg',
      'ps-016': '/images/vendors/people-store/products/Peoples Store - Quintessence Organic Spicy Sauerkraut.jpg',
      'ps-017': '/images/vendors/people-store/products/Peoples Store - Quintessence Pineapple Non-Dairy Yogurt.jpg',
      'ps-018': '/images/vendors/people-store/products/Peoples Store - Quintessence Plain Non-Dairy Yogurt.jpg',
      'ps-019': '/images/vendors/people-store/products/Peoples Store - Quintessence Spicy Kimchi Fermented.jpg',
      'ps-020': '/images/vendors/people-store/products/Peoples Store - Quintessence Strawberry Non-Dairy Yogurt.jpg',
      'ps-021': '/images/vendors/people-store/products/Peoples Store - Quintessence Sweet and Sour Ginger 3-Pack.jpg',
      'ps-022': '/images/vendors/people-store/products/Peoples Store - Wan Ja Shan Tamari Soy Sauce Naturally Brewed.jpg',
      'ps-023': '/images/vendors/people-store/products/Peoples Store - Bulk Grains and Legumes Basket Display.jpg'
    },
    gallery: [
      '/images/vendors/people-store/gallery/store_interior_bulk_section.jpg',
      '/images/vendors/people-store/gallery/community_shopping_day.jpg'
    ]
  },

  'vop-shop': {
    logo: '/images/vendors/vop-shop/logo/vop_shop_logo_village_marketplace.jpg',
    banner: '/images/vendors/vop-shop/banners/3.jpg',
    storefront: '/images/vendors/vop-shop/storefront/vop_shop_heritage_display.jpg',
    products: {
      'vs-001': '/images/vendors/vop-shop/products/vop_shop_community_apparel_product_01_wellness_lifestyle_village_of_peace_heritage_clothing.jpg',
      'vs-002': '/images/vendors/vop-shop/products/vop_shop_wellness_education_product_11_healing_books_holistic_health_community_wisdom.jpg',
      'vs-003': '/images/vendors/vop-shop/products/vop_shop_heritage_home_decor_product_06_50_year_celebration_cultural_art_community_pride.jpg',
      'vs-004': '/images/vendors/vop-shop/products/vop_shop_heritage_home_decor_product_07_50_year_celebration_cultural_art_community_pride.jpg',
      'vs-005': '/images/vendors/vop-shop/products/vop_shop_wellness_education_product_14_healing_books_holistic_health_community_wisdom.jpg',
      'vs-006': '/images/vendors/vop-shop/products/vop_shop_wellness_education_product_15_healing_books_holistic_health_community_wisdom.jpg'
    },
    gallery: [
      '/images/vendors/vop-shop/gallery/vop_shop_heritage_home_decor_product_08_50_year_celebration_cultural_art_community_pride.jpg',
      '/images/vendors/vop-shop/gallery/vop_shop_heritage_home_decor_product_09_50_year_celebration_cultural_art_community_pride.jpg',
      '/images/vendors/vop-shop/gallery/vop_shop_heritage_home_decor_product_10_50_year_celebration_cultural_art_community_pride.jpg'
    ],
    promotional: [
      '/images/vendors/vop-shop/promotional/50_year_anniversary_collection.jpg'
    ]
  }
};

// Fallback images by type
const FALLBACK_IMAGES = {
  logo: '/images/vendors/default/kfar_icon_leaf_green.png',
  banner: '/images/vendors/default/kfar_marketplace_default_banner.jpg',
  product: '/images/vendors/default/product_placeholder.jpg',
  storefront: '/images/vendors/default/store_placeholder.jpg',
  certificate: '/images/vendors/default/certificate_placeholder.jpg',
  team: '/images/vendors/default/team_placeholder.jpg',
  promotional: '/images/vendors/default/promo_placeholder.jpg'
};

/**
 * Get vendor logo with automatic fallback
 */
export function getVendorLogo(vendorId: string): string {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  if (!bucket || !bucket.logo) {
    console.warn(`Logo not found for vendor: ${vendorId}`);
    return FALLBACK_IMAGES.logo;
  }
  return bucket.logo;
}

/**
 * Get vendor banner with automatic fallback
 */
export function getVendorBanner(vendorId: string): string {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  if (!bucket || !bucket.banner) {
    console.warn(`Banner not found for vendor: ${vendorId}`);
    return FALLBACK_IMAGES.banner;
  }
  return bucket.banner;
}

/**
 * Get product image with vendor bucket isolation
 */
export function getProductImage(vendorId: string, productId: string): string {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  
  if (!bucket) {
    console.warn(`Unknown vendor: ${vendorId}`);
    return FALLBACK_IMAGES.product;
  }
  
  const productImage = bucket.products[productId];
  
  if (!productImage) {
    console.warn(`Product image not found: ${vendorId}/${productId}`);
    return FALLBACK_IMAGES.product;
  }
  
  return productImage;
}

/**
 * Get vendor storefront image
 */
export function getVendorStorefront(vendorId: string): string {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  return bucket?.storefront || FALLBACK_IMAGES.storefront;
}

/**
 * Get all gallery images for a vendor
 */
export function getVendorGallery(vendorId: string): string[] {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  return bucket?.gallery || [];
}

/**
 * Get vendor certificates
 */
export function getVendorCertificates(vendorId: string): string[] {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  return bucket?.certificates || [];
}

/**
 * Get vendor team photos
 */
export function getVendorTeam(vendorId: string): string[] {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  return bucket?.team || [];
}

/**
 * Get vendor promotional materials
 */
export function getVendorPromotional(vendorId: string): string[] {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  return bucket?.promotional || [];
}

/**
 * Get all images for a product (main + gallery if available)
 */
export function getProductImages(vendorId: string, productId: string): string[] {
  const mainImage = getProductImage(vendorId, productId);
  
  // Future: Add product-specific galleries
  // For now, return just the main image
  return [mainImage];
}

/**
 * Check if an image exists (basic validation)
 */
export function validateImagePath(path: string): boolean {
  return path.startsWith('/images/vendors/') && 
         path.includes('.') && 
         !path.includes('undefined') &&
         !path.includes('null');
}

/**
 * Generate optimized image URL with size parameters
 */
export function getOptimizedImageUrl(
  imagePath: string, 
  options?: { 
    width?: number; 
    height?: number; 
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  // Future: Integrate with image optimization service
  // For now, return the original path
  return imagePath;
}

/**
 * Get vendor-specific image alt text
 */
export function getImageAltText(
  productName: string, 
  vendorName: string, 
  imageType: 'product' | 'logo' | 'banner' | 'storefront' = 'product'
): string {
  const typeText = {
    product: `${productName} by ${vendorName}`,
    logo: `${vendorName} logo`,
    banner: `${vendorName} banner`,
    storefront: `${vendorName} storefront`
  };
  
  return `${typeText[imageType]} - KiFar Marketplace`;
}

/**
 * Get vendor bucket summary (for debugging/admin)
 */
export function getVendorBucketSummary(vendorId: string): {
  hasLogo: boolean;
  hasBanner: boolean;
  hasStorefront: boolean;
  productCount: number;
  galleryCount: number;
  certificateCount: number;
  teamCount: number;
  promotionalCount: number;
} {
  const bucket = VENDOR_IMAGE_BUCKETS[vendorId];
  
  if (!bucket) {
    return {
      hasLogo: false,
      hasBanner: false,
      hasStorefront: false,
      productCount: 0,
      galleryCount: 0,
      certificateCount: 0,
      teamCount: 0,
      promotionalCount: 0
    };
  }
  
  return {
    hasLogo: !!bucket.logo,
    hasBanner: !!bucket.banner,
    hasStorefront: !!bucket.storefront,
    productCount: Object.keys(bucket.products).length,
    galleryCount: bucket.gallery?.length || 0,
    certificateCount: bucket.certificates?.length || 0,
    teamCount: bucket.team?.length || 0,
    promotionalCount: bucket.promotional?.length || 0
  };
}

/**
 * Export all vendor IDs for iteration
 */
export const VENDOR_IDS = Object.keys(VENDOR_IMAGE_BUCKETS);

/**
 * Get vendor name from ID
 */
export function getVendorName(vendorId: string): string {
  const vendorNames: Record<string, string> = {
    'teva-deli': 'Teva Deli',
    'queens-cuisine': "Queen's Cuisine",
    'gahn-delight': 'Gahn Delight',
    'garden-of-light': 'Garden of Light',
    'people-store': 'People Store',
    'vop-shop': 'VOP Shop'
  };
  
  return vendorNames[vendorId] || vendorId;
}