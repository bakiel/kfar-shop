import { useState, useEffect, useCallback } from 'react';

interface MarketStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  priceVariance: number;
  productCount: number;
}

interface VOPPricing {
  fairPrice: number;
  explanation: string;
}

interface MarketInsights {
  competitionLevel: 'low' | 'medium' | 'high';
  competitorCount: number;
  seasonalFactor: number;
  demandIndicator: string;
  recommendations: string[];
}

interface SimilarProduct {
  name: string;
  price: number;
  vendor: string;
  rating: number;
  reviews: number;
}

interface MarketPricingData {
  category: string;
  marketStats: MarketStats;
  vopPricing: VOPPricing;
  insights: MarketInsights;
  similarProducts: SimilarProduct[];
}

interface UseMarketPricingReturn {
  data: MarketPricingData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for market data to reduce API calls
const marketDataCache = new Map<string, { data: MarketPricingData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useMarketPricing(
  category: string,
  productName?: string
): UseMarketPricingReturn {
  const [data, setData] = useState<MarketPricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cacheKey = `${category}-${productName || ''}`;
  
  const fetchMarketData = useCallback(async () => {
    // Check cache first
    const cached = marketDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ category });
      if (productName) {
        params.append('productName', productName);
      }
      
      const response = await fetch(`/api/pricing/market-data?${params}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        // Cache the result
        marketDataCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      } else {
        // Use the fallback data if provided
        if (result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch market data');
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load pricing data');
      
      // Provide fallback data
      setData({
        category,
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
          explanation: 'VOP community fair pricing recommendation'
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
      });
    } finally {
      setIsLoading(false);
    }
  }, [category, productName, cacheKey]);
  
  useEffect(() => {
    if (category) {
      fetchMarketData();
    }
  }, [category, productName, fetchMarketData]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchMarketData
  };
}

// Utility function to calculate pricing suggestions
export function calculatePricingSuggestion(
  marketStats: MarketStats,
  strategy: 'competitive' | 'vop' | 'premium' = 'vop'
): number {
  switch (strategy) {
    case 'competitive':
      // 5-10% below average
      return Math.round(marketStats.avgPrice * 0.92);
      
    case 'vop':
      // Slightly below median for fair pricing
      return Math.round(marketStats.medianPrice * 0.9);
      
    case 'premium':
      // 10-15% above average
      return Math.round(marketStats.avgPrice * 1.12);
      
    default:
      return Math.round(marketStats.medianPrice);
  }
}

// Utility to format price in ILS
export function formatPrice(price: number): string {
  return `₪${price.toFixed(0)}`;
}

// Utility to get price position percentage
export function getPricePosition(
  price: number, 
  min: number, 
  max: number
): number {
  if (max === min) return 50;
  const position = ((price - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, position));
}