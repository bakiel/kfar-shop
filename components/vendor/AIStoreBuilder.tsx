'use client';

import React, { useState } from 'react';
import { Sparkles, Palette, Layout, Store, Eye, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AIStoreBuilderProps {
  vendorId: string;
  onSave: (config: any) => void;
}

export default function AIStoreBuilder({ vendorId, onSave }: AIStoreBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storeConfig, setStoreConfig] = useState({
    theme: 'modern',
    heroStyle: 'gradient',
    productLayout: 'grid',
    colorScheme: 'brand',
    features: {
      showReviews: true,
      showSocialProof: true,
      showQuickAdd: true,
      showFilters: true
    }
  });

  const themes = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
    { id: 'artisanal', name: 'Artisanal', description: 'Handcrafted feel' },
    { id: 'premium', name: 'Premium', description: 'Luxury and elegance' },
    { id: 'community', name: 'Community', description: 'Warm and welcoming' },
    { id: 'fresh', name: 'Fresh', description: 'Vibrant and energetic' },
    { id: 'heritage', name: 'Heritage', description: 'Traditional and authentic' }
  ];

  const generateWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      // AI would analyze vendor products and suggest optimal configuration
      const aiSuggestions = {
        theme: vendorId === 'teva-deli' ? 'modern' :
               vendorId === 'queens-cuisine' ? 'artisanal' :
               vendorId === 'gahn-delight' ? 'fresh' :
               vendorId === 'people-store' ? 'community' :
               vendorId === 'vop-shop' ? 'heritage' : 'premium',
        heroStyle: 'gradient',
        productLayout: 'grid',
        colorScheme: 'brand',
        features: {
          showReviews: true,
          showSocialProof: true,
          showQuickAdd: true,
          showFilters: true
        }
      };
      
      setStoreConfig(aiSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Store className="w-8 h-8 text-leaf-green" />
                AI Store Builder
              </h1>
              <p className="text-gray-600 mt-2">
                Let AI help you create the perfect store design
              </p>
            </div>
            
            <button
              onClick={generateWithAI}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* AI Suggestion Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900">AI Recommendations</p>
                <p className="text-sm text-purple-700 mt-1">
                  Based on your product catalog and vendor type, AI suggests a {storeConfig.theme} theme with {storeConfig.productLayout} layout for optimal conversion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Theme Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-sun-gold" />
              Store Theme
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setStoreConfig({ ...storeConfig, theme: theme.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    storeConfig.theme === theme.id
                      ? 'border-leaf-green bg-leaf-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{theme.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Options */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-earth-flame" />
              Product Layout
            </h2>
            
            <div className="space-y-3">
              {['grid', 'list', 'masonry'].map(layout => (
                <label key={layout} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="layout"
                    value={layout}
                    checked={storeConfig.productLayout === layout}
                    onChange={(e) => setStoreConfig({ ...storeConfig, productLayout: e.target.value })}
                    className="w-4 h-4 text-leaf-green"
                  />
                  <span className="capitalize font-medium">{layout} View</span>
                </label>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Store Features</h3>
              <div className="space-y-2">
                {Object.entries(storeConfig.features).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setStoreConfig({
                        ...storeConfig,
                        features: { ...storeConfig.features, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-leaf-green rounded"
                    />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace('show', 'Show')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-leaf-green" />
            Live Preview
          </h2>
          
          <div className="bg-gray-100 rounded-xl p-4 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-leaf-green to-sun-gold rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
              </div>
              <p className="text-gray-600">
                Your store preview will appear here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Theme: {storeConfig.theme} | Layout: {storeConfig.productLayout}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            onClick={() => onSave(storeConfig)}
            className="px-6 py-3 bg-leaf-green text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Save className="w-5 h-5" />
            Save Store Design
          </button>
        </div>
      </div>
    </div>
  );
}