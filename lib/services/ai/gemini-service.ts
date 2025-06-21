/**
 * Google Gemini AI Service Integration
 * Provides vision capabilities, visual search, and multimodal AI features
 */

import { AIResponse, VisionAnalysis, ProductRecognition } from './types';

let GoogleGenerativeAI: any;
try {
  const genAIModule = require('@google/generative-ai');
  GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;
} catch (error) {
  console.warn('Google Generative AI not available, using mock service');
}

export class GeminiService {
  private genAI: any;
  private visionModel: any;
  private textModel: any;
  private mockMode: boolean = false;

  constructor(apiKey: string) {
    if (GoogleGenerativeAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    } else {
      this.mockMode = true;
      console.warn('Running Gemini service in mock mode');
    }
  }

  /**
   * Analyze product images for automatic categorization and description
   */
  async analyzeProductImage(imageData: string | Buffer): Promise<VisionAnalysis> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          productType: 'vegan-product',
          category: 'food',
          features: ['organic', 'fresh', 'locally-sourced'],
          quality: { score: 8, notes: 'High quality product' },
          suggestedName: 'Premium Vegan Product',
          description: 'High-quality vegan product from KFAR marketplace',
          detectedText: [],
          culturalContext: 'Suitable for Israeli vegan community',
          confidence: 0.8
        };
      }

      const prompt = `Analyze this product image and provide:
      1. Product type and category
      2. Key visual features
      3. Estimated freshness/quality (if applicable)
      4. Suggested product name
      5. Marketing description
      6. Detected text/labels
      7. Cultural significance in Israeli/Middle Eastern context
      
      Return as structured JSON.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const analysis = this.parseJSONResponse(text);

      return {
        success: true,
        productType: analysis.productType || 'unknown',
        category: analysis.category || 'other',
        features: analysis.features || [],
        quality: analysis.quality || { score: 0, notes: '' },
        suggestedName: analysis.suggestedName || '',
        description: analysis.description || '',
        detectedText: analysis.detectedText || [],
        culturalContext: analysis.culturalContext || '',
        confidence: analysis.confidence || 0.8
      };
    } catch (error) {
      console.error('Gemini vision analysis error:', error);
      return {
        success: false,
        productType: 'unknown',
        category: 'other',
        features: [],
        quality: { score: 0, notes: 'Analysis failed' },
        suggestedName: '',
        description: '',
        detectedText: [],
        culturalContext: '',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Visual product search - find similar products by image
   */
  async findSimilarProducts(imageData: string | Buffer, products: any[]): Promise<ProductRecognition> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          matches: products.slice(0, 3).map((p, i) => ({
            productId: p.id,
            similarity: 0.9 - (i * 0.1),
            matchType: 'similar' as const,
            confidence: 0.8
          })),
          searchType: 'visual',
          confidence: 0.8
        };
      }

      const prompt = `Compare this image to a product catalog and find the most similar items.
      Consider: visual similarity, product type, color, shape, and presentation style.
      Return the top 5 matches with similarity scores.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      // Include product catalog summary in the prompt
      const catalogSummary = products.slice(0, 20).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description.substring(0, 100)
      }));

      const fullPrompt = `${prompt}\n\nProduct Catalog Sample:\n${JSON.stringify(catalogSummary, null, 2)}`;

      const result = await this.visionModel.generateContent([fullPrompt, imagePart]);
      const response = await result.response;
      const matches = this.parseJSONResponse(response.text());

      return {
        success: true,
        matches: matches.matches || [],
        searchType: 'visual',
        confidence: matches.confidence || 0.7
      };
    } catch (error) {
      console.error('Gemini visual search error:', error);
      return {
        success: false,
        matches: [],
        searchType: 'visual',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * QR code and barcode reading from images
   */
  async readCodes(imageData: string | Buffer): Promise<AIResponse> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          data: {
            qrCodes: [],
            barcodes: [],
            textLabels: ['KFAR Product'],
            extractedData: {}
          }
        };
      }

      const prompt = `Identify and read any QR codes, barcodes, or text labels in this image.
      Extract all readable information and structure it for database storage.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const codes = this.parseJSONResponse(response.text());

      return {
        success: true,
        data: {
          qrCodes: codes.qrCodes || [],
          barcodes: codes.barcodes || [],
          textLabels: codes.textLabels || [],
          extractedData: codes.extractedData || {}
        }
      };
    } catch (error) {
      console.error('Gemini code reading error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate product images descriptions for accessibility
   */
  async generateAltText(imageData: string | Buffer): Promise<string> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return 'High-quality vegan product from KFAR marketplace';
      }

      const prompt = `Generate concise, descriptive alt text for this product image.
      Make it accessible and informative for screen readers.
      Include key product details and visual characteristics.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini alt text generation error:', error);
      return 'Product image';
    }
  }

  /**
   * Verify product quality through visual inspection
   */
  async assessProductQuality(imageData: string | Buffer, productType: string): Promise<AIResponse> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          data: {
            qualityScore: 8,
            freshness: 'fresh',
            defects: [],
            packaging: 'excellent',
            recommendations: ['Product meets high quality standards']
          }
        };
      }

      const prompt = `Assess the quality of this ${productType} product:
      1. Freshness indicators
      2. Visual defects or concerns
      3. Packaging condition
      4. Overall quality score (1-10)
      5. Recommendations for vendor
      
      Be specific about any quality issues observed.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const assessment = this.parseJSONResponse(response.text());

      return {
        success: true,
        data: {
          qualityScore: assessment.qualityScore || 0,
          freshness: assessment.freshness || 'unknown',
          defects: assessment.defects || [],
          packaging: assessment.packaging || 'not assessed',
          recommendations: assessment.recommendations || []
        }
      };
    } catch (error) {
      console.error('Gemini quality assessment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Multi-image analysis for product galleries
   */
  async analyzeProductGallery(images: Array<string | Buffer>): Promise<AIResponse> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          data: {
            presentationQuality: 'excellent',
            missingShots: [],
            consistency: 'high',
            improvements: ['All images are well-composed'],
            primaryImageIndex: 0
          }
        };
      }

      const prompt = `Analyze this product gallery and provide:
      1. Overall product presentation quality
      2. Missing angles or shots
      3. Consistency of styling
      4. Improvement suggestions
      5. Best image for primary display`;

      const imageParts = images.map(imageData => ({
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      }));

      const result = await this.visionModel.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const analysis = this.parseJSONResponse(response.text());

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      console.error('Gemini gallery analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Smart recipe generation from ingredients image
   */
  async generateRecipeFromImage(imageData: string | Buffer): Promise<AIResponse> {
    try {
      // Mock mode implementation
      if (this.mockMode) {
        return {
          success: true,
          data: {
            ingredients: ['tahini', 'chickpeas', 'lemon', 'garlic'],
            recipes: [
              {
                name: 'Classic Hummus',
                instructions: 'Blend all ingredients until smooth',
                prepTime: '15 minutes'
              }
            ],
            missingIngredients: ['olive oil']
          }
        };
      }

      const prompt = `Analyze these ingredients and suggest vegan recipes:
      1. Identify all visible ingredients
      2. Suggest 3 possible recipes
      3. Provide brief cooking instructions
      4. Estimate preparation time
      5. Note any missing key ingredients
      
      Focus on Israeli/Middle Eastern cuisine when possible.`;

      const imagePart = {
        inlineData: {
          data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const recipes = this.parseJSONResponse(response.text());

      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      console.error('Gemini recipe generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse JSON response from Gemini, handling potential formatting issues
   */
  private parseJSONResponse(text: string): any {
    try {
      // Remove markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      // Try to parse the JSON
      return JSON.parse(jsonText);
    } catch (error) {
      // If JSON parsing fails, try to extract key-value pairs
      console.warn('Failed to parse JSON response, attempting fallback parsing');
      
      const result: any = {};
      const lines = text.split('\n');
      
      for (const line of lines) {
        const keyValue = line.match(/(\w+):\s*(.+)/);
        if (keyValue) {
          const [, key, value] = keyValue;
          result[key] = value.trim();
        }
      }
      
      return result;
    }
  }
}