import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const productName = searchParams.get('productName');
    
    // Get database connection
    const db = await getDB();
    
    // Base query to get pricing data
    let query = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price,
        AVG(p.price) as avg_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price) as median_price,
        STDDEV(p.price) as price_stddev
      FROM products p
      WHERE p.is_active = true AND p.price > 0
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ` AND LOWER(p.category) = LOWER($1)`;
      params.push(category);
    }
    
    query += ` GROUP BY p.category`;
    
    // Get category-specific data
    const categoryData = await db.query(query, params);
    
    // Get similar products if productName is provided
    let similarProducts = [];
    if (productName) {
      const similarQuery = `
        SELECT 
          p.name,
          p.price,
          p.category,
          v.name as vendor_name,
          p.rating,
          p.review_count
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.is_active = true 
          AND p.price > 0
          ${category ? 'AND LOWER(p.category) = LOWER($1)' : ''}
          AND (
            LOWER(p.name) LIKE LOWER($${params.length + 1}) OR
            LOWER(p.tags) LIKE LOWER($${params.length + 1})
          )
        ORDER BY p.review_count DESC, p.rating DESC
        LIMIT 10
      `;
      
      const searchPattern = `%${productName}%`;
      const similarParams = category ? [category, searchPattern] : [searchPattern];
      
      const similarResult = await db.query(similarQuery, similarParams);
      similarProducts = similarResult.rows;
    }
    
    // Calculate VOP fair pricing (slightly below market average)
    const marketData = categoryData.rows[0] || {
      min_price: 15,
      max_price: 50,
      avg_price: 30,
      median_price: 28,
      product_count: 0
    };
    
    const vopFairPrice = Math.round(marketData.median_price * 0.9); // 10% below median
    
    // Seasonal factors (could be enhanced with real data)
    const currentMonth = new Date().getMonth();
    const seasonalFactors: Record<string, number> = {
      'beverages': currentMonth >= 5 && currentMonth <= 8 ? 0.15 : -0.05, // Summer boost
      'prepared-foods': currentMonth >= 11 || currentMonth <= 1 ? 0.10 : 0, // Winter boost
      'snacks': currentMonth >= 5 && currentMonth <= 8 ? 0.10 : 0, // Summer boost
    };
    
    const categoryKey = category?.toLowerCase().replace(/[^a-z]/g, '-') || '';
    const seasonalFactor = seasonalFactors[categoryKey] || 0;
    
    // Competition analysis
    const competitionLevel = marketData.product_count > 20 ? 'high' : 
                           marketData.product_count > 10 ? 'medium' : 'low';
    
    return NextResponse.json({
      success: true,
      data: {
        category: category || 'all',
        marketStats: {
          minPrice: Math.round(marketData.min_price),
          maxPrice: Math.round(marketData.max_price),
          avgPrice: Math.round(marketData.avg_price),
          medianPrice: Math.round(marketData.median_price),
          priceVariance: Math.round(marketData.price_stddev || 0),
          productCount: marketData.product_count
        },
        vopPricing: {
          fairPrice: vopFairPrice,
          explanation: 'VOP community fair pricing balances vendor sustainability with community accessibility'
        },
        insights: {
          competitionLevel,
          competitorCount: marketData.product_count,
          seasonalFactor,
          demandIndicator: competitionLevel === 'high' ? 'strong' : 'moderate',
          recommendations: [
            competitionLevel === 'high' 
              ? 'Consider differentiation through unique features or bundles'
              : 'Opportunity to establish market presence with competitive pricing',
            seasonalFactor > 0 
              ? `Seasonal demand is ${Math.round(seasonalFactor * 100)}% higher - consider temporary price adjustment`
              : null,
            marketData.price_stddev > 10
              ? 'High price variance suggests room for strategic positioning'
              : 'Stable pricing in category - focus on value proposition'
          ].filter(Boolean)
        },
        similarProducts: similarProducts.map(p => ({
          name: p.name,
          price: p.price,
          vendor: p.vendor_name,
          rating: p.rating,
          reviews: p.review_count
        }))
      }
    });
    
  } catch (error) {
    console.error('Market data API error:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      success: false,
      error: 'Database unavailable',
      data: {
        category: request.nextUrl.searchParams.get('category') || 'default',
        marketStats: {
          minPrice: 15,
          maxPrice: 50,
          avgPrice: 30,
          medianPrice: 28,
          priceVariance: 8,
          productCount: 0
        },
        vopPricing: {
          fairPrice: 25,
          explanation: 'Default VOP fair pricing recommendation'
        },
        insights: {
          competitionLevel: 'medium',
          competitorCount: 10,
          seasonalFactor: 0,
          demandIndicator: 'moderate',
          recommendations: [
            'Price competitively to establish market presence',
            'Consider introductory offers for new products'
          ]
        },
        similarProducts: []
      }
    });
  }
}