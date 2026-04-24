/**
 * Shopping Event Types for KFAR AI Assistant
 * Following JASPER orchestrator-mediated pattern
 */

export enum ShoppingEventType {
  // User Interactions
  MESSAGE_RECEIVED = 'message_received',
  VOICE_INPUT = 'voice_input',

  // Search Events
  SEARCH_REQUESTED = 'search_requested',
  CATEGORY_BROWSE = 'category_browse',
  VENDOR_BROWSE = 'vendor_browse',

  // Cart Events
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  UPDATE_QUANTITY = 'update_quantity',
  VIEW_CART = 'view_cart',
  CLEAR_CART = 'clear_cart',

  // Shopping Flow
  CHECKOUT_START = 'checkout_start',
  ORDER_INQUIRY = 'order_inquiry',
  PRODUCT_DETAILS = 'product_details',

  // Recommendations
  SIMILAR_PRODUCTS = 'similar_products',
  DEALS_REQUESTED = 'deals_requested',
  TRENDING_REQUESTED = 'trending_requested',

  // System
  GREETING = 'greeting',
  HELP_REQUESTED = 'help_requested',
  LANGUAGE_SWITCH = 'language_switch',
  UNKNOWN = 'unknown',
}

export interface ShoppingEvent {
  id: string;
  type: ShoppingEventType;
  data: Record<string, unknown>;
  timestamp: Date;
  sessionId?: string;
  language: 'en' | 'he';
  isVoice: boolean;
}

export interface UserInput {
  message: string;
  language: 'en' | 'he';
  isVoice: boolean;
  sessionId?: string;
  conversationHistory?: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: ProductReference[];
}

export interface ProductReference {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface AssistantResponse {
  text: string;
  textHe?: string;
  products?: ProductResult[];
  cartSummary?: CartSummary;
  audio?: string; // Base64 audio for voice
  suggestions?: string[];
  intent: ShoppingEventType;
}

export interface ProductResult {
  id: string;
  name: string;
  nameHe?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendorId: string;
  vendorName: string;
  category?: string;
  inStock: boolean;
  tags?: string[];
  badge?: string;
}

export interface CartSummary {
  items: CartItemSummary[];
  totalItems: number;
  subtotal: number;
  currency: string;
}

export interface CartItemSummary {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface SearchFilters {
  category?: string;
  vendor?: string;
  dietary?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
}

// Helper to create event
export function createShoppingEvent(
  type: ShoppingEventType,
  data: Record<string, unknown>,
  options: Partial<ShoppingEvent> = {}
): ShoppingEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    type,
    data,
    timestamp: new Date(),
    language: options.language || 'en',
    isVoice: options.isVoice || false,
    sessionId: options.sessionId,
  };
}
