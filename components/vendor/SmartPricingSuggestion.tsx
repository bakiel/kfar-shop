'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Info, Sparkles, Users } from 'lucide-react';

interface PricingSuggestion {
  suggested: number;
  range: {
    min: number;
    max: number;
  };
  marketAverage: number;
  explanation: string;
}

interface MarketInsight {
  competitorCount: number;
  priceVariance: number;
  demandLevel: 'low' | 'medium' | 'high';
  seasonalFactor?: number;
}

interface SmartPricingSuggestionProps {
  category: string;
  productName?: string;
  currentPrice?: number;
  onPriceSelect: (price: number) => void;
  className?: string;
}

// Extended market data with more categories
const MARKET_DATA: Record<string, { min: number; max: number; avg: number; vopTarget: number }> = {
  // Food categories
  'spreads': { min: 18, max: 45, avg: 28, vopTarget: 25 },
  'beverages': { min: 8, max: 25, avg: 15, vopTarget: 14 },
  'snacks': { min: 10, max: 35, avg: 22, vopTarget: 20 },
  'prepared-foods': { min: 25, max: 65, avg: 42, vopTarget: 38 },
  'condiments': { min: 12, max: 38, avg: 24, vopTarget: 22 },
  'grains': { min: 15, max: 40, avg: 26, vopTarget: 24 },
  'proteins': { min: 30, max: 80, avg: 55, vopTarget: 50 },
  'desserts': { min: 20, max: 50, avg: 35, vopTarget: 32 },
  'bakery': { min: 15, max: 45, avg: 28, vopTarget: 26 },
  'dairy-alternatives': { min: 20, max: 55, avg: 35, vopTarget: 32 },
  
  // Non-food categories
  'clothing': { min: 50, max: 200, avg: 100, vopTarget: 85 },
  'wellness': { min: 30, max: 150, avg: 75, vopTarget: 65 },
  'crafts': { min: 25, max: 100, avg: 50, vopTarget: 45 },
  'services': { min: 50, max: 300, avg: 150, vopTarget: 120 },
  
  // Default
  'default': { min: 15, max: 50, avg: 30, vopTarget: 28 }
};

// Simulated market insights
const generateMarketInsights = (category: string): MarketInsight => {
  const categoryData = MARKET_DATA[category] || MARKET_DATA.default;
  const variance = ((categoryData.max - categoryData.min) / categoryData.avg) * 100;
  
  return {
    competitorCount: Math.floor(Math.random() * 15) + 5,
    priceVariance: Math.round(variance),
    demandLevel: variance > 50 ? 'high' : variance > 30 ? 'medium' : 'low',
    seasonalFactor: Math.random() > 0.5 ? (Math.random() * 0.3 - 0.15) : undefined
  };
};

