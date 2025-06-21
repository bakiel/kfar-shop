// Mock AI Service for QR Generation
// This replaces the complex AI service to avoid hydration issues

export interface MockQRContent {
  version: string;
  type: string;
  data: any;
  metadata: {
    created: Date;
    expires?: Date;
    security: {
      signature: string;
    };
  };
}

export class MockAIService {
  async generateQR(type: string, data: any): Promise<MockQRContent> {
    // Generate a simple signature without crypto dependencies
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const signature = `${timestamp}-${random}`.padEnd(64, '0');

    return {
      version: '1.0',
      type,
      data,
      metadata: {
        created: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        security: {
          signature
        }
      }
    };
  }
}

// Export singleton instance
export const mockAI = new MockAIService();