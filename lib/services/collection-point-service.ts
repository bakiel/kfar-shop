/**
 * Smart Collection Point Management Service
 * Manages physical collection points with QR/NFC integration
 */

import { AI } from '@/lib/services/ai';
import { CollectionPointData, P2POrderTracking } from '@/lib/services/ai/types';

export interface CollectionPoint extends CollectionPointData {
  // Extended properties for management
  operatingHours: {
    [day: string]: { open: string; close: string } | 'closed';
  };
  contactInfo: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  images: {
    main: string;
    gallery: string[];
    map?: string;
  };
  stats: {
    totalPickups: number;
    averageWaitTime: number;
    rating: number;
    reviewCount: number;
  };
}

export interface PickupSlot {
  id: string;
  collectionPointId: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  capacity: number;
  booked: number;
}

export interface CollectionOrder {
  orderId: string;
  customerId: string;
  vendorId: string;
  collectionPointId: string;
  slot?: PickupSlot;
  status: 'pending' | 'ready' | 'collected' | 'expired';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
  }>;
  qrCode?: string;
  nfcTagId?: string;
  verificationCode?: string;
  timeline: Array<{
    event: string;
    timestamp: Date;
    verified: boolean;
  }>;
}

export class CollectionPointService {
  private collectionPoints: Map<string, CollectionPoint> = new Map();
  private activeOrders: Map<string, CollectionOrder> = new Map();
  private p2pExchanges: Map<string, P2POrderTracking> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all collection points
   */
  async getCollectionPoints(filters?: {
    type?: string;
    location?: { lat: number; lng: number; radius: number };
    features?: string[];
  }): Promise<CollectionPoint[]> {
    let points = Array.from(this.collectionPoints.values());

    // Apply filters
    if (filters?.type) {
      points = points.filter(p => p.type === filters.type);
    }

    if (filters?.location) {
      points = points.filter(p => 
        this.calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          p.location.coordinates[0],
          p.location.coordinates[1]
        ) <= filters.location!.radius
      );
    }

    if (filters?.features && filters.features.length > 0) {
      points = points.filter(p =>
        filters.features!.every(f => p.features.includes(f))
      );
    }

