import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '@/lib/types/product';

// Initialize Gemini - Use NEXT_PUBLIC for client-side access
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface VisionAnalysis {
  productName: string;
  category: string;
  description: string;
  features: string[];
  tags: string[];
  confidence: number;
  allergens?: string[];
  certifications?: string[];
}

export class VisionAIService {
  private static model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  static async analyzeProductImage(imagePathOrBase64: string): Promise<VisionAnalysis | null> {
    try {
      let base64: string;
      
      // Check if it's already base64
      if (imagePathOrBase64.startsWith('data:')) {
        base64 = imagePathOrBase64;
      } else {
        // It's a URL, fetch and convert
        const imageData = await fetch(imagePathOrBase64).then(res => res.blob());
        base64 = await this.blobToBase64(imageData);
      }
      
      const prompt = `Analyze this product image and provide:
1. Product name (be specific and accurate)
2. Product category
3. Detailed description (2-3 sentences, focus on ingredients and features visible)
4. Key features or benefits (as array)
5. Relevant tags for search (as array)
6. Any visible allergen information
7. Visible certifications (Kosher, Vegan, Organic, etc.)

Format as JSON:
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

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64.split(',')[1]
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/{[sS]*}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse vision response:', e);
      }
      
      return null;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      return null;
    }
  }
  
  static async enhanceProductDescription(product: Product): Promise<Product> {
    const analysis = await this.analyzeProductImage(product.image);
    
    if (analysis && analysis.confidence > 70) {
      return {
        ...product,
        description: analysis.description || product.description,
        tags: [...(product.tags || []), ...analysis.tags],
        features: analysis.features,
        allergens: analysis.allergens,
        certifications: analysis.certifications,
        visionEnhanced: true,
        visionConfidence: analysis.confidence
      };
    }
    
    return product;
  }
  
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export async function enhanceAllProducts(products: Product[]): Promise<Product[]> {
  console.log(`Enhancing ${products.length} products with Vision AI...`);
  
  const enhanced = [];
  for (const product of products) {
    console.log(`Analyzing ${product.id}: ${product.name}`);
    const enhancedProduct = await VisionAIService.enhanceProductDescription(product);
    enhanced.push(enhancedProduct);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return enhanced;
}
