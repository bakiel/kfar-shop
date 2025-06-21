// QR Code Tracking System for Admin Panel
import { supabase } from '@/lib/supabase/client';

export interface QRScan {
  id: string;
  qrType: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  qrCode: string;
  scannedAt: Date;
  userId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
  metadata: any;
}

export interface QRAnalytics {
  totalScans: number;
  uniqueUsers: number;
  scansByType: Record<string, number>;
  scansByDay: Array<{
    date: string;
    count: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    scanCount: number;
  }>;
}

export class QRTrackingService {
  // Track QR code scan
  static async trackScan(qrData: {
    type: string;
    code: string;
    userId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const scan: QRScan = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        qrType: qrData.type as any,
        qrCode: qrData.code,
        scannedAt: new Date(),
        userId: qrData.userId,
        metadata: qrData.metadata
      };
      
      // In production, save to database
      if (typeof window !== 'undefined') {
        const scans = JSON.parse(localStorage.getItem('qr-scans') || '[]');
        scans.push(scan);
        localStorage.setItem('qr-scans', JSON.stringify(scans));
      }
      
      console.log('QR Scan tracked:', scan);
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  }
  
  // Get analytics for admin panel
  static async getAnalytics(vendorId?: string): Promise<QRAnalytics> {
    try {
      // In production, fetch from database
      const scans = JSON.parse(localStorage.getItem('qr-scans') || '[]') as QRScan[];
      
      // Filter by vendor if specified
      const relevantScans = vendorId 
        ? scans.filter(s => s.metadata?.vendorId === vendorId)
        : scans;
      
      // Calculate analytics
      const analytics: QRAnalytics = {
        totalScans: relevantScans.length,
        uniqueUsers: new Set(relevantScans.map(s => s.userId).filter(Boolean)).size,
        scansByType: relevantScans.reduce((acc, scan) => {
          acc[scan.qrType] = (acc[scan.qrType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        scansByDay: this.groupScansByDay(relevantScans),
        topProducts: this.getTopProducts(relevantScans)
      };
      
      return analytics;
    } catch (error) {
      console.error('Error getting QR analytics:', error);
      return {
        totalScans: 0,
        uniqueUsers: 0,
        scansByType: {},
        scansByDay: [],
        topProducts: []
      };
    }
  }
  
  private static groupScansByDay(scans: QRScan[]): Array<{date: string; count: number}> {
    const groups = scans.reduce((acc, scan) => {
      const date = new Date(scan.scannedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(groups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }
  
  private static getTopProducts(scans: QRScan[]): Array<{productId: string; productName: string; scanCount: number}> {
    const productScans = scans.filter(s => s.qrType === 'product');
    const counts = productScans.reduce((acc, scan) => {
      const productId = scan.metadata?.productId;
      if (productId) {
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName: scan.metadata?.productName || 'Unknown Product',
            scanCount: 0
          };
        }
        acc[productId].scanCount++;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(counts)
      .sort((a: any, b: any) => b.scanCount - a.scanCount)
      .slice(0, 10);
  }
}

export default QRTrackingService;