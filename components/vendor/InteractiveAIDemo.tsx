'use client';

import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Check, Camera, RefreshCw, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AnalysisResult {
  productName: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  ingredients: string[];
  dietaryInfo: string[];
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  vopCompliant: boolean;
  complianceNotes: string[];
  confidence: number;
}

const DEMO_PRODUCTS = [
  {
    id: 'hummus',
    name: 'Organic Hummus',
    image: '/images/demo/hummus-demo.jpg',
    preAnalyzed: {
      productName: 'Premium Organic Hummus',
      nameHe: 'חומוס אורגני פרימיום',
      description: 'Creamy, authentic Middle Eastern hummus made with organic chickpeas, tahini, fresh lemon juice, and a hint of garlic. Perfect for spreading, dipping, or as a healthy protein-rich meal base.',
      descriptionHe: 'חומוס מזרח תיכוני קרמי ואותנטי עשוי מחומוס אורגני, טחינה, מיץ לימון טרי ושמץ של שום. מושלם למריחה, טבילה או כבסיס לארוחה עשירה בחלבון.',
      ingredients: ['Organic Chickpeas', 'Tahini', 'Lemon Juice', 'Garlic', 'Sea Salt', 'Extra Virgin Olive Oil'],
      dietaryInfo: ['100% Vegan', 'Gluten-Free', 'High Protein', 'No Preservatives'],
      suggestedPrice: 22,
      priceRange: { min: 18, max: 28 },
      vopCompliant: true,
      complianceNotes: ['All ingredients are plant-based', 'No artificial additives', 'Meets VOP dietary standards'],
      confidence: 96
    }
  },
  {
    id: 'bread',
    name: 'Sourdough Bread',
    image: '/images/demo/bread-demo.jpg',
    preAnalyzed: {
      productName: 'Artisanal Sourdough Bread',
      nameHe: 'לחם מחמצת ארטיזנלי',
      description: 'Traditional long-fermented sourdough bread with a crispy crust and tangy, chewy interior. Made with organic flour and natural wild yeast starter for optimal digestibility and flavor.',
      descriptionHe: 'לחם מחמצת מסורתי בתסיסה ארוכה עם קרום פריך ופנים לעיס וחמצמץ. עשוי מקמח אורגני ומחמצת טבעית לעיכול אופטימלי וטעם עשיר.',
      ingredients: ['Organic Wheat Flour', 'Water', 'Sea Salt', 'Natural Sourdough Starter'],
      dietaryInfo: ['Vegan', 'No Commercial Yeast', 'Long Fermentation', 'Artisanal'],
      suggestedPrice: 18,
      priceRange: { min: 15, max: 24 },
      vopCompliant: true,
      complianceNotes: ['100% plant-based ingredients', 'Traditional preparation method', 'No additives or preservatives'],
      confidence: 94
    }
  },
  {
    id: 'salad',
    name: 'Fresh Garden Salad',
    image: '/images/demo/salad-demo.jpg',
    preAnalyzed: {
      productName: 'Rainbow Garden Salad Bowl',
      nameHe: 'קערת סלט גן קשת',
      description: 'Vibrant mix of organic leafy greens, cherry tomatoes, cucumbers, bell peppers, and carrots. Served with our house-made tahini-lemon dressing. A colorful, nutritious meal packed with vitamins.',
      descriptionHe: 'תערובת צבעונית של עלים ירוקים אורגניים, עגבניות שרי, מלפפונים, פלפלים וגזר. מוגש עם רוטב טחינה-לימון תוצרת בית. ארוחה צבעונית ומזינה עמוסה בויטמינים.',
      ingredients: ['Mixed Greens', 'Cherry Tomatoes', 'Cucumbers', 'Bell Peppers', 'Carrots', 'Tahini Dressing'],
      dietaryInfo: ['Raw Vegan', 'Gluten-Free', 'High Fiber', 'Low Calorie'],
      suggestedPrice: 35,
      priceRange: { min: 28, max: 42 },
      vopCompliant: true,
      complianceNotes: ['Fresh, raw vegetables', 'Plant-based dressing', 'No processed ingredients'],
      confidence: 98
    }
  }
];

