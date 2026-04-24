import { query } from '@/lib/db/postgres-client';

export interface PersonalizationProfile {
  customerId: string;
  preferences: {
    dietaryRestrictions: string[];
    favoriteCategories: string[];
    shoppingFrequency: string;
    preferredVendors: string[];
    priceRange: 'budget' | 'mid' | 'premium';
  };
  behavior: {
    averageOrderValue: number;
    totalOrders: number;
    lastOrderDate: string;
    frequentlyBoughtItems: string[];
    browsingHistory: string[];
    scanLocations: string[];
  };
  predictions: {
    nextPurchaseDate: string;
    recommendedProducts: string[];
    likelyCategories: string[];
    churnRisk: 'low' | 'medium' | 'high';
    lifetimeValue: number;
  };
}

export interface PersonalizationInsight {
  type: 'product' | 'vendor' | 'category' | 'timing' | 'price';
  confidence: number;
  recommendation: string;
  reason: string;
  data?: any;
}

export class PersonalizationService {
  private static instance: PersonalizationService;

  private constructor() {}

  static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  async analyzeCustomerBehavior(customerId: string): Promise<PersonalizationProfile> {
    try {
      // Get customer data from PostgreSQL
      let customer = null;
      let scans: any[] = [];

      try {
        const { rows: customerRows } = await query(
          `SELECT * FROM customers WHERE id = $1`,
          [customerId]
        );
        customer = customerRows[0];

        // Get QR scan history
        const { rows: scanRows } = await query(
          `SELECT * FROM customer_qr_scans
           WHERE customer_id = $1
           ORDER BY created_at DESC
           LIMIT 50`,
          [customerId]
        );
        scans = scanRows;
      } catch (dbError) {
        console.log('Database unavailable, using mock data');
      }

      // Get order history (mock for now)
      const orderHistory = this.getMockOrderHistory(customerId);

      // Get browsing patterns from scans
      const scanLocations = scans?.map(s => s.scan_location) || [];
      const uniqueVendors = [...new Set(scans?.map(s => s.scanned_by_vendor_id) || [])];

      // Calculate behavior metrics
      const behavior = {
        averageOrderValue: orderHistory.reduce((acc, o) => acc + o.total, 0) / orderHistory.length || 0,
        totalOrders: orderHistory.length,
        lastOrderDate: orderHistory[0]?.date || new Date().toISOString(),
        frequentlyBoughtItems: this.extractFrequentItems(orderHistory),
        browsingHistory: this.extractBrowsingPatterns(scans || []),
        scanLocations: [...new Set(scanLocations)]
      };

      // Generate predictions
      const predictions = this.generatePredictions(customer, behavior, orderHistory);

      return {
        customerId,
        preferences: {
          dietaryRestrictions: customer?.dietary_restrictions || [],
          favoriteCategories: customer?.preferences?.favoriteCategories || [],
          shoppingFrequency: customer?.preferences?.shoppingFrequency || 'weekly',
          preferredVendors: uniqueVendors,
          priceRange: this.calculatePriceRange(behavior.averageOrderValue)
        },
        behavior,
        predictions
      };
    } catch (error) {
      console.error('Error analyzing customer behavior:', error);
      return this.getDefaultProfile(customerId);
    }
  }

