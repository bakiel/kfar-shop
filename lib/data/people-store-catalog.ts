// People Store Complete Product Catalog
// All 23 products with full details based on actual product images

export interface PeopleStoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  image: string;
  vendor: string;
  vendorId: string;
  vendorLogo: string;
  category: string;
  rating: number;
  reviewCount: number;
  features: string[];
  tags: string[];
  images: string[];
  inStock: boolean;
  stockCount?: number;
  unit?: string;
  minimumOrder?: number;
  shippingInfo?: {
    localPickup: boolean;
    delivery: boolean;
    international: boolean;
  };
  kashrut?: string;
  organic?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  culturalSignificance?: string;
}

export const peopleStoreProducts: PeopleStoreProduct[] = [
  {
    id: 'ps-001',
    name: 'Bulk Beans, Oats, Rice and Grains Basket',
    price: 89.90,
    originalPrice: 109.90,
    description: 'Premium variety basket of organic grains, beans, and oats',
    longDescription: 'Our signature bulk basket features a curated selection of premium organic grains, beans, and oats. Each basket contains 10 varieties of nutritious whole foods, perfect for stocking your pantry with healthy staples. Sourced from local Israeli farmers and international fair-trade partners.',
    image: '/images/vendors/Peoples Store - Bulk Beans Oats Rice and Grains Basket Display.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Bulk Foods',
    rating: 4.9,
    reviewCount: 312,
    features: ['Bulk Basket', 'Organic', '10 Varieties'],
    tags: ['grains', 'beans', 'oats', 'bulk', 'organic', 'basket'],
    images: [
      '/images/vendors/Peoples Store - Bulk Beans Oats Rice and Grains Basket Display.jpg',
      '/images/vendors/Peoples Store - Bulk Grains and Legumes Basket Display.jpg'
    ],
    inStock: true,
    stockCount: 45,
    unit: 'basket',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: false,
    specifications: [
      { label: 'Contents', value: '10 varieties x 1kg each' },
      { label: 'Total Weight', value: '10kg' },
      { label: 'Basket Material', value: 'Sustainable woven fiber' },
      { label: 'Shelf Life', value: '6-12 months' }
    ],
    culturalSignificance: 'Essential staples basket supporting community nutrition and food security initiatives'
  },
  {
    id: 'ps-002',
    name: 'Bulk Flour and Powder Ingredients Collection',
    price: 64.90,
    originalPrice: 79.90,
    description: 'Premium baking flours and powder ingredients set',
    longDescription: 'Professional-grade collection of baking flours and powder ingredients. Includes whole wheat flour, white flour, cornmeal, chickpea flour, and specialty baking powders. Perfect for home bakers and small businesses.',
    image: '/images/vendors/Peoples Store - Bulk Flour and Powder Ingredients.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Baking Supplies',
    rating: 4.8,
    reviewCount: 189,
    features: ['Bulk Pack', 'Fresh Ground', 'Multiple Types'],
    tags: ['flour', 'baking', 'bulk', 'powder'],
    images: [
      '/images/vendors/Peoples Store - Bulk Flour and Powder Ingredients.jpg'
    ],
    inStock: true,
    stockCount: 78,
    unit: 'set',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: false,
    specifications: [
      { label: 'Set Contents', value: '5 types of flour' },
      { label: 'Package Size', value: '2kg each type' },
      { label: 'Total Weight', value: '10kg' },
      { label: 'Storage', value: 'Cool, dry place' }
    ],
    culturalSignificance: 'Supporting community bakeries and home-based food businesses'
  },
  {
    id: 'ps-003',
    name: 'FOCO Coconut Water Variety Pack',
    price: 35.90,
    originalPrice: 42.90,
    description: 'Natural coconut water variety pack - 12 bottles',
    longDescription: 'Refreshing FOCO coconut water variety pack featuring original, pink coconut, and coconut with pulp. 100% natural coconut water with no added sugars or preservatives. Perfect hydration for active lifestyles.',
    image: '/images/vendors/Peoples Store - FOCO Coconut Water Variety Pack.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Beverages',
    rating: 4.7,
    reviewCount: 234,
    features: ['Natural', 'No Sugar Added', 'Variety Pack'],
    tags: ['coconut water', 'beverages', 'natural', 'hydration'],
    images: [
      '/images/vendors/Peoples Store - FOCO Coconut Water Variety Pack.jpg'
    ],
    inStock: true,
    stockCount: 120,
    unit: 'pack',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'OU',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Pack Size', value: '12 x 330ml bottles' },
      { label: 'Varieties', value: 'Original, Pink, With Pulp' },
      { label: 'Origin', value: 'Thailand' },
      { label: 'Shelf Life', value: '18 months' }
    ],
    culturalSignificance: 'Popular tropical beverage embraced by health-conscious community members'
  },
  {
    id: 'ps-004',
    name: 'Great Northern Organic Maple Syrup',
    price: 89.90,
    originalPrice: 109.90,
    description: 'Pure Grade A organic maple syrup - 1 liter',
    longDescription: 'Premium Grade A organic maple syrup from sustainable Canadian maple forests. Rich, amber color with complex flavor profile. Perfect for pancakes, baking, and natural sweetening.',
    image: '/images/vendors/Peoples Store - Great Northern Organic Maple Syrup.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Sweeteners',
    rating: 4.9,
    reviewCount: 167,
    features: ['Grade A', 'Organic', 'Pure'],
    tags: ['maple syrup', 'sweetener', 'organic', 'natural'],
    images: [
      '/images/vendors/Peoples Store - Great Northern Organic Maple Syrup.jpg'
    ],
    inStock: true,
    stockCount: 56,
    unit: 'bottle',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: true
    },
    kashrut: 'COR',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '1 liter' },
      { label: 'Grade', value: 'Grade A Amber' },
      { label: 'Origin', value: 'Canada' },
      { label: 'Harvest', value: 'Spring 2024' }
    ],
    culturalSignificance: 'Natural sweetener aligning with community health and wellness values'
  },
  {
    id: 'ps-005',
    name: 'Laverland Crunch Sea Salt Seaweed Snack 9-Pack',
    price: 42.90,
    originalPrice: 49.90,
    description: 'Crispy roasted seaweed with sea salt - 9 pack',
    longDescription: 'Laverland\'s premium roasted seaweed snacks seasoned with natural sea salt. Light, crispy, and packed with minerals. A healthy alternative to traditional snacks, perfect for on-the-go nutrition.',
    image: '/images/vendors/Peoples Store - Laverland Crunch Sea Salt Seaweed Snack 9-Pack.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Snacks',
    rating: 4.6,
    reviewCount: 298,
    features: ['Low Calorie', 'High Minerals', 'Crispy'],
    tags: ['seaweed', 'snacks', 'healthy', 'sea salt'],
    images: [
      '/images/vendors/Peoples Store - Laverland Crunch Sea Salt Seaweed Snack 9-Pack.jpg'
    ],
    inStock: true,
    stockCount: 145,
    unit: 'pack',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'OK',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Pack Contents', value: '9 individual packs' },
      { label: 'Net Weight', value: '5g per pack' },
      { label: 'Flavor', value: 'Sea Salt' },
      { label: 'Origin', value: 'Korea' }
    ],
    culturalSignificance: 'Healthy snacking option embraced by health-conscious community members'
  },
  {
    id: 'ps-006',
    name: 'Laverland Crunch Wasabi Seaweed Snack 9-Pack',
    price: 42.90,
    originalPrice: 49.90,
    description: 'Crispy roasted seaweed with wasabi flavor - 9 pack',
    longDescription: 'Laverland\'s premium roasted seaweed snacks with a spicy wasabi kick. The perfect balance of umami and heat in a light, crispy snack. Rich in iodine and minerals.',
    image: '/images/vendors/Peoples Store - Laverland Crunch Wasabi Seaweed Snack 9-Pack.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Snacks',
    rating: 4.5,
    reviewCount: 276,
    features: ['Spicy Wasabi', 'High Minerals', 'Crispy'],
    tags: ['seaweed', 'snacks', 'wasabi', 'spicy'],
    images: [
      '/images/vendors/Peoples Store - Laverland Crunch Wasabi Seaweed Snack 9-Pack.jpg'
    ],
    inStock: true,
    stockCount: 132,
    unit: 'pack',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'OK',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Pack Contents', value: '9 individual packs' },
      { label: 'Net Weight', value: '5g per pack' },
      { label: 'Flavor', value: 'Wasabi' },
      { label: 'Spice Level', value: 'Medium' }
    ],
    culturalSignificance: 'Fusion snack bringing Asian flavors to the community marketplace'
  },
  {
    id: 'ps-007',
    name: 'Natural Herb Seasoning Mix - Hebrew Collection',
    price: 28.90,
    originalPrice: 34.90,
    description: 'Traditional Hebrew herb and spice blend',
    longDescription: 'Authentic Hebrew seasoning mix featuring za\'atar, sumac, and traditional Middle Eastern herbs. Hand-blended according to ancient recipes, perfect for authentic Israeli and Middle Eastern cuisine.',
    image: '/images/vendors/Peoples Store - Natural Herb Seasoning Mix Hebrew.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Spices & Seasonings',
    rating: 4.9,
    reviewCount: 423,
    features: ['Traditional Blend', 'No Additives', 'Aromatic'],
    tags: ['spices', 'herbs', 'seasoning', 'hebrew', 'middle eastern'],
    images: [
      '/images/vendors/Peoples Store - Natural Herb Seasoning Mix Hebrew.jpg'
    ],
    inStock: true,
    stockCount: 234,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: true
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Net Weight', value: '150g' },
      { label: 'Ingredients', value: 'Za\'atar, Sumac, Sesame, Herbs' },
      { label: 'Package', value: 'Glass jar with seal' },
      { label: 'Usage', value: 'Bread, salads, grilled foods' }
    ],
    culturalSignificance: 'Traditional seasoning blend preserving Hebrew culinary heritage'
  },
  {
    id: 'ps-008',
    name: 'Pure Sesame Oil Taiwan Premium - 2L',
    price: 119.90,
    originalPrice: 139.90,
    description: 'Premium pure sesame oil from Taiwan - 2 liter bottle',
    longDescription: 'Exceptional quality pure sesame oil from Taiwan\'s finest sesame seeds. Cold-pressed to preserve nutrients and authentic nutty flavor. Essential for Asian cuisine and health-conscious cooking.',
    image: '/images/vendors/Peoples Store - Pure Sesame Oil Taiwan Large 2L Bottle.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Cooking Oils',
    rating: 4.8,
    reviewCount: 156,
    features: ['Pure', 'Cold-Pressed', 'Premium Grade'],
    tags: ['sesame oil', 'cooking oil', 'taiwanese', 'premium'],
    images: [
      '/images/vendors/Peoples Store - Pure Sesame Oil Taiwan Large 2L Bottle.jpg',
      '/images/vendors/Peoples Store - Pure Sesame Oil Taiwan.jpg'
    ],
    inStock: true,
    stockCount: 67,
    unit: 'bottle',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'OU',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '2 liters' },
      { label: 'Extraction', value: 'Cold-pressed' },
      { label: 'Origin', value: 'Taiwan' },
      { label: 'Color', value: 'Golden amber' }
    ],
    culturalSignificance: 'Premium cooking oil supporting authentic Asian culinary traditions'
  },
  {
    id: 'ps-009',
    name: 'Pure Sesame Oil Taiwan - 500ml',
    price: 38.90,
    originalPrice: 45.90,
    description: 'Premium pure sesame oil from Taiwan - 500ml bottle',
    longDescription: 'Same exceptional quality Taiwanese sesame oil in a convenient 500ml size. Perfect for home kitchens. Cold-pressed from premium sesame seeds with rich, nutty aroma.',
    image: '/images/vendors/Peoples Store - Pure Sesame Oil Taiwan.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Cooking Oils',
    rating: 4.8,
    reviewCount: 289,
    features: ['Pure', 'Cold-Pressed', 'Convenient Size'],
    tags: ['sesame oil', 'cooking oil', 'taiwanese'],
    images: [
      '/images/vendors/Peoples Store - Pure Sesame Oil Taiwan.jpg'
    ],
    inStock: true,
    stockCount: 156,
    unit: 'bottle',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: true
    },
    kashrut: 'OU',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Extraction', value: 'Cold-pressed' },
      { label: 'Origin', value: 'Taiwan' },
      { label: 'Bottle Type', value: 'Dark glass' }
    ],
    culturalSignificance: 'Essential oil for authentic Asian cooking in the community'
  },
  {
    id: 'ps-010',
    name: 'Quintessence Blueberry Non-Dairy Yogurt',
    price: 16.90,
    originalPrice: 19.90,
    description: 'Probiotic blueberry coconut yogurt - 500ml',
    longDescription: 'Quintessence artisanal blueberry non-dairy yogurt made from organic coconut milk. Rich in probiotics with real blueberry pieces. No added sugars, naturally sweetened with fruit.',
    image: '/images/vendors/Peoples Store - Quintessence Blueberry Non-Dairy Yogurt.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Dairy Alternatives',
    rating: 4.7,
    reviewCount: 198,
    features: ['Probiotic', 'Non-Dairy', 'No Added Sugar'],
    tags: ['yogurt', 'non-dairy', 'blueberry', 'probiotic', 'coconut'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Blueberry Non-Dairy Yogurt.jpg'
    ],
    inStock: true,
    stockCount: 89,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Base', value: 'Organic coconut milk' },
      { label: 'Probiotics', value: '10 billion CFU' },
      { label: 'Shelf Life', value: '21 days refrigerated' }
    ],
    culturalSignificance: 'Supporting plant-based nutrition in alignment with community health values'
  },
  {
    id: 'ps-011',
    name: 'Quintessence Fermented Hot Peppers',
    price: 22.90,
    originalPrice: 27.90,
    description: 'Probiotic fermented hot pepper sauce - 250ml',
    longDescription: 'Quintessence signature fermented hot pepper sauce. Traditional fermentation creates complex flavors and beneficial probiotics. Medium heat level with tangy, umami notes.',
    image: '/images/vendors/Peoples Store - Quintessence Fermented Hot Peppers.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Fermented Foods',
    rating: 4.8,
    reviewCount: 167,
    features: ['Fermented', 'Probiotic', 'Medium Heat'],
    tags: ['hot sauce', 'fermented', 'peppers', 'probiotic'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Fermented Hot Peppers.jpg'
    ],
    inStock: true,
    stockCount: 123,
    unit: 'bottle',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: true
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '250ml' },
      { label: 'Heat Level', value: 'Medium (5/10)' },
      { label: 'Fermentation', value: '3 months' },
      { label: 'Main Peppers', value: 'Jalapeño, Serrano' }
    ],
    culturalSignificance: 'Traditional fermentation methods preserving food and promoting gut health'
  },
  {
    id: 'ps-012',
    name: 'Quintessence Fermented Okra with Live Culture',
    price: 19.90,
    originalPrice: 24.90,
    description: 'Probiotic fermented okra pickles - 500ml jar',
    longDescription: 'Quintessence fermented okra with live cultures. Crispy texture preserved through traditional lacto-fermentation. Rich in probiotics and enzymes for digestive health.',
    image: '/images/vendors/Peoples Store - Quintessence Fermented Okra with Live Culture.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Fermented Foods',
    rating: 4.6,
    reviewCount: 134,
    features: ['Live Culture', 'Probiotic', 'Crispy'],
    tags: ['okra', 'fermented', 'pickles', 'probiotic'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Fermented Okra with Live Culture.jpg'
    ],
    inStock: true,
    stockCount: 98,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Fermentation', value: 'Lacto-fermented' },
      { label: 'Brine', value: 'Sea salt & filtered water' },
      { label: 'Texture', value: 'Crispy' }
    ],
    culturalSignificance: 'Traditional preservation method supporting sustainable food practices'
  },
  {
    id: 'ps-013',
    name: 'Quintessence Organic Cucumber Relish',
    price: 18.90,
    originalPrice: 22.90,
    description: 'Tangy organic cucumber relish - 300ml',
    longDescription: 'Quintessence organic cucumber relish made with fresh cucumbers, onions, and aromatic spices. Perfect condiment for sandwiches, burgers, and salads. No artificial preservatives.',
    image: '/images/vendors/Peoples Store - Quintessence Organic Cucumber Relish.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Condiments',
    rating: 4.7,
    reviewCount: 211,
    features: ['Organic', 'No Preservatives', 'Tangy'],
    tags: ['relish', 'cucumber', 'condiment', 'organic'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Organic Cucumber Relish.jpg'
    ],
    inStock: true,
    stockCount: 145,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '300ml' },
      { label: 'Main Ingredients', value: 'Cucumbers, onions, vinegar' },
      { label: 'Sweetener', value: 'Organic cane sugar' },
      { label: 'Texture', value: 'Chunky' }
    ],
    culturalSignificance: 'Classic condiment made with organic ingredients for health-conscious consumers'
  },
  {
    id: 'ps-014',
    name: 'Quintessence Organic Kosher Dill Pickles',
    price: 21.90,
    originalPrice: 26.90,
    description: 'Classic kosher dill pickles - 750ml jar',
    longDescription: 'Quintessence traditional kosher dill pickles made with organic cucumbers and fresh dill. Fermented in small batches using time-honored methods. Crisp, tangy, and full of flavor.',
    image: '/images/vendors/Peoples Store - Quintessence Organic Kosher Dill Pickles.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Pickles & Preserves',
    rating: 4.9,
    reviewCount: 342,
    features: ['Kosher', 'Fermented', 'Organic'],
    tags: ['pickles', 'dill', 'kosher', 'fermented', 'organic'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Organic Kosher Dill Pickles.jpg'
    ],
    inStock: true,
    stockCount: 167,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '750ml' },
      { label: 'Cucumber Size', value: 'Medium' },
      { label: 'Fermentation', value: '4 weeks minimum' },
      { label: 'Ingredients', value: 'Cucumbers, dill, garlic, salt' }
    ],
    culturalSignificance: 'Traditional Jewish pickle-making preserving cultural food heritage'
  },
  {
    id: 'ps-015',
    name: 'Quintessence Organic Spicy Relish',
    price: 19.90,
    originalPrice: 23.90,
    description: 'Zesty organic spicy relish - 300ml',
    longDescription: 'Quintessence organic spicy relish with jalapeños and habaneros. Adds a fiery kick to any dish. Made with fresh organic vegetables and natural spices.',
    image: '/images/vendors/Peoples Store - Quintessence Organic Spicy Relish.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Condiments',
    rating: 4.6,
    reviewCount: 189,
    features: ['Spicy', 'Organic', 'Fresh Peppers'],
    tags: ['relish', 'spicy', 'condiment', 'organic', 'hot'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Organic Spicy Relish.jpg'
    ],
    inStock: true,
    stockCount: 112,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '300ml' },
      { label: 'Heat Level', value: 'Hot (7/10)' },
      { label: 'Peppers', value: 'Jalapeño, Habanero' },
      { label: 'Texture', value: 'Chunky' }
    ],
    culturalSignificance: 'Spicy condiment celebrating bold flavors in community cuisine'
  },
  {
    id: 'ps-016',
    name: 'Quintessence Organic Spicy Sauerkraut',
    price: 24.90,
    originalPrice: 29.90,
    description: 'Fermented spicy sauerkraut with chili - 750ml',
    longDescription: 'Quintessence organic spicy sauerkraut fermented with red chili flakes. Traditional German-style sauerkraut with an added kick. Rich in probiotics and vitamin C.',
    image: '/images/vendors/Peoples Store - Quintessence Organic Spicy Sauerkraut.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Fermented Foods',
    rating: 4.8,
    reviewCount: 267,
    features: ['Fermented', 'Probiotic', 'Spicy'],
    tags: ['sauerkraut', 'fermented', 'spicy', 'probiotic', 'cabbage'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Organic Spicy Sauerkraut.jpg'
    ],
    inStock: true,
    stockCount: 134,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '750ml' },
      { label: 'Fermentation', value: '6 weeks' },
      { label: 'Cabbage Type', value: 'White & purple mix' },
      { label: 'Spice Level', value: 'Medium-hot' }
    ],
    culturalSignificance: 'Traditional fermented food supporting digestive health and immunity'
  },
  {
    id: 'ps-017',
    name: 'Quintessence Pineapple Non-Dairy Yogurt',
    price: 16.90,
    originalPrice: 19.90,
    description: 'Tropical pineapple coconut yogurt - 500ml',
    longDescription: 'Quintessence artisanal pineapple non-dairy yogurt made from organic coconut milk. Features real pineapple chunks and natural tropical flavor. No added sugars.',
    image: '/images/vendors/Peoples Store - Quintessence Pineapple Non-Dairy Yogurt.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Dairy Alternatives',
    rating: 4.7,
    reviewCount: 223,
    features: ['Probiotic', 'Non-Dairy', 'Tropical'],
    tags: ['yogurt', 'non-dairy', 'pineapple', 'probiotic', 'coconut'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Pineapple Non-Dairy Yogurt.jpg'
    ],
    inStock: true,
    stockCount: 76,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Base', value: 'Organic coconut milk' },
      { label: 'Fruit Content', value: '15% real pineapple' },
      { label: 'Probiotics', value: '10 billion CFU' }
    ],
    culturalSignificance: 'Tropical flavors meeting plant-based nutrition needs'
  },
  {
    id: 'ps-018',
    name: 'Quintessence Plain Non-Dairy Yogurt',
    price: 14.90,
    originalPrice: 17.90,
    description: 'Classic plain coconut yogurt - 500ml',
    longDescription: 'Quintessence pure plain non-dairy yogurt made from organic coconut milk. Versatile base for sweet or savory dishes. Rich, creamy texture with beneficial probiotics.',
    image: '/images/vendors/Peoples Store - Quintessence Plain Non-Dairy Yogurt.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Dairy Alternatives',
    rating: 4.8,
    reviewCount: 312,
    features: ['Probiotic', 'Non-Dairy', 'Unsweetened'],
    tags: ['yogurt', 'non-dairy', 'plain', 'probiotic', 'coconut'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Plain Non-Dairy Yogurt.jpg'
    ],
    inStock: true,
    stockCount: 124,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Base', value: 'Organic coconut milk' },
      { label: 'Fat Content', value: '18%' },
      { label: 'Probiotics', value: '12 billion CFU' }
    ],
    culturalSignificance: 'Versatile plant-based staple for health-conscious cooking'
  },
  {
    id: 'ps-019',
    name: 'Quintessence Spicy Kimchi Fermented',
    price: 26.90,
    originalPrice: 32.90,
    description: 'Authentic Korean kimchi - 750ml jar',
    longDescription: 'Quintessence traditional Korean kimchi fermented with authentic gochugaru chili flakes. Features napa cabbage, radish, and aromatic vegetables. Spicy, tangy, and probiotic-rich.',
    image: '/images/vendors/Peoples Store - Quintessence Spicy Kimchi Fermented.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Fermented Foods',
    rating: 4.9,
    reviewCount: 287,
    features: ['Authentic Korean', 'Fermented', 'Spicy'],
    tags: ['kimchi', 'fermented', 'korean', 'spicy', 'probiotic'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Spicy Kimchi Fermented.jpg'
    ],
    inStock: true,
    stockCount: 98,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '750ml' },
      { label: 'Fermentation', value: '4-6 weeks' },
      { label: 'Spice Level', value: 'Hot (8/10)' },
      { label: 'Main Vegetables', value: 'Napa cabbage, radish' }
    ],
    culturalSignificance: 'International fermented food traditions enriching community cuisine'
  },
  {
    id: 'ps-020',
    name: 'Quintessence Strawberry Non-Dairy Yogurt',
    price: 16.90,
    originalPrice: 19.90,
    description: 'Sweet strawberry coconut yogurt - 500ml',
    longDescription: 'Quintessence artisanal strawberry non-dairy yogurt with real strawberry pieces. Made from organic coconut milk and naturally sweetened with fruit. Kid-friendly and nutritious.',
    image: '/images/vendors/Peoples Store - Quintessence Strawberry Non-Dairy Yogurt.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Dairy Alternatives',
    rating: 4.8,
    reviewCount: 256,
    features: ['Probiotic', 'Non-Dairy', 'Kid-Friendly'],
    tags: ['yogurt', 'non-dairy', 'strawberry', 'probiotic', 'coconut'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Strawberry Non-Dairy Yogurt.jpg'
    ],
    inStock: true,
    stockCount: 93,
    unit: 'jar',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '500ml' },
      { label: 'Base', value: 'Organic coconut milk' },
      { label: 'Fruit Content', value: '12% real strawberries' },
      { label: 'Color', value: 'Natural pink from fruit' }
    ],
    culturalSignificance: 'Family-friendly plant-based option loved by children and adults'
  },
  {
    id: 'ps-021',
    name: 'Quintessence Sweet and Sour Ginger 3-Pack',
    price: 54.90,
    originalPrice: 64.90,
    description: 'Fermented ginger in sweet & sour brine - 3 jars',
    longDescription: 'Quintessence sweet and sour fermented ginger three-pack. Young ginger fermented in a unique sweet and sour brine. Perfect palate cleanser and digestive aid. Great with sushi or Asian cuisine.',
    image: '/images/vendors/Peoples Store - Quintessence Sweet and Sour Ginger 3-Pack.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Fermented Foods',
    rating: 4.7,
    reviewCount: 178,
    features: ['3-Pack Value', 'Fermented', 'Digestive Aid'],
    tags: ['ginger', 'fermented', 'sweet and sour', 'digestive'],
    images: [
      '/images/vendors/Peoples Store - Quintessence Sweet and Sour Ginger 3-Pack.jpg'
    ],
    inStock: true,
    stockCount: 67,
    unit: 'pack',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Pack Contents', value: '3 x 250ml jars' },
      { label: 'Ginger Type', value: 'Young ginger' },
      { label: 'Brine', value: 'Rice vinegar based' },
      { label: 'Uses', value: 'Sushi, palate cleanser, tea' }
    ],
    culturalSignificance: 'Traditional Asian preservation methods for digestive wellness'
  },
  {
    id: 'ps-022',
    name: 'Wan Ja Shan Tamari Soy Sauce Naturally Brewed',
    price: 32.90,
    originalPrice: 38.90,
    description: 'Premium gluten-free tamari soy sauce - 600ml',
    longDescription: 'Wan Ja Shan naturally brewed tamari soy sauce. Gluten-free alternative to traditional soy sauce with rich, complex umami flavor. Fermented for 6 months using traditional methods.',
    image: '/images/vendors/Peoples Store - Wan Ja Shan Tamari Soy Sauce Naturally Brewed.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Asian Condiments',
    rating: 4.9,
    reviewCount: 234,
    features: ['Gluten-Free', 'Naturally Brewed', '6 Months Aged'],
    tags: ['tamari', 'soy sauce', 'gluten-free', 'asian', 'condiment'],
    images: [
      '/images/vendors/Peoples Store - Wan Ja Shan Tamari Soy Sauce Naturally Brewed.jpg'
    ],
    inStock: true,
    stockCount: 189,
    unit: 'bottle',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: true
    },
    kashrut: 'OU',
    organic: false,
    vegan: true,
    glutenFree: true,
    specifications: [
      { label: 'Volume', value: '600ml' },
      { label: 'Brewing Time', value: '6 months' },
      { label: 'Sodium', value: 'Reduced 25%' },
      { label: 'Origin', value: 'Taiwan' }
    ],
    culturalSignificance: 'Essential gluten-free condiment for inclusive community dining'
  },
  {
    id: 'ps-023',
    name: 'Bulk Grains and Legumes Display Basket',
    price: 74.90,
    originalPrice: 89.90,
    description: 'Artisan display basket with assorted grains & legumes',
    longDescription: 'Beautiful woven basket filled with a variety of organic grains and legumes. Perfect for display or as a gift. Includes quinoa, lentils, chickpeas, black beans, and more in individual cloth bags.',
    image: '/images/vendors/Peoples Store - Bulk Grains and Legumes Basket Display.jpg',
    vendor: 'People Store',
    vendorId: 'people-store',
    vendorLogo: '/images/vendors/people_store_logo_community_retail.jpg',
    category: 'Gift Baskets',
    rating: 4.8,
    reviewCount: 145,
    features: ['Gift Ready', 'Organic Selection', 'Reusable Basket'],
    tags: ['gift basket', 'grains', 'legumes', 'organic', 'bulk'],
    images: [
      '/images/vendors/Peoples Store - Bulk Grains and Legumes Basket Display.jpg'
    ],
    inStock: true,
    stockCount: 34,
    unit: 'basket',
    minimumOrder: 1,
    shippingInfo: {
      localPickup: true,
      delivery: true,
      international: false
    },
    kashrut: 'Badatz',
    organic: true,
    vegan: true,
    glutenFree: false,
    specifications: [
      { label: 'Contents', value: '8 varieties x 500g each' },
      { label: 'Basket Size', value: '40cm x 30cm' },
      { label: 'Packaging', value: 'Individual cloth bags' },
      { label: 'Gift Options', value: 'Custom message available' }
    ],
    culturalSignificance: 'Traditional gift basket celebrating abundance and community sharing'
  }
];