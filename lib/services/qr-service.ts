// QR Code Service for KiFar Marketplace
// Handles QR code generation, scanning, and management for various use cases

export interface QRCodeData {
  id: string;
  type: QRCodeType;
  data: any;
  shortCode: string;
  fullUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export type QRCodeType = 
  | 'payment'        // Payment QR codes
  | 'product'        // Product information
  | 'order'          // Order tracking
  | 'vendor'         // Vendor profile
  | 'support'        // Support ticket
  | 'membership'     // Digital ID card
  | 'event'          // Event check-in
  | 'discount'       // Discount/coupon
  | 'return'         // Return process
  | 'review'         // Product review
  | 'referral'       // Referral program
  | 'nfc-tag';       // NFC tag data

export interface PaymentQRData {
  orderId: string;
  amount: number;
  currency: string;
  vendorId: string;
  customerId?: string;
  items: { productId: string; quantity: number; price: number }[];
  paymentMethods: string[];
  callbackUrl: string;
}

export interface ProductQRData {
  productId: string;
  vendorId: string;
  batchId?: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  ingredients?: string[];
  certifications?: string[];
  sustainabilityInfo?: any;
}

export interface MembershipQRData {
  memberId: string;
  memberName: string;
  memberType: 'community' | 'vip' | 'vendor' | 'tourist';
  joinDate: Date;
  benefits: string[];
  points?: number;
  tier?: string;
  photo?: string;
}

export interface NFCTagData {
  tagId: string;
  tagType: 'product' | 'vendor' | 'access' | 'info';
  linkedEntity: string;
  permissions?: string[];
  validFrom?: Date;
  validUntil?: Date;
}

export interface QRScanResult {
  success: boolean;
  type: QRCodeType;
  data: any;
  action?: QRAction;
  message?: string;
  redirectUrl?: string;
}

export interface QRAction {
  type: 'redirect' | 'display' | 'process' | 'authenticate';
  handler: string;
  params?: any;
}

export interface QRTemplate {
  id: string;
  name: string;
  type: QRCodeType;
  design: {
    logo?: string;
    color?: string;
    style?: 'square' | 'rounded' | 'dots';
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  };
  dataFields: {
    field: string;
    required: boolean;
    type: string;
    validation?: any;
  }[];
}

export class QRService {
  private qrCodes: Map<string, QRCodeData> = new Map();
  private shortCodeMap: Map<string, string> = new Map();
  private templates: Map<string, QRTemplate> = new Map();
  private baseUrl: string = 'https://kfar.marketplace/qr';

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Payment QR Template
    this.templates.set('payment', {
      id: 'payment',
      name: 'Payment QR Code',
      type: 'payment',
      design: {
        logo: '/images/logos/kfar_icon_leaf_green.png',
        color: '#478c0b',
        style: 'rounded',
        errorCorrection: 'M'
      },
      dataFields: [
        { field: 'orderId', required: true, type: 'string' },
        { field: 'amount', required: true, type: 'number' },
        { field: 'currency', required: true, type: 'string' },
        { field: 'vendorId', required: true, type: 'string' }
      ]
    });

    // Product QR Template
    this.templates.set('product', {
      id: 'product',
      name: 'Product Information QR',
      type: 'product',
      design: {
        color: '#f6af0d',
        style: 'square',
        errorCorrection: 'H'
      },
      dataFields: [
        { field: 'productId', required: true, type: 'string' },
        { field: 'vendorId', required: true, type: 'string' },
        { field: 'batchId', required: false, type: 'string' }
      ]
    });

    // Membership QR Template
    this.templates.set('membership', {
      id: 'membership',
      name: 'Digital Membership Card',
      type: 'membership',
      design: {
        logo: '/images/logos/kfar_logo_africa_heritage.png',
        color: '#c23c09',
        style: 'dots',
        errorCorrection: 'Q'
      },
      dataFields: [
        { field: 'memberId', required: true, type: 'string' },
        { field: 'memberName', required: true, type: 'string' },
        { field: 'memberType', required: true, type: 'string' }
      ]
    });
  }