export default function SmartPricingSuggestion({
  category,
  productName,
  currentPrice,
  onPriceSelect,
  className = ''
}: SmartPricingSuggestionProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<'competitive' | 'vop' | 'premium'>('vop');
  const [showDetails, setShowDetails] = useState(false);
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  
  // Get market data for category
  const categoryKey = category.toLowerCase().replace(/[^a-z]/g, '-');
  const marketData = MARKET_DATA[categoryKey] || MARKET_DATA.default;
  
  // Generate pricing based on strategy
  const getPriceByStrategy = (strategy: string): PricingSuggestion => {
    let suggested: number;
    let explanation: string;
    
    switch (strategy) {
      case 'competitive':
        // 5-10% below market average
        suggested = Math.round(marketData.avg * 0.92);
        explanation = `Competitive pricing strategy: ₪${suggested} is 8% below market average to attract price-conscious customers while maintaining healthy margins.`;
        break;
        
      case 'vop':
        // VOP community fair pricing
        suggested = marketData.vopTarget;
        explanation = `VOP Fair Pricing: ₪${suggested} reflects our community values - fair for vendors and accessible for all Village of Peace members.`;
        break;
        
      case 'premium':
        // 10-15% above average for quality positioning
        suggested = Math.round(marketData.avg * 1.12);
        explanation = `Premium positioning: ₪${suggested} reflects the high quality and unique value of your ${productName || 'product'}.`;
        break;
        
      default:
        suggested = marketData.vopTarget;
        explanation = 'Recommended price based on market analysis.';
    }
    
    // Apply seasonal adjustment if available
    if (insights?.seasonalFactor) {
      suggested = Math.round(suggested * (1 + insights.seasonalFactor));
      explanation += ` (Adjusted ${insights.seasonalFactor > 0 ? 'up' : 'down'} for seasonal demand)`;
    }
    
    return {
      suggested,
      range: { min: marketData.min, max: marketData.max },
      marketAverage: marketData.avg,
      explanation
    };
  };
  
  const currentSuggestion = getPriceByStrategy(selectedStrategy);
  
  useEffect(() => {
    // Generate market insights when component mounts or category changes
    setInsights(generateMarketInsights(categoryKey));
  }, [categoryKey]);
  
  // Calculate price position percentage
  const getPricePosition = (price: number) => {
    const range = marketData.max - marketData.min;
    const position = ((price - marketData.min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Smart Pricing Assistant</h3>
              <p className="text-sm text-white/80">AI-powered pricing recommendations</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Pricing Strategies */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedStrategy('competitive')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedStrategy === 'competitive' 
                ? 'border-sun-gold bg-sun-gold/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <TrendingDown className={`w-5 h-5 mx-auto mb-1 ${
              selectedStrategy === 'competitive' ? 'text-sun-gold' : 'text-gray-500'
            }`} />
            <p className="text-xs font-medium">Competitive</p>
          </button>
          
          <button
            onClick={() => setSelectedStrategy('vop')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedStrategy === 'vop' 
                ? 'border-leaf-green bg-leaf-green/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className={`w-5 h-5 mx-auto mb-1 ${
              selectedStrategy === 'vop' ? 'text-leaf-green' : 'text-gray-500'
            }`} />
            <p className="text-xs font-medium">VOP Fair</p>
          </button>
          
          <button
            onClick={() => setSelectedStrategy('premium')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedStrategy === 'premium' 
                ? 'border-earth-flame bg-earth-flame/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${
              selectedStrategy === 'premium' ? 'text-earth-flame' : 'text-gray-500'
            }`} />
            <p className="text-xs font-medium">Premium</p>
          </button>
        </div>
        
        {/* Suggested Price */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Suggested Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-soil-brown">₪{currentSuggestion.suggested}</span>
                {currentPrice && currentPrice !== currentSuggestion.suggested && (
                  <span className={`text-sm ${
                    currentPrice > currentSuggestion.suggested ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentPrice > currentSuggestion.suggested ? '↓' : '↑'} 
                    {Math.abs(Math.round(((currentPrice - currentSuggestion.suggested) / currentPrice) * 100))}%
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onPriceSelect(currentSuggestion.suggested)}
              className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark transition-colors font-medium"
            >
              Apply Price
            </button>
          </div>
          
          {/* Price Range Visualization */}
          <div className="relative mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sun-gold via-leaf-green to-earth-flame rounded-full"
                   style={{ width: '100%' }} />
            </div>
            {/* Market indicators */}
            <div className="absolute top-0 h-2 w-0.5 bg-gray-700" 
                 style={{ left: `${getPricePosition(marketData.avg)}%` }} />
            <div className="absolute -top-1 h-4 w-4 bg-leaf-green rounded-full border-2 border-white shadow-sm" 
                 style={{ left: `${getPricePosition(currentSuggestion.suggested)}%`, marginLeft: '-8px' }} />
            {currentPrice && (
              <div className="absolute -top-1 h-4 w-4 bg-gray-400 rounded-full border-2 border-white shadow-sm" 
                   style={{ left: `${getPricePosition(currentPrice)}%`, marginLeft: '-8px' }} />
            )}
          </div>
          
          {/* Price labels */}
          <div className="flex justify-between text-xs text-gray-600 mb-3">
            <span>₪{marketData.min}</span>
            <span className="font-medium">Market Avg: ₪{marketData.avg}</span>
            <span>₪{marketData.max}</span>
          </div>
          
          <p className="text-sm text-gray-600">{currentSuggestion.explanation}</p>
        </div>
        
        {/* Market Insights */}
        {showDetails && insights && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-semibold text-gray-700">Market Insights</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Competition</p>
                <p className="text-lg font-semibold text-blue-800">{insights.competitorCount} vendors</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 mb-1">Price Variance</p>
                <p className="text-lg font-semibold text-purple-800">{insights.priceVariance}%</p>
              </div>
            </div>
            
            <div className={`rounded-lg p-3 ${
              insights.demandLevel === 'high' ? 'bg-red-50' :
              insights.demandLevel === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <p className={`text-xs mb-1 ${
                insights.demandLevel === 'high' ? 'text-red-600' :
                insights.demandLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                Market Demand
              </p>
              <p className={`text-lg font-semibold capitalize ${
                insights.demandLevel === 'high' ? 'text-red-800' :
                insights.demandLevel === 'medium' ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {insights.demandLevel}
              </p>
            </div>
            
            {insights.seasonalFactor && (
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 mb-1">Seasonal Adjustment</p>
                <p className="text-lg font-semibold text-orange-800">
                  {insights.seasonalFactor > 0 ? '+' : ''}{Math.round(insights.seasonalFactor * 100)}%
                </p>
              </div>
            )}
            
            {/* Quick Tips */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">💡 Pricing Tips</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Consider offering bundle deals for higher value</li>
                <li>• Test different price points with limited offers</li>
                <li>• Update prices based on customer feedback</li>
                <li>• VOP members appreciate transparent, fair pricing</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}