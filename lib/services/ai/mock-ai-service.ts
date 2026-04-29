// Mock AI Service for QR Generation
// This replaces the complex AI service to avoid hydration issues

import type { SmartQRContent } from './types';

export class MockAIService {
  static async generateQR(type: SmartQRContent['type'], data: any): Promise<SmartQRContent> {
    // Generate a simple signature without crypto dependencies
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const signature = `${timestamp}-${random}`.padEnd(64, '0');

    return {
      version: 1,
      type,
      payload: data,
      metadata: {
        created: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        aiGenerated: false,
        security: {
          signature,
          algorithm: 'mock'
        }
      }
    };
  }
}

// Export singleton instance
export const mockAI = new MockAIService();
