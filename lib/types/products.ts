// Product and Vendor types for the marketplace

export interface Product {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  vendor: string;
  vendorId: string;
  stock?: number;
  stockQuantity?: number;
  inStock: boolean;
  unit?: string;
  minimumOrder?: number;
  preparationTime?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeVariant?: 'sale' | 'new' | 'hot';
  isFeatured?: boolean;
  isNew?: boolean;
  kosher?: boolean;
  isKosher?: boolean;
  vegan?: boolean;
  isVegan?: boolean;
  organic?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  kashrut?: string;
  tags?: string[];
  nutritionInfo?: unknown;
  dietaryInfo?: unknown;
  bulkPricing?: Array<{ quantity: number; price: number }> | null;
  shippingInfo?: {
    localPickup: boolean;
    delivery: boolean;
    international: boolean;
  };
  specifications?: Record<string, string>;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbs?: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  };
  allergens?: string[];
  ingredients?: string[];
  servingSize?: string;
  storageInstructions?: string;
  shelfLife?: string;
  preparationInstructions?: string;
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  banner?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  tags?: string[];
  verified?: boolean;
  founded?: string | number;
  specialty?: string;
  location?: string;
  kashrut?: string;
  highlights?: string[];
  deliveryTime?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  yearsInBusiness?: number;
  totalProducts?: number;
  phone?: string;
  email?: string;
  address?: string;
  longDescription?: string;
  deliveryPolicy?: string;
  returnPolicy?: string;
  promotions?: Array<string | { title?: string; description?: string }>;
  cuisine?: string[];
  dietary?: string[];
  about?: string;
  contact?: Record<string, string>;
  operatingHours?: unknown[];
  paymentMethods?: string[];
  socialMedia?: Record<string, string>;
  policies?: Record<string, unknown>;
  established?: string | number;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  businessHours?: Record<string, string> | string;
  deliveryInfo?: {
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
    estimatedTime?: string;
  };
}
