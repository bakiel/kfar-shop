/**
 * OpenRouter Client for KFAR Marketplace
 * Integrates with existing data system
 */

import { vendorStores, getAllProducts, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';
import { marketplaceDB } from './marketplace-database';
import { AI_PROVIDERS } from '@/lib/config/ai-providers';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
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
  useCase?: 'general' | 'reasoning' | 'long-context';
}

export class OpenRouterClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string = OPENROUTER_API_KEY) {
    this.apiKey = apiKey;
    this.model = 'google/gemini-2.5-flash-preview-04-17';
  }

  /**
   * Select the best model based on use case
   */
  private selectModel(useCase: OpenRouterConfig['useCase'] = 'general'): string {
    switch (useCase) {
      case 'reasoning':
        const reasoningModels = AI_PROVIDERS.openRouter.models.reasoning;
        return typeof reasoningModels === 'object' ? reasoningModels.primary : this.model;
      case 'long-context':
        const contextModels = AI_PROVIDERS.openRouter.models.longContext;
        return typeof contextModels === 'object' ? contextModels.primary : this.model;
      default:
        return this.model; // Default Gemini model
    }
  }

  /**
   * Get fallback models for a use case
   */
  private getFallbackModels(useCase: OpenRouterConfig['useCase'] = 'general'): string[] {
    switch (useCase) {
      case 'reasoning':
        const reasoningModels = AI_PROVIDERS.openRouter.models.reasoning;
        if (typeof reasoningModels === 'object') {
          return [
            reasoningModels.primary,
            reasoningModels.fallback1,
            reasoningModels.fallback2,
            reasoningModels.fallback3
          ].filter(Boolean);
        }
        break;
      case 'long-context':
        const contextModels = AI_PROVIDERS.openRouter.models.longContext;
        if (typeof contextModels === 'object') {
          return [
            contextModels.primary,
            contextModels.fallback1,
            contextModels.fallback2,
            contextModels.fallback3
          ].filter(Boolean);
        }
        break;
    }
    return [this.model]; // Default to standard model
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
  async generateResponse(messages: OpenRouterMessage[], config?: OpenRouterConfig): Promise<any> {
    // Get models to try based on use case
    const modelsToTry = config?.model 
      ? [config.model] 
      : this.getFallbackModels(config?.useCase);
    
    let lastError: Error | null = null;
    
    // Try each model in order
    for (const model of modelsToTry) {
      try {
        return await this.makeRequest(messages, { ...config, model });
      } catch (error) {
        console.log(`Model ${model} failed, trying next fallback...`);
        lastError = error as Error;
        continue;
      }
    }
    
    // All models failed
    throw lastError || new Error('All models failed');
  }

  /**
   * Make the actual API request
   */
  private async makeRequest(messages: OpenRouterMessage[], config?: OpenRouterConfig) {
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
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      console.error('OpenRouter response error:', data.error);
      throw new Error(data.error.message || 'Unknown OpenRouter error');
    }

    return data;
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
