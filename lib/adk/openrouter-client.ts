/**
 * OpenRouter Client for KFAR Marketplace
 * Integrates with existing data system
 */

import { vendorStores, getAllProducts, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';
import { marketplaceDB } from './marketplace-database';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export class OpenRouterClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string = OPENROUTER_API_KEY) {
    this.apiKey = apiKey;
    this.model = 'google/gemini-2.5-flash-preview-04-17';
  }

  /**
   * Get real-time data from the existing system
   */
  async getMarketplaceContext() {
    try {
      // Try database first
      const [vendors, stats] = await Promise.all([
        marketplaceDB.getVendors(),
        marketplaceDB.getMarketplaceStats()
      ]);

      return {
        vendors,
        stats,
        totalProducts: stats.product_count,
        source: 'database'
      };
    } catch (error) {
      // Fallback to static data
      console.log('Using static data fallback');
      const products = getAllProducts();
      
      return {
        vendors: Object.values(vendorStores),
        stats: {
          vendor_count: Object.keys(vendorStores).length,
          product_count: products.length,
          category_count: new Set(products.map(p => p.category)).size
        },
        totalProducts: products.length,
        source: 'static'
      };
    }
  }

  /**
   * Search products using existing data layer
   */
  async searchProducts(query: string) {
    try {
      // Try database search first
      const dbProducts = await marketplaceDB.searchProducts(query);
      if (dbProducts.length > 0) {
        return dbProducts;
      }
    } catch (error) {
      console.log('Database search failed, using static search');
    }

    // Fallback to static data search
    const allProducts = getAllProducts();
    const queryLower = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(queryLower) ||
      product.description.toLowerCase().includes(queryLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Generate AI response with real marketplace data
   */
  async generateResponse(messages: OpenRouterMessage[], config?: OpenRouterConfig) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kfar-marketplace.com',
        'X-Title': 'KFAR Marketplace Assistant'
      },
      body: JSON.stringify({
        model: config?.model || this.model,
        messages,
        temperature: config?.temperature || 0.7,
        max_tokens: config?.max_tokens || 2048,
        stream: config?.stream || false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate response with marketplace context
   */
  async chat(userQuery: string, context?: any) {
    // Get real marketplace data
    const marketplaceData = await this.getMarketplaceContext();
    
    // Search for relevant products
    const relevantProducts = await this.searchProducts(userQuery);

    // Build system prompt with real data
    const systemPrompt = `You are an AI assistant for KFAR Marketplace in Dimona, Israel.

CURRENT MARKETPLACE DATA:
- Total Vendors: ${marketplaceData.stats.vendor_count}
- Total Products: ${marketplaceData.stats.product_count}
- Categories: ${marketplaceData.stats.category_count}

VENDORS:
${marketplaceData.vendors.map(v => `- ${v.name}: ${v.description}`).join('\n')}

${relevantProducts.length > 0 ? `
RELEVANT PRODUCTS:
${relevantProducts.slice(0, 5).map(p => 
  `- ${p.name} (₪${p.price}) - ${p.description}`
).join('\n')}
` : ''}

Provide helpful, accurate responses using this real marketplace data.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ];

    return this.generateResponse(messages);
  }
}

// Export singleton instance
export const openRouterClient = new OpenRouterClient();
