import { VisionAnalysis } from './vision-ai-service';

// OpenRouter API configuration
// Updated to use the latest API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 
  '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Alternative API keys for future use:
// OpenWriter: sk-0a29625742c94132a5df711c5ac65f15
// DeepSeek: Available in deepseek-service.ts

export class OpenRouterVisionService {
  private static headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://kfar-marketplace.com',
    'X-Title': 'KFAR Marketplace Vision AI'
  };

  static async analyzeProductImage(imageDataUrl: string): Promise<VisionAnalysis | null> {
    try {
      console.log('🤖 Analyzing product with OpenRouter Gemini Flash...');
      
      // Ensure we have proper base64 format
      let base64Data = imageDataUrl;
      if (!imageDataUrl.startsWith('data:')) {
        base64Data = `data:image/jpeg;base64,${imageDataUrl}`;
      }
      
      const prompt = `Analyze this food product image and provide detailed information for a vegan marketplace:

1. Product name (be specific and accurate based on what you see)
2. Product category (main dishes, desserts, beverages, snacks, etc.)
3. Detailed description (2-3 sentences focusing on visible ingredients and features)
4. Key features or benefits (as array)
5. Relevant search tags (as array)
6. Any visible allergen information
7. Visible certifications (Kosher, Vegan, Organic, etc.)

IMPORTANT: This is for a vegan marketplace, so identify any non-vegan ingredients.

Format your response as JSON:
{
  "productName": "...",
  "category": "...",
  "description": "...",
  "features": ["..."],
  "tags": ["..."],
  "confidence": 0-100,
  "allergens": ["..."],
  "certifications": ["..."]
}`;

      const payload = {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Data
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      };

      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API error:', error);
        return null;
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('No content in OpenRouter response');
        return null;
      }

      // Parse JSON from response
      try {
        let jsonContent = content;
        
        // Extract JSON if wrapped in markdown code blocks
        if (content.includes('```json')) {
          const jsonStart = content.indexOf('```json') + 7;
          const jsonEnd = content.indexOf('```', jsonStart);
          jsonContent = content.substring(jsonStart, jsonEnd).trim();
        } else if (content.includes('```')) {
          const jsonStart = content.indexOf('```') + 3;
          const jsonEnd = content.indexOf('```', jsonStart);
          jsonContent = content.substring(jsonStart, jsonEnd).trim();
        }
        
        const parsed = JSON.parse(jsonContent);
        
        // Ensure confidence is between 0-100
        if (parsed.confidence > 1 && parsed.confidence <= 100) {
          // Already in 0-100 range
        } else if (parsed.confidence >= 0 && parsed.confidence <= 1) {
          // Convert from 0-1 to 0-100
          parsed.confidence = parsed.confidence * 100;
        } else {
          // Default confidence
          parsed.confidence = 85;
        }
        
        console.log('✅ Vision analysis complete:', {
          productName: parsed.productName,
          category: parsed.category,
          confidence: parsed.confidence
        });
        
        return parsed as VisionAnalysis;
      } catch (parseError) {
        console.error('Failed to parse vision response:', parseError);
        console.log('Raw response:', content);
        return null;
      }
    } catch (error) {
      console.error('Vision analysis error:', error);
      return null;
    }
  }
}