    return points;
  }

  /**
   * Get collection point by ID
   */
  async getCollectionPoint(id: string): Promise<CollectionPoint | null> {
    return this.collectionPoints.get(id) || null;
  }

  /**
   * Find nearest collection point
   */
  async findNearestPoint(lat: number, lng: number, type?: string): Promise<CollectionPoint | null> {
    const points = await this.getCollectionPoints({ type });
    
    if (points.length === 0) return null;

    return points.reduce((nearest, point) => {
      const distanceToPoint = this.calculateDistance(
        lat, lng,
        point.location.coordinates[0],
        point.location.coordinates[1]
      );
      const distanceToNearest = this.calculateDistance(
        lat, lng,
        nearest.location.coordinates[0],
        nearest.location.coordinates[1]
      );
      
      return distanceToPoint < distanceToNearest ? point : nearest;
    });
  }

  /**
   * Check availability for a collection point
   */
  async checkAvailability(
    collectionPointId: string,
    date: Date
  ): Promise<PickupSlot[]> {
    const point = await this.getCollectionPoint(collectionPointId);
    if (!point) return [];

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const hours = point.operatingHours[dayOfWeek];
    
    if (!hours || hours === 'closed') return [];

    // Generate time slots
    const slots: PickupSlot[] = [];
    const slotDuration = 30; // 30 minutes per slot
    
    // Parse operating hours
    const [openHour] = hours.open.split(':').map(Number);
    const [closeHour] = hours.close.split(':').map(Number);
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + slotDuration;
        const endHour = hour + Math.floor(endMinute / 60);
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
        
        // Check if slot is available
        const bookedCount = this.getBookedCount(collectionPointId, date, startTime);
        const capacity = point.type === 'locker' ? 10 : 20;
        
        slots.push({
          id: `${collectionPointId}-${date.toISOString().split('T')[0]}-${startTime}`,
          collectionPointId,
          date,
          startTime,
          endTime,
          available: bookedCount < capacity,
          capacity,
          booked: bookedCount
        });
      }
    }
    
    return slots;
  }

  /**
   * Book a collection slot
   */
  async bookCollection(
    orderId: string,
    collectionPointId: string,
    slot?: PickupSlot
  ): Promise<CollectionOrder> {
    // Generate smart QR code for collection
    const qrContent = await AI.generateQR('collection', {
      orderId,
      collectionPointId,
      slot: slot?.id
    });

    // Generate verification code
    const verificationCode = this.generateVerificationCode();

    const collectionOrder: CollectionOrder = {
      orderId,
      customerId: 'current-user', // Would come from auth
      vendorId: 'vendor-id', // Would come from order
      collectionPointId,
      slot,
      status: 'pending',
      items: [], // Would be populated from order
      qrCode: qrContent.metadata.security.signature,
      verificationCode,
      timeline: [{
        event: 'Collection booked',
        timestamp: new Date(),
        verified: true
      }]
    };

    this.activeOrders.set(orderId, collectionOrder);
    
    // Send notification
    await this.sendCollectionNotification(collectionOrder);
    
    return collectionOrder;
  }

  /**
   * Verify collection with QR/NFC
   */
  async verifyCollection(
    verificationData: string | { qrCode?: string; nfcTagId?: string; code?: string }
  ): Promise<{ success: boolean; order?: CollectionOrder; error?: string }> {
    try {
      let order: CollectionOrder | undefined;
      
      if (typeof verificationData === 'string') {
        // QR code or verification code
        order = Array.from(this.activeOrders.values()).find(o => 
          o.qrCode === verificationData || 
          o.verificationCode === verificationData
        );
      } else {
        // Structured verification data
        order = Array.from(this.activeOrders.values()).find(o => 
          (verificationData.qrCode && o.qrCode === verificationData.qrCode) ||
          (verificationData.nfcTagId && o.nfcTagId === verificationData.nfcTagId) ||
          (verificationData.code && o.verificationCode === verificationData.code)
        );
      }
      
      if (!order) {
        return { success: false, error: 'Invalid verification data' };
      }
      
      if (order.status === 'collected') {
        return { success: false, error: 'Order already collected' };
      }
      
      if (order.status === 'expired') {
        return { success: false, error: 'Collection window expired' };
      }
      
      // Update order status
      order.status = 'collected';
      order.timeline.push({
        event: 'Order collected',
        timestamp: new Date(),
        verified: true
      });
      
      // Update collection point stats
      await this.updateCollectionStats(order.collectionPointId);
      
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Create P2P exchange point
   */
  async createP2PExchange(
    buyerId: string,
    sellerId: string,
    orderId: string,
    preferredLocation?: { lat: number; lng: number }
  ): Promise<P2POrderTracking> {
    // Find suitable exchange point
    const exchangePoint = preferredLocation
      ? await this.findNearestPoint(preferredLocation.lat, preferredLocation.lng, 'p2p')
      : Array.from(this.collectionPoints.values()).find(p => p.type === 'p2p');
    
    if (!exchangePoint) {
      throw new Error('No P2P exchange points available');
    }
    
    // Create P2P tracking with AI
    const tracking = await AI.trackP2P({
      id: orderId,
      buyerId,
      sellerId,
      locationId: exchangePoint.id
    });
    
    // Add location details
    tracking.location = exchangePoint;
    
    this.p2pExchanges.set(orderId, tracking);
    
    // Notify both parties
    await this.notifyP2PParties(tracking);
    
    return tracking;
  }

  /**
   * Update P2P exchange status
   */
  async updateP2PStatus(
    orderId: string,
    status: 'ready' | 'collected' | 'completed',
    verifiedBy: 'buyer' | 'seller'
  ): Promise<P2POrderTracking | null> {
    const tracking = this.p2pExchanges.get(orderId);
    if (!tracking) return null;
    
    tracking.status = status;
    tracking.timeline.push({
      event: `${status} - verified by ${verifiedBy}`,
      timestamp: new Date(),
      location: tracking.location?.name,
      verified: true
    });
    
    // If both parties confirmed, mark as completed
    if (status === 'collected' && 
        tracking.timeline.filter(t => t.event.includes('collected')).length >= 2) {
      tracking.status = 'completed';
    }
    
    return tracking;
  }

  /**
   * Get locker access code
   */
  async getLockerAccess(
    orderId: string,
    verificationData: string
  ): Promise<{ success: boolean; lockerNumber?: string; accessCode?: string }> {
    const verification = await this.verifyCollection(verificationData);
    
    if (!verification.success || !verification.order) {
      return { success: false };
    }
    
    const point = await this.getCollectionPoint(verification.order.collectionPointId);
    if (!point || point.type !== 'locker') {
      return { success: false };
    }
    
    // Generate temporary access code
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const lockerNumber = Math.floor(Math.random() * 20 + 1).toString();
    
    // In real implementation, this would interface with locker hardware
    console.log(`Locker ${lockerNumber} unlocked with code ${accessCode}`);
    
    return {
      success: true,
      lockerNumber,
      accessCode
    };
  }

  // Helper methods

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private getBookedCount(collectionPointId: string, date: Date, time: string): number {
    // Count bookings for this slot
    return Array.from(this.activeOrders.values()).filter(order =>
      order.collectionPointId === collectionPointId &&
      order.slot?.date.toDateString() === date.toDateString() &&
      order.slot?.startTime === time &&
      order.status !== 'collected'
    ).length;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async sendCollectionNotification(order: CollectionOrder): Promise<void> {
    // In real implementation, send SMS/email/push notification
    console.log('Collection notification sent for order:', order.orderId);
  }

  private async notifyP2PParties(tracking: P2POrderTracking): Promise<void> {
    // Notify buyer and seller about exchange details
    console.log('P2P exchange notification sent:', tracking.orderId);
  }

  private async updateCollectionStats(collectionPointId: string): Promise<void> {
    const point = this.collectionPoints.get(collectionPointId);
    if (point) {
      point.stats.totalPickups++;
      // Update other stats as needed
    }
  }

  // Initialize demo data
  private initializeDemoData(): void {
    // Main collection locker
    this.collectionPoints.set('cp-001', {
      id: 'cp-001',
      name: 'Community Center Smart Lockers',
      type: 'locker',
      location: {
        address: 'Community Center, Village of Peace, Dimona',
        coordinates: [31.0687, 35.0274],
        plusCode: '3F9J+7F'
      },
      availability: {
        status: 'available',
        capacity: { total: 20, available: 15 }
      },
      features: ['24/7 access', 'refrigerated', 'qr-scanner', 'nfc-reader'],
      operatingHours: {
        sunday: { open: '00:00', close: '23:59' },
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '15:00' },
        saturday: 'closed'
      },
      contactInfo: {
        phone: '+972-50-123-4567',
        whatsapp: '+972501234567'
      },
      images: {
        main: '/images/collection-points/smart-lockers.jpg',
        gallery: ['/images/collection-points/locker-1.jpg']
      },
      stats: {
        totalPickups: 1247,
        averageWaitTime: 2,
        rating: 4.8,
        reviewCount: 234
      }
    });

    // People Store counter
    this.collectionPoints.set('cp-002', {
      id: 'cp-002',
      name: 'People Store Pickup Counter',
      type: 'counter',
      location: {
        address: 'People Store, Main Street, Village of Peace',
        coordinates: [31.0697, 35.0284]
      },
      availability: {
        status: 'available',
        capacity: { total: 50, available: 45 }
      },
      features: ['staff-assisted', 'packaging', 'qr-scanner'],
      operatingHours: {
        sunday: { open: '08:00', close: '20:00' },
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '15:00' },
        saturday: 'closed'
      },
      contactInfo: {
        phone: '+972-50-234-5678',
        email: 'pickup@peoplestore.kfar'
      },
      images: {
        main: '/images/vendors/people-store-front.jpg',
        gallery: []
      },
      stats: {
        totalPickups: 3456,
        averageWaitTime: 5,
        rating: 4.6,
        reviewCount: 567
      }
    });

    // P2P Exchange point
    this.collectionPoints.set('cp-003', {
      id: 'cp-003',
      name: 'Community Plaza P2P Exchange',
      type: 'p2p',
      location: {
        address: 'Central Plaza, Village of Peace',
        coordinates: [31.0690, 35.0280]
      },
      availability: {
        status: 'available',
        capacity: { total: 100, available: 98 }
      },
      features: ['public-space', 'security-camera', 'covered-area'],
      operatingHours: {
        sunday: { open: '06:00', close: '22:00' },
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '15:00' },
        saturday: { open: '20:00', close: '23:00' }
      },
      contactInfo: {
        phone: '+972-50-345-6789'
      },
      images: {
        main: '/images/community/plaza.jpg',
        gallery: []
      },
      stats: {
        totalPickups: 892,
        averageWaitTime: 0,
        rating: 4.7,
        reviewCount: 123
      }
    });
  }
}