export default function InteractiveAIDemo() {
  const [selectedDemo, setSelectedDemo] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDemoSelect = (index: number) => {
    setSelectedDemo(index);
    setShowResult(false);
    setUploadedImage(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const demoProduct = DEMO_PRODUCTS[selectedDemo];
    setAnalysisResult(demoProduct.preAnalyzed);
    setIsAnalyzing(false);
    setShowResult(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setShowResult(false);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark p-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          Try Our AI Product Analyzer
        </h3>
        <p className="text-white/90">
          See how AI transforms a simple product photo into a complete, optimized listing
        </p>
      </div>

      <div className="p-6">
        {/* Demo Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Choose a demo product or upload your own:</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {DEMO_PRODUCTS.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleDemoSelect(index)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  selectedDemo === index && !uploadedImage
                    ? 'border-leaf-green shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">
                      {product.id === 'hummus' ? '🥙' : product.id === 'bread' ? '🍞' : '🥗'}
                    </div>
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                </div>
                {selectedDemo === index && !uploadedImage && (
                  <div className="absolute top-2 right-2 bg-leaf-green text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Or upload your own image:</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
          </div>
        </div>

        {/* Selected Image Preview */}
        {(selectedDemo !== null || uploadedImage) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Product Image:</h4>
              {!isAnalyzing && !showResult && (
                <button
                  onClick={handleAnalyze}
                  className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI
                </button>
              )}
            </div>
            
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <div className="aspect-video flex items-center justify-center">
                {uploadedImage ? (
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded product" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">
                      {DEMO_PRODUCTS[selectedDemo].id === 'hummus' ? '🥙' : 
                       DEMO_PRODUCTS[selectedDemo].id === 'bread' ? '🍞' : '🥗'}
                    </div>
                    <p className="text-lg font-medium text-gray-700">
                      {DEMO_PRODUCTS[selectedDemo].name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Demo Product</p>
                  </div>
                )}
              </div>
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 text-center">
                    <Loader2 className="w-12 h-12 text-leaf-green animate-spin mx-auto mb-3" />
                    <p className="font-semibold">AI is analyzing your product...</p>
                    <p className="text-sm text-gray-600 mt-1">This usually takes 3-5 seconds</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {showResult && analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Analysis Complete!</p>
                  <p className="text-sm text-green-600">Confidence: {analysisResult.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Product Names */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product Name (English)</label>
                <p className="text-lg font-semibold mt-1">{analysisResult.productName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Product Name (Hebrew)</label>
                <p className="text-lg font-semibold mt-1" dir="rtl">{analysisResult.nameHe}</p>
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm mt-1 text-gray-700">{analysisResult.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Hebrew Description</label>
                <p className="text-sm mt-1 text-gray-700" dir="rtl">{analysisResult.descriptionHe}</p>
              </div>
            </div>

            {/* Ingredients & Dietary Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Detected Ingredients</label>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.ingredients.map((ingredient, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Dietary Information</label>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.dietaryInfo.map((info, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {info}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Suggestion */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">AI Pricing Recommendation</h5>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">₪{analysisResult.suggestedPrice}</p>
                  <p className="text-sm text-blue-600">Suggested Price</p>
                </div>
                <div className="text-sm text-blue-700">
                  <p>Market Range: ₪{analysisResult.priceRange.min} - ₪{analysisResult.priceRange.max}</p>
                  <p>Based on similar products in your area</p>
                </div>
              </div>
            </div>

            {/* VOP Compliance */}
            <div className={`rounded-lg p-4 ${
              analysisResult.vopCompliant ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <h5 className={`font-semibold mb-2 ${
                analysisResult.vopCompliant ? 'text-green-800' : 'text-yellow-800'
              }`}>
                Village of Peace Compliance
              </h5>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  analysisResult.vopCompliant ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  {analysisResult.complianceNotes.map((note, i) => (
                    <p key={i} className={analysisResult.vopCompliant ? 'text-green-700' : 'text-yellow-700'}>
                      • {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setShowResult(false);
                  setAnalysisResult(null);
                  setUploadedImage(null);
                }}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Another Product
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!showResult && (
          <div className="mt-8 p-6 bg-gradient-to-r from-sun-gold/10 to-earth-flame/10 rounded-lg text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Ready to Transform Your Business?
            </p>
            <p className="text-gray-600 mb-4">
              Join KFAR Marketplace and let AI handle the heavy lifting
            </p>
            <Link
              href="/vendor/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-earth-flame text-white rounded-lg hover:bg-earth-flame-dark transition-colors"
            >
              Start Your Free Store
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
