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
  inStock: boolean;
  unit?: string;
  minimumOrder?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeVariant?: 'sale' | 'new' | 'hot';
  kosher?: boolean;
  vegan?: boolean;
  organic?: boolean;
  glutenFree?: boolean;
  tags?: string[];
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
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  businessHours?: Record<string, string>;
  deliveryInfo?: {
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
    estimatedTime?: string;
  };
}