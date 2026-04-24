// Customer Analytics & Tracking System for KiFar Marketplace
// Integrates with tags, QR codes, and provides advanced insights

import { tagManager, Tag } from './tag-manager';
import { qrService } from './qr-service';

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  memberType: 'guest' | 'registered' | 'community' | 'vip' | 'vendor';
  joinDate: Date;
  lastActive: Date;
  tags: string[];
  preferences: CustomerPreferences;
  metrics: CustomerMetrics;
  digitalId?: DigitalID;
  consentTracking: ConsentRecord;
}

export interface CustomerPreferences {
  language: 'en' | 'he';
  currency: 'ILS' | 'USD' | 'EUR' | 'GBP';
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  communicationChannels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  marketingConsent: boolean;
}

export interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  favoriteVendors: { vendorId: string; orderCount: number }[];
  productInteractions: ProductInteraction[];
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nps?: number; // Net Promoter Score
  clv: number; // Customer Lifetime Value
  churnRisk: 'low' | 'medium' | 'high';
}

export interface ProductInteraction {
  productId: string;
  interactionType: 'view' | 'cart' | 'purchase' | 'review' | 'share';
  timestamp: Date;
  sessionId: string;
  source: 'web' | 'app' | 'qr' | 'nfc';
  duration?: number; // Time spent on product page in seconds
}

export interface DigitalID {
  cardNumber: string;
  qrCode: string;
  nfcId?: string;
  issuedDate: Date;
  expiryDate?: Date;
  benefits: string[];
  accessLevel: number;
}

export interface ConsentRecord {
  dataCollection: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  cookies: boolean;
  lastUpdated: Date;
  ipAddress?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customerCount: number;
  tags: string[];
  campaigns?: string[];
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  weight?: number;
}

export interface CustomerJourney {
  customerId: string;
  touchpoints: TouchPoint[];
  currentStage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
  predictedNextAction?: string;
  engagementScore: number;
}

export interface TouchPoint {
  id: string;
  type: 'website' | 'email' | 'sms' | 'qr' | 'nfc' | 'store' | 'support';
  action: string;
  timestamp: Date;
  channel: string;
  outcome?: 'positive' | 'neutral' | 'negative';
  data?: any;
}

export interface Analytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    newCustomers: number;
    returningCustomers: number;
    averageSessionDuration: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    customerSatisfaction: number;
    revenue: number;
    transactions: number;
  };
  topProducts: { productId: string; sales: number }[];
  topCategories: { category: string; revenue: number }[];
  customerSegments: { segmentId: string; count: number; revenue: number }[];
}

export class CustomerAnalyticsService {
  private customers: Map<string, Customer> = new Map();
  private segments: Map<string, CustomerSegment> = new Map();
  private journeys: Map<string, CustomerJourney> = new Map();
  private interactions: ProductInteraction[] = [];

  constructor() {
    this.initializeDefaultSegments();
  }

  private initializeDefaultSegments(): void {
    // VIP Segment
    this.createSegment({
      id: 'vip-customers',
      name: 'VIP Customers',
      description: 'High-value customers with frequent purchases',
      criteria: [
        { field: 'metrics.totalSpent', operator: 'greater', value: 5000 },
        { field: 'metrics.totalOrders', operator: 'greater', value: 20 }
      ],
      customerCount: 0,
      tags: ['vip', 'high-value']
    });

    // Community Members
    this.createSegment({
      id: 'community-members',
      name: 'Community Members',
      description: 'Village of Peace community members',
      criteria: [
        { field: 'memberType', operator: 'equals', value: 'community' }
      ],
      customerCount: 0,
      tags: ['community-member', 'local']
    });

    // At Risk
    this.createSegment({
      id: 'at-risk',
      name: 'At Risk Customers',
      description: 'Customers who haven\'t ordered recently',
      criteria: [
        { field: 'metrics.lastOrderDate', operator: 'less', value: 30 }, // days ago
        { field: 'metrics.churnRisk', operator: 'equals', value: 'high' }
      ],
      customerCount: 0,
      tags: ['at-risk', 'retention-needed']
    });

    // New Customers
    this.createSegment({
      id: 'new-customers',
      name: 'New Customers',
      description: 'Customers who joined in the last 30 days',
      criteria: [
        { field: 'joinDate', operator: 'greater', value: 30 } // days ago
      ],
      customerCount: 0,
      tags: ['new', 'first-time']
    });
  }

