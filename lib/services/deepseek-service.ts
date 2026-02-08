/**
 * DeepSeek AI Service
 * Alternative AI provider for text generation and analysis
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-0a29625742c94132a5df711c5ac65f15';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekService {
  /**
   * Generate text using DeepSeek AI
   */
  static async generateText(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string | null> {
    const {
      model = 'deepseek-chat',
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = 'You are a helpful AI assistant for the KFAR Marketplace.'
    } = options;

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        console.error('DeepSeek API error:', response.status, response.statusText);
        return null;
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('DeepSeek service error:', error);
      return null;
    }
  }

  /**
   * Translate text between languages
   */
  static async translate(
    text: string,
    targetLang: 'he' | 'en',
    context?: string
  ): Promise<string | null> {
    const langName = targetLang === 'he' ? 'Hebrew' : 'English';
    const contextInfo = context ? `Context: ${context}. ` : '';
    
    const prompt = `${contextInfo}Translate the following text to ${langName}. Provide only the translation without any explanation:\n\n${text}`;
    
    return this.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more consistent translations
      systemPrompt: 'You are a professional translator specializing in English-Hebrew translations for an Israeli marketplace.'
    });
  }

  /**
   * Generate product descriptions
   */
  static async generateProductDescription(
    productName: string,
    category: string,
    features: string[]
  ): Promise<string | null> {
    const prompt = `Create a compelling product description for:
Product: ${productName}
Category: ${category}
Features: ${features.join(', ')}

Requirements:
- 2-3 sentences
- Highlight key benefits
- Use engaging, customer-focused language
- Suitable for a vegan marketplace`;

    return this.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 200,
      systemPrompt: 'You are a creative copywriter for KFAR Marketplace, specializing in vegan and sustainable products.'
    });
  }

  /**
   * Generate SEO meta descriptions
   */
  static async generateMetaDescription(
    storeName: string,
    storeDescription: string,
    products: string[]
  ): Promise<string | null> {
    const prompt = `Create an SEO-optimized meta description for:
Store: ${storeName}
Description: ${storeDescription}
Products: ${products.slice(0, 5).join(', ')}

Requirements:
- 150-160 characters
- Include store name
- Mention key products/services
- Include "Village of Peace" or "Dimona"
- Compelling call-to-action`;

    return this.generateText(prompt, {
      temperature: 0.6,
      maxTokens: 100,
      systemPrompt: 'You are an SEO specialist creating meta descriptions for Israeli vegan businesses.'
    });
  }

  /**
   * Analyze text for VOP compliance
   */
  static async analyzeVOPCompliance(
    productText: string,
    productType: 'food' | 'clothing'
  ): Promise<{
    isCompliant: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  } | null> {
    const requirements = productType === 'food' 
      ? 'Must be 100% plant-based (vegan), no animal products except honey which is permitted'
      : 'Prefer natural fabrics, modest design, ethical production';

    const prompt = `Analyze this product for Village of Peace (VOP) compliance:
Product Type: ${productType}
Requirements: ${requirements}
Product Text: ${productText}

Provide analysis in JSON format:
{
  "isCompliant": boolean,
  "confidence": 0-100,
  "issues": ["list of compliance issues"],
  "suggestions": ["list of improvements"]
}`;

    const response = await this.generateText(prompt, {
      temperature: 0.2,
      systemPrompt: 'You are a compliance analyst for Village of Peace marketplace standards. Always respond with valid JSON.'
    });

    if (!response) return null;

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse VOP compliance response:', error);
      return null;
    }
  }

  /**
   * Generate vendor success story
   */
  static async generateSuccessStory(
    vendorName: string,
    specialty: string,
    monthsActive: number
  ): Promise<string | null> {
    const prompt = `Write a brief success testimonial for:
Vendor: ${vendorName}
Specialty: ${specialty}
Time on platform: ${monthsActive} months

Requirements:
- 2-3 sentences
- Mention specific benefits (AI tools, community support, growth)
- Authentic, conversational tone
- Include a metric if possible`;

    return this.generateText(prompt, {
      temperature: 0.9,
      maxTokens: 150,
      systemPrompt: 'You are writing authentic vendor testimonials for KFAR Marketplace.'
    });
  }
}