// Mock QR Tracking Service - No external dependencies

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

class MockQRTrackingService {
  private scans: QRScan[] = [];

  async trackScan(scan: Partial<QRScan>): Promise<void> {
    // Simply log the scan in memory - no external calls
    const newScan: QRScan = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      qrType: scan.qrType || 'product',
      qrCode: scan.qrCode || '',
      scannedAt: new Date(),
      metadata: scan.metadata || {},
      ...scan
    };
    
    this.scans.push(newScan);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('QR Code Scanned:', newScan);
    }
  }

  async getScans(): Promise<QRScan[]> {
    return this.scans;
  }

  async getAnalytics(): Promise<any> {
    return {
      totalScans: this.scans.length,
      uniqueUsers: 0,
      scansByType: {},
      scansByDay: [],
      topProducts: []
    };
  }
}

// Export singleton instance
const QRTrackingService = new MockQRTrackingService();
export default QRTrackingService;