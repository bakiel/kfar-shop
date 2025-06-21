/**
 * AI Services Export
 */

export * from './types';
export { DeepSeekService } from './deepseek-service';
export { GeminiService } from './gemini-service';

// Import UnifiedAIService to use it
import { UnifiedAIService } from './unified-ai-service';

// Export it after importing
export { UnifiedAIService };

// Create singleton instance
let aiServiceInstance: UnifiedAIService | null = null;

export function getAIService(): UnifiedAIService {
  if (!aiServiceInstance) {
    const deepseekKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || 'sk-c1c819391f674040967955a41b469f89';
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyA7dxzalb_kWQFludH0XMIAA9U1H_OROGs';
    
    aiServiceInstance = new UnifiedAIService(deepseekKey, geminiKey);
  }
  
  return aiServiceInstance;
}

// Export convenience methods
export const AI = {
  search: (query: any, image?: any) => getAIService().smartSearch(query, image),
  generateQR: (type: string, data: any) => getAIService().generateSmartQR(type, data),
  analyzeProduct: (image: any, context?: any) => getAIService().analyzeProductForListing(image, context),
  translate: (content: any, language: string) => getAIService().translateContent(content, language),
  recommend: (userId: string, context?: any) => getAIService().getRecommendations(userId, context),
  verifyQuality: (image: any, type: string) => getAIService().verifyProductQuality(image, type),
  generateNFC: (type: string, data: any) => getAIService().generateNFCPayload(type, data),
  trackP2P: (orderData: any) => getAIService().createP2PTracking(orderData),
  vendorInsights: (vendorId: string, data: any) => getAIService().generateVendorInsights(vendorId, data)
};