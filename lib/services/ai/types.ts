/**
 * AI Service Type Definitions
 */

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AISearchQuery {
  text: string;
  context?: {
    userId?: string;
    location?: string;
    preferences?: string[];
    history?: string[];
  };
}

export interface AITranslation {
  success: boolean;
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  confidence: number;
  error?: string;
}

export interface VisionAnalysis {
  success: boolean;
  productType: string;
  category: string;
  features: string[];
  quality: {
    score: number;
    notes: string;
  };
  suggestedName: string;
  description: string;
  detectedText: string[];
  culturalContext: string;
  confidence: number;
  error?: string;
}

export interface ProductRecognition {
  success: boolean;
  matches: Array<{
    productId: string;
    similarity: number;
    matchType: 'exact' | 'similar' | 'category';
    confidence: number;
  }>;
  searchType: 'visual' | 'text' | 'hybrid';
  confidence: number;
  error?: string;
}

export interface SmartQRContent {
  version: number;
  type: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  payload: any;
  metadata: {
    created: Date;
    expires?: Date;
    aiGenerated: boolean;
    security: {
      signature: string;
      algorithm: string;
    };
  };
}

export interface NFCPayload {
  tagId: string;
  type: 'product' | 'payment' | 'access' | 'info';
  data: {
    primary: any;
    fallback: string;
    actions?: Array<{
      type: string;
      label: string;
      url?: string;
      data?: any;
    }>;
  };
  security: {
    encrypted: boolean;
    signature?: string;
  };
}

export interface CollectionPointData {
  id: string;
  name: string;
  type: 'locker' | 'counter' | 'automated' | 'p2p';
  location: {
    address: string;
    coordinates: [number, number];
    plusCode?: string;
  };
  availability: {
    status: 'available' | 'busy' | 'offline';
    nextAvailable?: Date;
    capacity: {
      total: number;
      available: number;
    };
  };
  features: string[];
}

export interface P2POrderTracking {
  orderId: string;
  status: 'pending' | 'ready' | 'collected' | 'completed';
  participants: {
    buyer: string;
    seller: string;
  };
  location?: CollectionPointData;
  timeline: Array<{
    event: string;
    timestamp: Date;
    location?: string;
    verified: boolean;
  }>;
  verification: {
    method: 'qr' | 'nfc' | 'pin' | 'biometric';
    code?: string;
    expiresAt?: Date;
  };
}

export interface AIRecommendation {
  productId: string;
  score: number;
  reason: string;
  personalized: boolean;
  tags: string[];
}

export interface AIInsight {
  type: 'trend' | 'demand' | 'pricing' | 'inventory';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  recommendations: string[];
}