  async generatePersonalizedRecommendations(customerId: string): Promise<PersonalizationInsight[]> {
    const profile = await this.analyzeCustomerBehavior(customerId);
    const insights: PersonalizationInsight[] = [];

    // Product recommendations based on dietary preferences
    if (profile.preferences.dietaryRestrictions.includes('gluten-free')) {
      insights.push({
        type: 'product',
        confidence: 0.9,
        recommendation: 'Try our new gluten-free bread from Garden of Light',
        reason: 'Based on your gluten-free dietary preference',
        data: { productId: 'gol_003', category: 'bakery' }
      });
    }

    // Timing recommendations
    const daysSinceLastOrder = this.daysSince(profile.behavior.lastOrderDate);
    if (daysSinceLastOrder > 7 && profile.preferences.shoppingFrequency === 'weekly') {
      insights.push({
        type: 'timing',
        confidence: 0.85,
        recommendation: 'Time for your weekly shopping! Your favorites are waiting',
        reason: `It's been ${daysSinceLastOrder} days since your last order`,
        data: { daysSinceLastOrder, usualFrequency: 7 }
      });
    }

    // Vendor recommendations based on scan patterns
    if (profile.preferences.preferredVendors.length > 0) {
      const topVendor = profile.preferences.preferredVendors[0];
      insights.push({
        type: 'vendor',
        confidence: 0.8,
        recommendation: `Check out new items from your favorite vendor`,
        reason: 'You frequently shop at this store',
        data: { vendorId: topVendor }
      });
    }

    // Category predictions
    const seasonalCategories = this.getSeasonalCategories();
    seasonalCategories.forEach(category => {
      if (profile.preferences.favoriteCategories.includes(category.base)) {
        insights.push({
          type: 'category',
          confidence: 0.75,
          recommendation: category.recommendation,
          reason: category.reason,
          data: { category: category.seasonal }
        });
      }
    });

    // Price-based recommendations
    if (profile.preferences.priceRange === 'budget') {
      insights.push({
        type: 'price',
        confidence: 0.7,
        recommendation: 'Special deals on bulk items this week',
        reason: 'Help you save on your regular purchases',
        data: { discountRange: '15-25%' }
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  async predictNextPurchase(customerId: string): Promise<{
    predictedDate: string;
    confidence: number;
    recommendedProducts: any[];
  }> {
    const profile = await this.analyzeCustomerBehavior(customerId);

    // Calculate average days between purchases
    const frequencyDays = this.getFrequencyInDays(profile.preferences.shoppingFrequency);
    const daysSinceLastOrder = this.daysSince(profile.behavior.lastOrderDate);
    const daysUntilNext = Math.max(0, frequencyDays - daysSinceLastOrder);

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysUntilNext);

    // Get recommended products based on history
    const recommendedProducts = await this.getProductRecommendations(profile);

    return {
      predictedDate: predictedDate.toISOString(),
      confidence: this.calculateConfidence(profile.behavior.totalOrders),
      recommendedProducts
    };
  }

  async analyzeQRScanPattern(customerId: string, scanData: any): Promise<{
    pattern: string;
    insights: string[];
    recommendations: string[];
  }> {
    const profile = await this.analyzeCustomerBehavior(customerId);

    // Analyze scan timing
    const scanHour = new Date(scanData.timestamp).getHours();
    const scanDay = new Date(scanData.timestamp).getDay();

    let pattern = 'regular';
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Time-based patterns
    if (scanHour < 10) {
      pattern = 'early-bird';
      insights.push('You prefer shopping in the morning');
      recommendations.push('Fresh produce arrives daily at 7 AM');
    } else if (scanHour > 18) {
      pattern = 'evening-shopper';
      insights.push('You often shop in the evening');
      recommendations.push('Check out our ready-to-eat dinner options');
    }

    // Frequency patterns
    if (profile.behavior.totalOrders > 10) {
      pattern = 'loyal-customer';
      insights.push(`You're a valued regular with ${profile.behavior.totalOrders} orders`);
      recommendations.push('Unlock exclusive Gold tier benefits with 200 more points');
    }

    // Location patterns
    if (scanData.location && profile.behavior.scanLocations.includes(scanData.location)) {
      insights.push(`This is your favorite shopping location`);
      recommendations.push('Ask staff about your personalized offers');
    }

    return { pattern, insights, recommendations };
  }

  private generatePredictions(customer: any, behavior: any, orderHistory: any[]): any {
    const frequencyDays = this.getFrequencyInDays(customer?.preferences?.shoppingFrequency || 'weekly');
    const daysSinceLastOrder = this.daysSince(behavior.lastOrderDate);

    const nextPurchaseDate = new Date();
    nextPurchaseDate.setDate(nextPurchaseDate.getDate() + Math.max(0, frequencyDays - daysSinceLastOrder));

    // Calculate churn risk
    let churnRisk: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastOrder > frequencyDays * 2) churnRisk = 'medium';
    if (daysSinceLastOrder > frequencyDays * 3) churnRisk = 'high';

    // Estimate lifetime value
    const lifetimeValue = behavior.averageOrderValue * (52 / (frequencyDays / 7)) * 2; // 2 year projection

    return {
      nextPurchaseDate: nextPurchaseDate.toISOString(),
      recommendedProducts: this.getTopProductIds(orderHistory),
      likelyCategories: this.extractTopCategories(orderHistory),
      churnRisk,
      lifetimeValue: Math.round(lifetimeValue)
    };
  }

  private async getProductRecommendations(profile: PersonalizationProfile): Promise<any[]> {
    // Mock product recommendations based on profile
    const recommendations = [];

    if (profile.preferences.dietaryRestrictions.includes('gluten-free')) {
      recommendations.push({
        id: 'gol_003',
        name: 'Gluten-Free Sourdough Bread',
        vendor: 'Garden of Light',
        price: 18,
        reason: 'Matches your gluten-free preference'
      });
    }

    if (profile.behavior.frequentlyBoughtItems.includes('hummus')) {
      recommendations.push({
        id: 'qc_002',
        name: 'Classic Tahini',
        vendor: 'Queens Cuisine',
        price: 22,
        reason: 'Perfect pairing with your favorite hummus'
      });
    }

    return recommendations;
  }

  private getMockOrderHistory(customerId: string): any[] {
    // Mock order history for demo
    return [
      {
        id: 'order_001',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        total: 125,
        items: ['hummus', 'pita', 'tahini'],
        categories: ['prepared-foods', 'bakery']
      },
      {
        id: 'order_002',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        total: 98,
        items: ['salad', 'juice', 'nuts'],
        categories: ['fresh-produce', 'beverages', 'snacks']
      }
    ];
  }

  private extractFrequentItems(orders: any[]): string[] {
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach((item: string) => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });
    });