  // QR Code Generation
  async generateQRCode(
    type: QRCodeType,
    data: any,
    options?: {
      expiresIn?: number; // minutes
      maxUsage?: number;
      template?: string;
      customDesign?: any;
    }
  ): Promise<QRCodeData> {
    const id = this.generateId(type);
    const shortCode = this.generateShortCode();
    
    const qrData: QRCodeData = {
      id,
      type,
      data,
      shortCode,
      fullUrl: `${this.baseUrl}/${shortCode}`,
      createdAt: new Date(),
      expiresAt: options?.expiresIn 
        ? new Date(Date.now() + options.expiresIn * 60 * 1000)
        : undefined,
      usageCount: 0,
      maxUsage: options?.maxUsage,
      isActive: true,
      metadata: {
        template: options?.template,
        design: options?.customDesign
      }
    };

    this.qrCodes.set(id, qrData);
    this.shortCodeMap.set(shortCode, id);

    // Generate actual QR code image
    const qrImage = await this.generateQRImage(qrData);
    qrData.metadata = { ...qrData.metadata, qrImage };

    return qrData;
  }

  // Generate QR code image (mock implementation)
  private async generateQRImage(qrData: QRCodeData): Promise<string> {
    // In production, use a real QR code library like qrcode.js
    // This would generate an actual QR code image
    return `data:image/png;base64,${Buffer.from(JSON.stringify({
      url: qrData.fullUrl,
      type: qrData.type,
      id: qrData.id
    })).toString('base64')}`;
  }

  // QR Code Scanning
  async scanQRCode(code: string): Promise<QRScanResult> {
    // Extract short code from URL or use directly
    const shortCode = code.includes('/') 
      ? code.split('/').pop()! 
      : code;

    const qrId = this.shortCodeMap.get(shortCode);
    if (!qrId) {
      return {
        success: false,
        type: 'payment',
        data: null,
        message: 'Invalid or expired QR code'
      };
    }

    const qrData = this.qrCodes.get(qrId);
    if (!qrData || !qrData.isActive) {
      return {
        success: false,
        type: 'payment',
        data: null,
        message: 'QR code is no longer active'
      };
    }

    // Check expiration
    if (qrData.expiresAt && new Date() > qrData.expiresAt) {
      qrData.isActive = false;
      return {
        success: false,
        type: qrData.type,
        data: null,
        message: 'QR code has expired'
      };
    }

    // Check usage limit
    if (qrData.maxUsage && qrData.usageCount >= qrData.maxUsage) {
      qrData.isActive = false;
      return {
        success: false,
        type: qrData.type,
        data: null,
        message: 'QR code usage limit reached'
      };
    }

    // Increment usage
    qrData.usageCount++;
    
    // Process based on type
    const result = await this.processQRCode(qrData);
    
    return result;
  }

  private async processQRCode(qrData: QRCodeData): Promise<QRScanResult> {
    switch (qrData.type) {
      case 'payment':
        return this.processPaymentQR(qrData);
      
      case 'product':
        return this.processProductQR(qrData);
      
      case 'order':
        return this.processOrderQR(qrData);
      
      case 'membership':
        return this.processMembershipQR(qrData);
      
      case 'support':
        return this.processSupportQR(qrData);
      
      case 'discount':
        return this.processDiscountQR(qrData);
      
      case 'return':
        return this.processReturnQR(qrData);
      
      default:
        return {
          success: true,
          type: qrData.type,
          data: qrData.data,
          action: {
            type: 'display',
            handler: 'default'
          }
        };
    }
  }

  private async processPaymentQR(qrData: QRCodeData): Promise<QRScanResult> {
    const paymentData = qrData.data as PaymentQRData;
    
    return {
      success: true,
      type: 'payment',
      data: paymentData,
      action: {
        type: 'redirect',
        handler: 'payment',
        params: {
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          currency: paymentData.currency
        }
      },
      redirectUrl: `/checkout/qr/${qrData.shortCode}`
    };
  }

  private async processProductQR(qrData: QRCodeData): Promise<QRScanResult> {
    const productData = qrData.data as ProductQRData;
    
    return {
      success: true,
      type: 'product',
      data: productData,
      action: {
        type: 'redirect',
        handler: 'product',
        params: {
          productId: productData.productId,
          vendorId: productData.vendorId
        }
      },
      redirectUrl: `/product/${productData.productId}`
    };
  }

  private async processOrderQR(qrData: QRCodeData): Promise<QRScanResult> {
    return {
      success: true,
      type: 'order',
      data: qrData.data,
      action: {
        type: 'redirect',
        handler: 'order',
        params: {
          orderId: qrData.data.orderId
        }
      },
      redirectUrl: `/orders/${qrData.data.orderId}`
    };
  }