  // Customer Management
  createCustomer(customerData: Partial<Customer>): Customer {
    const customerId = customerData.id || this.generateCustomerId();
    
    const customer: Customer = {
      id: customerId,
      email: customerData.email!,
      name: customerData.name!,
      phone: customerData.phone,
      memberType: customerData.memberType || 'guest',
      joinDate: new Date(),
      lastActive: new Date(),
      tags: customerData.tags || [],
      preferences: customerData.preferences || {
        language: 'en',
        currency: 'ILS',
        dietaryRestrictions: [],
        favoriteCategories: [],
        communicationChannels: {
          email: true,
          sms: false,
          whatsapp: false,
          push: false
        },
        marketingConsent: false
      },
      metrics: customerData.metrics || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteVendors: [],
        productInteractions: [],
        loyaltyPoints: 0,
        tier: 'bronze',
        clv: 0,
        churnRisk: 'low'
      },
      digitalId: customerData.digitalId,
      consentTracking: customerData.consentTracking || {
        dataCollection: true,
        marketing: false,
        thirdPartySharing: false,
        cookies: true,
        lastUpdated: new Date()
      }
    };

    // Auto-tag based on member type
    if (customer.memberType === 'community') {
      tagManager.tagEntity(customerId, 'customer', ['community-member']);
    } else if (customer.memberType === 'vip') {
      tagManager.tagEntity(customerId, 'customer', ['vip']);
    }

    this.customers.set(customerId, customer);
    this.updateSegments(customer);
    
