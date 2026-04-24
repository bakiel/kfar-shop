// Data Integration Service - Central hub for all data threading
// Connects products, vendors, customers, tags, QR codes, and analytics

import { completeProductCatalog, EnhancedProduct, VendorCatalog } from '../data/complete-catalog';
import { tagManager, Tag } from './tag-manager';
import { qrService, QRCodeData } from './qr-service';
import { customerAnalytics, Customer, ProductInteraction } from './customer-analytics';

export interface IntegratedProduct extends EnhancedProduct {
  qrData?: QRCodeData;
  nfcData?: any;
  analytics?: ProductAnalytics;
  relatedTags?: Tag[];
  vendorInfo?: VendorInfo;
}

export interface ProductAnalytics {
  views: number;
  purchases: number;
  cartAdds: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  trendingScore: number;
  customerSegments: { segmentId: string; percentage: number }[];
}

export interface VendorInfo {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  totalProducts: number;
  activePromotions?: any[];
}

export interface DataThread {
  id: string;
  type: 'product' | 'vendor' | 'customer' | 'order' | 'support';
  primaryEntity: string;
  relatedEntities: RelatedEntity[];
  tags: string[];
  timeline: TimelineEvent[];
  metadata: any;
}

export interface RelatedEntity {
  id: string;
  type: string;
  relationship: string;
  strength: number;
}

export interface TimelineEvent {
  timestamp: Date;
  eventType: string;
  actor?: string;
  data: any;
}

export class DataIntegrationService {
  private productCache: Map<string, IntegratedProduct> = new Map();
  private dataThreads: Map<string, DataThread> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize all products with enhanced data
    for (const [vendorId, vendorData] of Object.entries(completeProductCatalog)) {
      // Tag the vendor
      const vendorTags = vendorData.vendorTags || [];
      tagManager.tagEntity(vendorId, 'vendor', vendorTags);

      // Process each product
      for (const product of vendorData.products) {
        await this.integrateProduct(product, vendorData);
      }
    }