  private async processMembershipQR(qrData: QRCodeData): Promise<QRScanResult> {
    const memberData = qrData.data as MembershipQRData;
    
    return {
      success: true,
      type: 'membership',
      data: memberData,
      action: {
        type: 'authenticate',
        handler: 'membership',
        params: {
          memberId: memberData.memberId,
          memberType: memberData.memberType
        }
      },
      message: `Welcome ${memberData.memberName}!`
    };
  }

  private async processSupportQR(qrData: QRCodeData): Promise<QRScanResult> {
    return {
      success: true,
      type: 'support',
      data: qrData.data,
      action: {
        type: 'redirect',
        handler: 'support',
        params: {
          ticketId: qrData.data.ticketId
        }
      },
      redirectUrl: `/support/ticket/${qrData.data.ticketId}`
    };
  }

  private async processDiscountQR(qrData: QRCodeData): Promise<QRScanResult> {
    return {
      success: true,
      type: 'discount',
      data: qrData.data,
      action: {
        type: 'process',
        handler: 'discount',
        params: {
          code: qrData.data.code,
          discount: qrData.data.discount
        }
      },
      message: `Discount code applied: ${qrData.data.discount}% off!`
    };
  }

  private async processReturnQR(qrData: QRCodeData): Promise<QRScanResult> {
    return {
      success: true,
      type: 'return',
      data: qrData.data,
      action: {
        type: 'redirect',
        handler: 'return',
        params: {
          orderId: qrData.data.orderId,
          itemId: qrData.data.itemId
        }
      },
      redirectUrl: `/returns/process/${qrData.data.returnId}`
    };
  }

  // NFC Integration
  async processNFCTag(tagData: NFCTagData): Promise<QRScanResult> {
    // Validate NFC tag
    if (tagData.validUntil && new Date() > tagData.validUntil) {
      return {
        success: false,
        type: 'nfc-tag',
        data: null,
        message: 'NFC tag has expired'
      };
    }

    // Process based on tag type
    switch (tagData.tagType) {
      case 'product':
        return {
          success: true,
          type: 'nfc-tag',
          data: tagData,
          redirectUrl: `/product/${tagData.linkedEntity}`
        };
      
      case 'vendor':
        return {
          success: true,
          type: 'nfc-tag',
          data: tagData,
          redirectUrl: `/store/${tagData.linkedEntity}`
        };
      
      case 'access':
        return {
          success: true,
          type: 'nfc-tag',
          data: tagData,
          action: {
            type: 'authenticate',
            handler: 'access',
            params: {
              permissions: tagData.permissions
            }
          }
        };
      
      default:
        return {
          success: true,
          type: 'nfc-tag',
          data: tagData
        };
    }
  }

  // Utility Methods
  private generateId(type: QRCodeType): string {
    return `qr_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateShortCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // QR Code Management
  getQRCode(id: string): QRCodeData | undefined {
    return this.qrCodes.get(id);
  }

  getQRCodeByShortCode(shortCode: string): QRCodeData | undefined {
    const id = this.shortCodeMap.get(shortCode);
    return id ? this.qrCodes.get(id) : undefined;
  }

  deactivateQRCode(id: string): boolean {
    const qr = this.qrCodes.get(id);
    if (qr) {
      qr.isActive = false;
      return true;
    }
    return false;
  }

  // Bulk QR Generation
  async generateBulkQRCodes(
    type: QRCodeType,
    dataArray: any[],
    options?: any
  ): Promise<QRCodeData[]> {
    const qrCodes: QRCodeData[] = [];
    
    for (const data of dataArray) {
      const qr = await this.generateQRCode(type, data, options);
      qrCodes.push(qr);
    }
    
    return qrCodes;
  }

  // Analytics
  getQRCodeAnalytics(id: string): any {
    const qr = this.qrCodes.get(id);
    if (!qr) return null;

    return {
      id: qr.id,
      type: qr.type,
      created: qr.createdAt,
      expires: qr.expiresAt,
      usageCount: qr.usageCount,
      maxUsage: qr.maxUsage,
      isActive: qr.isActive,
      remainingUses: qr.maxUsage ? qr.maxUsage - qr.usageCount : 'unlimited'
    };
  }

  // Template Management
  getTemplate(templateId: string): QRTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): QRTemplate[] {
    return Array.from(this.templates.values());
  }

  createTemplate(template: QRTemplate): void {
    this.templates.set(template.id, template);
  }
}

// Singleton instance
export const qrService = new QRService();