    return customer;
  }

  getCustomer(customerId: string): Customer | undefined {
    return this.customers.get(customerId);
  }

  updateCustomer(customerId: string, updates: Partial<Customer>): Customer | undefined {
    const customer = this.customers.get(customerId);
    if (!customer) return undefined;

    const updatedCustomer = {
      ...customer,
      ...updates,
      lastActive: new Date()
    };

    this.customers.set(customerId, updatedCustomer);
    this.updateSegments(updatedCustomer);
    
    return updatedCustomer;
  }

  // Track Interactions
  trackInteraction(interaction: ProductInteraction): void {
    this.interactions.push(interaction);
    
    const customer = Array.from(this.customers.values()).find(c => 
      c.metrics.productInteractions.some(i => i.sessionId === interaction.sessionId)
    );
    
    if (customer) {
      customer.metrics.productInteractions.push(interaction);
      this.updateCustomerMetrics(customer.id);
    }
  }

  // Customer Journey Tracking
  trackTouchpoint(customerId: string, touchpoint: Omit<TouchPoint, 'id'>): void {
    let journey = this.journeys.get(customerId);
    
    if (!journey) {
      journey = {
        customerId,
        touchpoints: [],
        currentStage: 'awareness',
        engagementScore: 0
      };
      this.journeys.set(customerId, journey);
    }

    const newTouchpoint: TouchPoint = {
      ...touchpoint,
      id: `tp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    journey.touchpoints.push(newTouchpoint);
    journey.engagementScore = this.calculateEngagementScore(journey);
    journey.currentStage = this.determineJourneyStage(journey);
    journey.predictedNextAction = this.predictNextAction(journey);
  }

  private calculateEngagementScore(journey: CustomerJourney): number {
    const recentTouchpoints = journey.touchpoints.filter(tp => {
      const daysSince = (Date.now() - tp.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    let score = 0;
    recentTouchpoints.forEach(tp => {
      switch (tp.type) {
        case 'purchase': score += 10; break;
        case 'website': score += 2; break;
        case 'email': score += 3; break;
        case 'qr': score += 5; break;
        case 'store': score += 8; break;
        case 'support': score += 4; break;
      }
      
      if (tp.outcome === 'positive') score += 2;
      if (tp.outcome === 'negative') score -= 1;
    });

    return Math.min(100, score);
  }

  private determineJourneyStage(journey: CustomerJourney): CustomerJourney['currentStage'] {
    const customer = this.getCustomer(journey.customerId);
    if (!customer) return 'awareness';

    if (customer.metrics.totalOrders === 0) return 'consideration';
    if (customer.metrics.totalOrders === 1) return 'purchase';
    if (customer.metrics.totalOrders > 5 && customer.metrics.nps && customer.metrics.nps > 8) return 'advocacy';
    return 'retention';
  }

  private predictNextAction(journey: CustomerJourney): string {
    // Simple prediction based on recent patterns
    const lastTouchpoint = journey.touchpoints[journey.touchpoints.length - 1];
    if (!lastTouchpoint) return 'browse_products';

    switch (lastTouchpoint.type) {
      case 'website':
        return lastTouchpoint.action.includes('product') ? 'add_to_cart' : 'browse_categories';
      case 'email':
        return 'visit_website';
      case 'qr':
        return 'complete_purchase';
      case 'support':
        return 'leave_review';
      default:
        return 'explore_vendors';
    }
  }

  // Segmentation
  createSegment(segment: CustomerSegment): void {
    this.segments.set(segment.id, segment);
    this.updateSegmentMembers(segment);
  }

  private updateSegments(customer: Customer): void {
    this.segments.forEach(segment => {
      const qualifies = this.customerQualifiesForSegment(customer, segment);
      const customerTags = tagManager.getEntityTags(customer.id, 'customer');
      
      if (qualifies && !customerTags.includes(segment.id)) {
        tagManager.tagEntity(customer.id, 'customer', [segment.id]);
        segment.customerCount++;
      } else if (!qualifies && customerTags.includes(segment.id)) {
        tagManager.untagEntity(customer.id, 'customer', [segment.id]);
        segment.customerCount--;
      }
    });
  }

  private customerQualifiesForSegment(customer: Customer, segment: CustomerSegment): boolean {
    return segment.criteria.every(criterion => {
      const value = this.getNestedValue(customer, criterion.field);
      
      switch (criterion.operator) {
        case 'equals':
          return value === criterion.value;
        case 'contains':
          return Array.isArray(value) ? value.includes(criterion.value) : String(value).includes(criterion.value);
        case 'greater':
          return Number(value) > Number(criterion.value);
        case 'less':
          return Number(value) < Number(criterion.value);
        case 'between':
          return Number(value) >= criterion.value[0] && Number(value) <= criterion.value[1];
        case 'in':
          return criterion.value.includes(value);
        default:
          return false;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private updateSegmentMembers(segment: CustomerSegment): void {
    let count = 0;
    this.customers.forEach(customer => {
      if (this.customerQualifiesForSegment(customer, segment)) {
        count++;
      }
    });
    segment.customerCount = count;
  }

  // Analytics
  getAnalytics(period: Analytics['period'], startDate?: Date): Analytics {
    const endDate = new Date();
    if (!startDate) {
      startDate = new Date();
      switch (period) {
        case 'day': startDate.setDate(startDate.getDate() - 1); break;
        case 'week': startDate.setDate(startDate.getDate() - 7); break;
        case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(startDate.getMonth() - 3); break;
        case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
      }
    }

    // Calculate metrics
    const customers = Array.from(this.customers.values());
    const periodCustomers = customers.filter(c => c.joinDate >= startDate);
    const activeCustomers = customers.filter(c => c.lastActive >= startDate);

    const interactions = this.interactions.filter(i => i.timestamp >= startDate);
    const purchases = interactions.filter(i => i.interactionType === 'purchase');
    const carts = interactions.filter(i => i.interactionType === 'cart');

    return {
      period,
      startDate,
      endDate,
      metrics: {
        newCustomers: periodCustomers.length,
        returningCustomers: activeCustomers.filter(c => c.metrics.totalOrders > 1).length,
        averageSessionDuration: this.calculateAverageSessionDuration(interactions),
        conversionRate: purchases.length / (interactions.filter(i => i.interactionType === 'view').length || 1),
        cartAbandonmentRate: 1 - (purchases.length / (carts.length || 1)),
        customerSatisfaction: this.calculateAverageNPS(activeCustomers),
        revenue: activeCustomers.reduce((sum, c) => sum + c.metrics.totalSpent, 0),
        transactions: purchases.length
      },
      topProducts: this.getTopProducts(purchases, 10),
      topCategories: this.getTopCategories(purchases, 5),
      customerSegments: this.getSegmentAnalytics()
    };
  }

  private calculateAverageSessionDuration(interactions: ProductInteraction[]): number {
    const sessions = new Map<string, number>();
    interactions.forEach(i => {
      if (i.duration) {
        const current = sessions.get(i.sessionId) || 0;
        sessions.set(i.sessionId, current + i.duration);
      }
    });
    
    const durations = Array.from(sessions.values());
    return durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  private calculateAverageNPS(customers: Customer[]): number {
    const scores = customers.map(c => c.metrics.nps).filter(nps => nps !== undefined) as number[];
    return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private getTopProducts(purchases: ProductInteraction[], limit: number): { productId: string; sales: number }[] {
    const productSales = new Map<string, number>();
    purchases.forEach(p => {
      const current = productSales.get(p.productId) || 0;
      productSales.set(p.productId, current + 1);
    });
    
    return Array.from(productSales.entries())
      .map(([productId, sales]) => ({ productId, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  private getTopCategories(purchases: ProductInteraction[], limit: number): { category: string; revenue: number }[] {
    // This would need product category mapping
    return [];
  }

  private getSegmentAnalytics(): { segmentId: string; count: number; revenue: number }[] {
    return Array.from(this.segments.entries()).map(([segmentId, segment]) => {
      const segmentCustomers = Array.from(this.customers.values()).filter(c => 
        tagManager.getEntityTags(c.id, 'customer').includes(segmentId)
      );
      
      return {
        segmentId,
        count: segmentCustomers.length,
        revenue: segmentCustomers.reduce((sum, c) => sum + c.metrics.totalSpent, 0)
      };
    });
  }

  // Customer Metrics Update
  private updateCustomerMetrics(customerId: string): void {
    const customer = this.customers.get(customerId);
    if (!customer) return;

    // Update CLV
    customer.metrics.clv = this.calculateCLV(customer);
    
    // Update churn risk
    customer.metrics.churnRisk = this.calculateChurnRisk(customer);
    
    // Update tier
    customer.metrics.tier = this.calculateTier(customer);
  }

  private calculateCLV(customer: Customer): number {
    // Simple CLV calculation
    const avgOrderValue = customer.metrics.averageOrderValue;
    const orderFrequency = customer.metrics.totalOrders / 
      ((Date.now() - customer.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)); // orders per month
    const estimatedLifespan = 24; // months
    
    return avgOrderValue * orderFrequency * estimatedLifespan;
  }

  private calculateChurnRisk(customer: Customer): 'low' | 'medium' | 'high' {
    if (!customer.metrics.lastOrderDate) return 'high';
    
    const daysSinceLastOrder = (Date.now() - customer.metrics.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
    const avgDaysBetweenOrders = 30; // This should be calculated from actual data
    
    if (daysSinceLastOrder < avgDaysBetweenOrders) return 'low';
    if (daysSinceLastOrder < avgDaysBetweenOrders * 2) return 'medium';
    return 'high';
  }

  private calculateTier(customer: Customer): CustomerMetrics['tier'] {
    const score = customer.metrics.totalSpent * 0.5 + 
                  customer.metrics.totalOrders * 10 + 
                  customer.metrics.loyaltyPoints;
    
    if (score >= 10000) return 'platinum';
    if (score >= 5000) return 'gold';
    if (score >= 1000) return 'silver';
    return 'bronze';
  }

  // Digital ID Management
  async issueDigitalID(customerId: string): Promise<DigitalID> {
    const customer = this.customers.get(customerId);
    if (!customer) throw new Error('Customer not found');

    const digitalId: DigitalID = {
      cardNumber: `VOP${Date.now()}${customerId.substr(-4)}`,
      qrCode: await qrService.generateQRCode('membership', {
        memberId: customerId,
        memberName: customer.name,
        memberType: customer.memberType,
        joinDate: customer.joinDate,
        benefits: this.getMemberBenefits(customer),
        points: customer.metrics.loyaltyPoints,
        tier: customer.metrics.tier
      }).then(qr => qr.id),
      issuedDate: new Date(),
      benefits: this.getMemberBenefits(customer),
      accessLevel: this.getAccessLevel(customer)
    };

    customer.digitalId = digitalId;
    this.customers.set(customerId, customer);
    
    return digitalId;
  }

  private getMemberBenefits(customer: Customer): string[] {
    const benefits: string[] = ['Member Pricing'];
    
    if (customer.memberType === 'community') {
      benefits.push('Free Local Delivery', 'Priority Support', 'Community Events');
    }
    
    if (customer.metrics.tier === 'gold' || customer.metrics.tier === 'platinum') {
      benefits.push('VIP Support', 'Early Access', 'Exclusive Offers');
    }
    
    return benefits;
  }

  private getAccessLevel(customer: Customer): number {
    switch (customer.memberType) {
      case 'vendor': return 5;
      case 'vip': return 4;
      case 'community': return 3;
      case 'registered': return 2;
      default: return 1;
    }
  }

  private generateCustomerId(): string {
    return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export for persistence
  exportData() {
    return {
      customers: Array.from(this.customers.values()),
      segments: Array.from(this.segments.values()),
      journeys: Array.from(this.journeys.values()),
      interactions: this.interactions
    };
  }
}

// Singleton instance
export const customerAnalytics = new CustomerAnalyticsService();