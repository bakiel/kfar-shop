import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterVisionService } from '@/lib/services/openrouter-vision-service';
import { VOPComplianceService } from '@/lib/services/vop-compliance-service';

// Market price data for common categories (in ILS)
const MARKET_PRICES = {
  'spreads': { min: 18, max: 45, avg: 28 },
  'beverages': { min: 8, max: 25, avg: 15 },
  'snacks': { min: 10, max: 35, avg: 22 },
  'prepared-foods': { min: 25, max: 65, avg: 42 },
  'condiments': { min: 12, max: 38, avg: 24 },
  'grains': { min: 15, max: 40, avg: 26 },
  'proteins': { min: 30, max: 80, avg: 55 },
  'desserts': { min: 20, max: 50, avg: 35 },
  'default': { min: 15, max: 50, avg: 30 }
};

export async function POST(request: NextRequest) {
  try {
    const { image, currentData } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }
    
    console.log('🤖 Analyzing product image with Vision AI...');
    
    // Convert base64 to blob URL for analysis
    const base64Data = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    
    // Analyze image with OpenRouter Vision AI
    const analysis = await OpenRouterVisionService.analyzeProductImage(base64Data);
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: 500 }
      );
    }
    
    // Enhance with comprehensive VOP compliance check
    const vopCompliance = VOPComplianceService.checkCompliance({
      name: analysis.productName,
      description: analysis.description,
      ingredients: analysis.ingredients || [],
      certifications: analysis.certifications || [],
      tags: analysis.tags || [],
      category: analysis.category,
      allergens: analysis.allergens || []
    });
    
    // Generate pricing suggestions
    const pricingSuggestion = generatePricingSuggestion(analysis.category);
    
    // Create Hebrew translation prompt
    const hebrewTranslation = {
      nameHe: `${analysis.productName} (Hebrew translation needed)`,
      descriptionHe: `${analysis.description} (Hebrew translation needed)`
    };
    
    // Combine all enhancements
    const enhancedProduct = {
      // AI-generated content
      name: analysis.productName,
      category: analysis.category,
      description: analysis.description,
      features: analysis.features,
      tags: analysis.tags,
      allergens: analysis.allergens,
      certifications: analysis.certifications,
      
      // VOP Compliance
      vopCompliance: {
        isCompliant: vopCompliance.isCompliant,
        confidence: vopCompliance.confidence,
        score: vopCompliance.score,
        issues: vopCompliance.issues,
        warnings: vopCompliance.warnings,
        suggestions: vopCompliance.suggestions,
        certifications: vopCompliance.certifications,
        healthScore: vopCompliance.healthScore,
        badge: VOPComplianceService.getComplianceBadge(vopCompliance)
      },
      
      // Pricing
      pricing: {
        suggested: pricingSuggestion.suggested,
        range: pricingSuggestion.range,
        marketAverage: pricingSuggestion.marketAverage,
        explanation: pricingSuggestion.explanation
      },
      
      // Hebrew translations (placeholder for now)
      translations: hebrewTranslation,
      
      // AI confidence
      aiConfidence: analysis.confidence,
      
      // Preserve any existing data
      ...currentData
    };
    
    console.log('✅ Product analysis complete:', {
      name: enhancedProduct.name,
      category: enhancedProduct.category,
      vopCompliant: enhancedProduct.vopCompliance.isCompliant,
      confidence: enhancedProduct.aiConfidence
    });
    
    return NextResponse.json({
      success: true,
      product: enhancedProduct,
      message: 'Product analyzed successfully'
    });
    
  } catch (error) {
    console.error('Product analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze product' },
      { status: 500 }
    );
  }
}


// Helper function to generate pricing suggestions
function generatePricingSuggestion(category: string) {
  const categoryKey = category.toLowerCase().replace(/[^a-z]/g, '-');
  const priceData = MARKET_PRICES[categoryKey as keyof typeof MARKET_PRICES] || MARKET_PRICES.default;
  
  // Suggest a price slightly below average for competitive advantage
  const suggested = Math.round(priceData.avg * 0.95);
  
  return {
    suggested,
    range: {
      min: priceData.min,
      max: priceData.max
    },
    marketAverage: priceData.avg,
    explanation: `Based on market analysis for ${category}, we suggest ₪${suggested} to stay competitive while maintaining fair pricing for the VOP community.`
  };
}