// Create singleton instance
let collectionService: CollectionPointService | null = null;

export function getCollectionService(): CollectionPointService {
  if (!collectionService) {
    collectionService = new CollectionPointService();
  }
  return collectionService;
}

// Export convenience methods
export const CollectionPoints = {
  getAll: (filters?: any) => getCollectionService().getCollectionPoints(filters),
  getById: (id: string) => getCollectionService().getCollectionPoint(id),
  findNearest: (lat: number, lng: number, type?: string) => 
    getCollectionService().findNearestPoint(lat, lng, type),
  checkAvailability: (pointId: string, date: Date) => 
    getCollectionService().checkAvailability(pointId, date),
  bookCollection: (orderId: string, pointId: string, slot?: any) =>
    getCollectionService().bookCollection(orderId, pointId, slot),
  verify: (data: any) => getCollectionService().verifyCollection(data),
  createP2P: (buyer: string, seller: string, order: string, location?: any) =>
    getCollectionService().createP2PExchange(buyer, seller, order, location),
  updateP2P: (orderId: string, status: any, verifiedBy: any) =>
    getCollectionService().updateP2PStatus(orderId, status, verifiedBy),
  getLockerAccess: (orderId: string, verification: string) =>
    getCollectionService().getLockerAccess(orderId, verification)
};