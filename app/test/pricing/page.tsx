'use client';

import React, { useState } from 'react';
import SmartPricingSuggestion from '@/components/vendor/SmartPricingSuggestion';
import { useMarketPricing } from '@/hooks/useMarketPricing';

export default function PricingTestPage() {
  const [selectedCategory, setSelectedCategory] = useState('beverages');
  const [productName, setProductName] = useState('Organic Green Tea');
  const [currentPrice, setCurrentPrice] = useState(25);
  const [showApiData, setShowApiData] = useState(false);
  
  // Test the market pricing hook
  const { data: marketData, isLoading, error, refetch } = useMarketPricing(
    selectedCategory,
    productName
  );
  
  const categories = [
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'spreads', label: 'Spreads' },
    { value: 'prepared-foods', label: 'Prepared Foods' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'proteins', label: 'Proteins' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'crafts', label: 'Crafts' },
    { value: 'services', label: 'Services' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Smart Pricing Suggestion Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter product name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Current Price (₪)</label>
                <input
                  type="number"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowApiData(!showApiData)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showApiData ? 'Hide' : 'Show'} API Data
                </button>
                
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh Data
                </button>
              </div>
            </div>
            
            {/* API Data Display */}
            {showApiData && marketData && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Market API Response:</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(marketData, null, 2)}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                Error: {error}
              </div>
            )}
          </div>
          
          {/* Smart Pricing Component */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Smart Pricing Suggestion Component</h2>
            
            <SmartPricingSuggestion
              category={selectedCategory}
              productName={productName}
              currentPrice={currentPrice}
              onPriceSelect={(price) => {
                setCurrentPrice(price);
                alert(`Price selected: ₪${price}`);
              }}
            />
          </div>
        </div>
        
        {/* Examples Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Component Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-chart-line text-sun-gold"></i>
                Market Analysis
              </h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Real-time market data</li>
                <li>• Price range visualization</li>
                <li>• Competitor analysis</li>
                <li>• Seasonal adjustments</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-users text-leaf-green"></i>
                VOP Fair Pricing
              </h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Community-focused pricing</li>
                <li>• Fair vendor margins</li>
                <li>• Accessible to members</li>
                <li>• Transparent calculations</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-magic text-earth-flame"></i>
                Smart Features
              </h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Three pricing strategies</li>
                <li>• Demand indicators</li>
                <li>• Pricing tips</li>
                <li>• One-click apply</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Integration Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Integration Guide</h2>
          
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-3">Basic Usage:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`<SmartPricingSuggestion
  category="beverages"
  productName="Organic Green Tea"
  currentPrice={25}
  onPriceSelect={(price) => {
    // Update your product price
    updateProduct({ price });
  }}
/>`}
            </pre>
            
            <h3 className="text-lg font-semibold mb-3 mt-6">With Market Data Hook:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const { data, isLoading, error } = useMarketPricing(
  category,
  productName
);

// Access market insights
console.log(data?.marketStats);
console.log(data?.insights.recommendations);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}