    return Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);
  }

  private extractBrowsingPatterns(scans: any[]): string[] {
    return scans
      .slice(0, 10)
      .map(scan => scan.scan_purpose || 'browse')
      .filter(Boolean);
  }

  private extractTopCategories(orders: any[]): string[] {
    const categoryCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.categories?.forEach((cat: string) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
  }

  private getTopProductIds(orders: any[]): string[] {
    // Mock product IDs based on frequent items
    return ['qc_001', 'gol_002', 'td_003', 'vop_004', 'gd_005'];
  }

  private calculatePriceRange(avgOrderValue: number): 'budget' | 'mid' | 'premium' {
    if (avgOrderValue < 80) return 'budget';
    if (avgOrderValue < 150) return 'mid';
    return 'premium';
  }

  private getFrequencyInDays(frequency: string): number {
    const frequencies: Record<string, number> = {
      'daily': 1,
      'weekly': 7,
      'bi-weekly': 14,
      'monthly': 30
    };
    return frequencies[frequency] || 7;
  }

  private daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateConfidence(totalOrders: number): number {
    // Higher confidence with more order history
    return Math.min(0.95, 0.5 + (totalOrders * 0.05));
  }

  private getSeasonalCategories(): any[] {
    const month = new Date().getMonth();

    // Winter (Dec-Feb)
    if (month >= 11 || month <= 1) {
      return [
        {
          base: 'beverages',
          seasonal: 'hot-drinks',
          recommendation: 'Warm up with our herbal tea selection',
          reason: 'Perfect for cold winter days'
        }
      ];
    }

    // Summer (Jun-Aug)
    if (month >= 5 && month <= 7) {
      return [
        {
          base: 'fresh-produce',
          seasonal: 'summer-fruits',
          recommendation: 'Fresh watermelons and melons in season',
          reason: 'Stay hydrated with seasonal fruits'
        }
      ];
    }

    return [];
  }

  private getDefaultProfile(customerId: string): PersonalizationProfile {
    return {
      customerId,
      preferences: {
        dietaryRestrictions: [],
        favoriteCategories: [],
        shoppingFrequency: 'weekly',
        preferredVendors: [],
        priceRange: 'mid'
      },
      behavior: {
        averageOrderValue: 0,
        totalOrders: 0,
        lastOrderDate: new Date().toISOString(),
        frequentlyBoughtItems: [],
        browsingHistory: [],
        scanLocations: []
      },
      predictions: {
        nextPurchaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        recommendedProducts: [],
        likelyCategories: [],
        churnRisk: 'low',
        lifetimeValue: 0
      }
    };
  }
}

export default PersonalizationService.getInstance();
