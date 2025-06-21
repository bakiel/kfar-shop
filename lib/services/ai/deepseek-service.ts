/**
 * DeepSeek AI Service Integration
 * Provides natural language processing, code generation, and intelligent search
 */

import { AIResponse, AISearchQuery, AITranslation } from './types';

export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Natural language search for products
   */
  async searchProducts(query: AISearchQuery): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a helpful assistant for Kfar Marketplace, a vegan community marketplace in Israel. 
      Help users find products based on their natural language queries. 
      Consider dietary preferences, cultural context, and local availability.
      Respond with structured data that can be used to filter products.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query.text }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        success: true,
        data: {
          searchFilters: result.filters || {},
          suggestions: result.suggestions || [],
          intent: result.intent || 'general_search',
          confidence: result.confidence || 0.8
        }
      };
    } catch (error) {
      console.error('DeepSeek search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate smart QR code content with AI
   */
  async generateQRContent(type: string, data: any): Promise<AIResponse> {
    try {
      const systemPrompt = `Generate optimized QR code content for ${type}. 
      Include relevant metadata, ensure data efficiency, and add security considerations.
      Return a JSON structure optimized for QR encoding.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-coder-v2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify({ type, data }) }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        })
      });

      // Check if the request was successful
      if (!response.ok) {
        console.warn('API request failed with status:', response.status);
        return this.generateFallbackQRContent(type, data);
      }

      const result = await response.json();
      
      // Check if the response has the expected format
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.warn('Unexpected API response format, using fallback');
        return this.generateFallbackQRContent(type, data);
      }
      
      try {
        const qrContent = JSON.parse(result.choices[0].message.content);
        return {
          success: true,
          data: {
            qrPayload: qrContent.payload,
            metadata: qrContent.metadata,
            securityHash: qrContent.security?.hash
          }
        };
      } catch (parseError) {
        console.warn('Failed to parse API response, using fallback');
        return this.generateFallbackQRContent(type, data);
      }
    } catch (error) {
      console.error('DeepSeek QR generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Multilingual translation service
   */
  async translate(text: string, targetLanguage: string): Promise<AITranslation> {
    try {
      const languages = {
        he: 'Hebrew',
        ar: 'Arabic',
        en: 'English'
      };

      const systemPrompt = `Translate the following text to ${languages[targetLanguage] || targetLanguage}. 
      Maintain the original meaning and cultural context. 
      For product names and descriptions, ensure the translation is appetizing and culturally appropriate.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      const data = await response.json();
      const translatedText = data.choices[0].message.content;

      return {
        success: true,
        originalText: text,
        translatedText,
        targetLanguage,
        confidence: 0.95
      };
    } catch (error) {
      console.error('DeepSeek translation error:', error);
      return {
        success: false,
        originalText: text,
        translatedText: text,
        targetLanguage,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate product descriptions with AI
   */
  async generateProductDescription(productData: any): Promise<AIResponse> {
    try {
      const systemPrompt = `Create compelling product descriptions for a vegan marketplace.
      Include: brief description, long description, key features, cultural significance, and SEO keywords.
      Make it appetizing and culturally sensitive for Israeli/Middle Eastern audience.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(productData) }
          ],
          temperature: 0.8,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const description = JSON.parse(data.choices[0].message.content);

      return {
        success: true,
        data: description
      };
    } catch (error) {
      console.error('DeepSeek description generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Intelligent customer support
   */
  async handleCustomerQuery(query: string, context?: any): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a helpful customer support assistant for Kfar Marketplace.
      You help with: product information, order tracking, vendor details, community events, and general inquiries.
      Be friendly, culturally aware, and helpful. The community values plant-based lifestyle and sustainability.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
            ...(context ? [{ role: 'assistant', content: `Context: ${JSON.stringify(context)}` }] : [])
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;

      return {
        success: true,
        data: {
          response: reply,
          suggestedActions: this.extractActions(reply),
          sentiment: this.analyzeSentiment(query)
        }
      };
    } catch (error) {
      console.error('DeepSeek support error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract actionable items from AI response
   */
  private extractActions(text: string): string[] {
    // Simple action extraction - can be enhanced with more sophisticated parsing
    const actions = [];
    if (text.includes('order')) actions.push('view_orders');
    if (text.includes('product')) actions.push('browse_products');
    if (text.includes('contact') || text.includes('vendor')) actions.push('contact_vendor');
    if (text.includes('event')) actions.push('view_events');
    return actions;
  }

  /**
   * Basic sentiment analysis
   */
  private analyzeSentiment(text: string): string {
    const positiveWords = ['love', 'great', 'excellent', 'amazing', 'thank'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'problem'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Fallback QR content generation without external API
   */
  private generateFallbackQRContent(type: string, data: any): AIResponse {
    try {
      const timestamp = Date.now();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
      
      let qrPayload: any = {
        version: 1,
        type,
        timestamp,
        data: {}
      };

      // Generate content based on type
      switch (type) {
        case 'payment':
          qrPayload.data = {
            amount: data.amount || 0,
            currency: data.currency || 'ILS',
            orderId: data.orderId || `ORDER-${timestamp}`,
            vendorId: data.vendorId || 'kfar',
            expiresAt: timestamp + (5 * 60 * 1000) // 5 minutes
          };
          qrPayload.url = `${baseUrl}/pay/${qrPayload.data.orderId}`;
          break;

        case 'product':
          qrPayload.data = {
            productId: data.id || data.productId,
            name: data.name || 'Product',
            price: data.price || 0,
            vendorId: data.vendorId
          };
          qrPayload.url = `${baseUrl}/product/${qrPayload.data.productId}`;
          break;

        case 'vendor':
          qrPayload.data = {
            vendorId: data.id || data.vendorId,
            name: data.name || 'Vendor',
            category: data.category
          };
          qrPayload.url = `${baseUrl}/vendor/${qrPayload.data.vendorId}`;
          break;

        case 'order':
          qrPayload.data = {
            orderId: data.id || data.orderId,
            status: data.status || 'pending',
            customerId: data.customerId
          };
          qrPayload.url = `${baseUrl}/order/${qrPayload.data.orderId}`;
          break;

        default:
          qrPayload.data = data;
          qrPayload.url = `${baseUrl}/${type}/${data.id || timestamp}`;
      }

      // Generate simple hash for security
      const dataString = JSON.stringify(qrPayload);
      const simpleHash = this.generateSimpleHash(dataString);

      return {
        success: true,
        data: {
          qrPayload,
          metadata: {
            generatedAt: new Date().toISOString(),
            expiresAt: new Date(timestamp + (30 * 60 * 1000)).toISOString(), // 30 minutes
            type
          },
          securityHash: simpleHash
        }
      };
    } catch (error) {
      console.error('Fallback QR generation error:', error);
      return {
        success: false,
        error: 'Failed to generate QR content'
      };
    }
  }

  /**
   * Generate a simple hash for security (not cryptographically secure, but good enough for demo)
   */
  private generateSimpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}