    this.initialized = true;
  }

  private async integrateProduct(
    product: EnhancedProduct, 
    vendorData: VendorCatalog
  ): Promise<IntegratedProduct> {
    // Generate QR code for product
    const qrData = await qrService.generateQRCode('product', {
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      tags: product.tags
    });

    // Tag the product
    tagManager.tagEntity(product.id, 'product', product.tags);

    // Get related tags
    const relatedTags = product.tags
      .map(tagSlug => tagManager.getTagBySlug(tagSlug))
      .filter(tag => tag !== undefined) as Tag[];

    // Create integrated product
    const integratedProduct: IntegratedProduct = {
      ...product,
      qrData,
      analytics: this.getProductAnalytics(product.id),
      relatedTags,
      vendorInfo: {
        id: vendorData.vendorId,
        name: vendorData.vendorName,
        tags: vendorData.vendorTags || [],
        rating: 4.5, // Default rating
        totalProducts: vendorData.products.length
      }
    };

    this.productCache.set(product.id, integratedProduct);
    
    // Create data thread
    this.createDataThread(product.id, 'product', {
      vendor: vendorData.vendorId,
      tags: product.tags,
      qrCode: qrData.id
    });

    return integratedProduct;
  }

  // Product Operations
  async getProduct(productId: string): Promise<IntegratedProduct | undefined> {
    if (!this.initialized) await this.initialize();
    return this.productCache.get(productId);
  }

  async getProductsByVendor(vendorId: string): Promise<IntegratedProduct[]> {
    if (!this.initialized) await this.initialize();
    return Array.from(this.productCache.values()).filter(
      product => product.vendorId === vendorId
    );
  }

  async getProductsByTags(tags: string[]): Promise<IntegratedProduct[]> {
    if (!this.initialized) await this.initialize();
    return Array.from(this.productCache.values()).filter(
      product => tags.some(tag => product.tags.includes(tag))
    );
  }

  // Customer Interaction Tracking
  async trackProductView(
    productId: string, 
    customerId?: string, 
    source: ProductInteraction['source'] = 'web'
  ): Promise<void> {
    const product = await this.getProduct(productId);
    if (!product) return;

    const interaction: ProductInteraction = {
      productId,
      interactionType: 'view',
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      source,
      duration: 0
    };

    customerAnalytics.trackInteraction(interaction);

    // Update product analytics
    if (product.analytics) {
      product.analytics.views++;
      product.analytics.trendingScore = this.calculateTrendingScore(product);
    }

    // Update data thread
    this.updateDataThread(productId, {
      eventType: 'view',
      actor: customerId,
      data: { source }
    });

    // Auto-tag customer based on interaction
    if (customerId) {
      const suggestedTags = tagManager.suggestTags('customer', {
        viewedProduct: product,
        categories: [product.category],
        tags: product.tags
      });

      if (suggestedTags.length > 0) {
        tagManager.tagEntity(customerId, 'customer', suggestedTags.map(t => t.id));
      }
    }
  }

  async trackAddToCart(
    productId: string, 
    customerId: string, 
    quantity: number = 1
  ): Promise<void> {
    const product = await this.getProduct(productId);
    if (!product) return;

    const interaction: ProductInteraction = {
      productId,
      interactionType: 'cart',
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      source: 'web'
    };

    customerAnalytics.trackInteraction(interaction);

    if (product.analytics) {
      product.analytics.cartAdds++;
      product.analytics.conversionRate = 
        product.analytics.purchases / product.analytics.views;
    }

    // Track customer journey
    customerAnalytics.trackTouchpoint(customerId, {
      type: 'website',
      action: 'add_to_cart',
      timestamp: new Date(),
      channel: 'marketplace',
      outcome: 'positive',
      data: { productId, quantity }
    });

    this.updateDataThread(productId, {
      eventType: 'cart_add',
      actor: customerId,
      data: { quantity }
    });
  }

  async trackPurchase(
    orderId: string,
    customerId: string,
    items: { productId: string; quantity: number; price: number }[]
  ): Promise<void> {
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) continue;

      const interaction: ProductInteraction = {
        productId: item.productId,
        interactionType: 'purchase',
        timestamp: new Date(),
        sessionId: this.generateSessionId(),
        source: 'web'
      };

      customerAnalytics.trackInteraction(interaction);

      if (product.analytics) {
        product.analytics.purchases += item.quantity;
        product.analytics.conversionRate = 
          product.analytics.purchases / product.analytics.views;
      }

      this.updateDataThread(item.productId, {
        eventType: 'purchase',
        actor: customerId,
        data: { orderId, quantity: item.quantity, price: item.price }
      });
    }

    // Update customer metrics
    const customer = customerAnalytics.getCustomer(customerId);
    if (customer) {
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      customer.metrics.totalOrders++;
      customer.metrics.totalSpent += totalAmount;
      customer.metrics.averageOrderValue = 
        customer.metrics.totalSpent / customer.metrics.totalOrders;
      customer.metrics.lastOrderDate = new Date();

      customerAnalytics.updateCustomer(customerId, customer);
    }

    // Auto-tag based on purchase patterns
    const purchasedTags = new Set<string>();
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        product.tags.forEach(tag => purchasedTags.add(tag));
      }
    }

    const frequentTags = Array.from(purchasedTags).slice(0, 5);
    tagManager.tagEntity(customerId, 'customer', frequentTags);
  }

  // QR Code Integration
  async processQRScan(qrCode: string, scannerId?: string): Promise<any> {
    const result = await qrService.scanQRCode(qrCode);
    
    if (result.success && result.type === 'product') {
      const productId = result.data.productId;
      await this.trackProductView(productId, scannerId, 'qr');
      
      // Track QR scan in customer journey
      if (scannerId) {
        customerAnalytics.trackTouchpoint(scannerId, {
          type: 'qr',
          action: 'scan_product',
          timestamp: new Date(),
          channel: 'qr_code',
          outcome: 'positive',
          data: { productId, qrCode }
        });
      }
    }

    return result;
  }

  // Analytics & Insights
  private getProductAnalytics(productId: string): ProductAnalytics {
    // In a real system, this would fetch from a database
    return {
      views: 0,
      purchases: 0,
      cartAdds: 0,
      conversionRate: 0,
      averageRating: 4.5,
      reviewCount: 0,
      trendingScore: 0,
      customerSegments: []
    };
  }

  private calculateTrendingScore(product: IntegratedProduct): number {
    if (!product.analytics) return 0;

    const recentViews = product.analytics.views; // Would filter by time in real system
    const conversionRate = product.analytics.conversionRate;
    const rating = product.analytics.averageRating;

    return (recentViews * 0.4) + (conversionRate * 100 * 0.4) + (rating * 0.2);
  }

  // Data Threading
  private createDataThread(
    entityId: string, 
    type: DataThread['type'], 
    metadata: any
  ): void {
    const thread: DataThread = {
      id: `thread_${entityId}`,
      type,
      primaryEntity: entityId,
      relatedEntities: [],
      tags: metadata.tags || [],
      timeline: [{
        timestamp: new Date(),
        eventType: 'created',
        data: metadata
      }],
      metadata
    };

    this.dataThreads.set(thread.id, thread);
  }

  private updateDataThread(
    entityId: string, 
    event: Omit<TimelineEvent, 'timestamp'>
  ): void {
    const threadId = `thread_${entityId}`;
    const thread = this.dataThreads.get(threadId);
    
    if (thread) {
      thread.timeline.push({
        ...event,
        timestamp: new Date()
      });
    }
  }

  getDataThread(entityId: string): DataThread | undefined {
    return this.dataThreads.get(`thread_${entityId}`);
  }

  // Smart Recommendations
  async getRecommendations(
    customerId: string, 
    context?: { currentProduct?: string; category?: string }
  ): Promise<IntegratedProduct[]> {
    const customer = customerAnalytics.getCustomer(customerId);
    if (!customer) return [];

    // Get customer tags
    const customerTags = tagManager.getEntityTags(customerId, 'customer');
    
    // Get products with matching tags
    let recommendations = await this.getProductsByTags(customerTags);
    
    // Filter by context
    if (context?.category) {
      recommendations = recommendations.filter(p => p.category === context.category);
    }
    
    if (context?.currentProduct) {
      recommendations = recommendations.filter(p => p.id !== context.currentProduct);
    }

    // Sort by relevance
    recommendations.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, customer, customerTags);
      const bScore = this.calculateRelevanceScore(b, customer, customerTags);
      return bScore - aScore;
    });

    return recommendations.slice(0, 10);
  }

  private calculateRelevanceScore(
    product: IntegratedProduct, 
    customer: Customer, 
    customerTags: string[]
  ): number {
    let score = 0;

    // Tag matching
    const matchingTags = product.tags.filter(tag => customerTags.includes(tag));
    score += matchingTags.length * 10;

    // Price range matching
    const avgOrderValue = customer.metrics.averageOrderValue;
    if (Math.abs(product.price - avgOrderValue) < 20) {
      score += 5;
    }

    // Vendor preference
    const favoriteVendor = customer.metrics.favoriteVendors[0];
    if (favoriteVendor && product.vendorId === favoriteVendor.vendorId) {
      score += 15;
    }

    // Trending score
    if (product.analytics) {
      score += product.analytics.trendingScore * 0.1;
    }

    return score;
  }

  // Utility Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export for persistence
  exportData() {
    return {
      products: Array.from(this.productCache.values()),
      threads: Array.from(this.dataThreads.values()),
      tags: tagManager.exportTags(),
      customers: customerAnalytics.exportData()
    };
  }

  // Import from persistence
  async importData(data: any): Promise<void> {
    if (data.tags) {
      tagManager.importTags(data.tags);
    }
    
    if (data.products) {
      for (const product of data.products) {
        this.productCache.set(product.id, product);
      }
    }
    
    if (data.threads) {
      for (const thread of data.threads) {
        this.dataThreads.set(thread.id, thread);
      }
    }
    
    this.initialized = true;
  }
}

// Singleton instance
export const dataIntegration = new DataIntegrationService();