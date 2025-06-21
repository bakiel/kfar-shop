'use client';

import React, { useState, useEffect } from 'react';

interface ImageGuidelinesProps {
  imageUrl?: string;
  onClose?: () => void;
}

interface ImageAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions: string[];
  score: number;
}

export default function ImageGuidelines({ imageUrl, onClose }: ImageGuidelinesProps) {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      analyzeImage(imageUrl);
    }
  }, [imageUrl]);

  const analyzeImage = async (url: string) => {
    setAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call a real AI service)
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const analysis = performImageAnalysis(img);
        setAnalysis(analysis);
        setAnalyzing(false);
      };
      img.src = url;
    }, 1000);
  };

  const performImageAnalysis = (img: HTMLImageElement): ImageAnalysis => {
    const suggestions: string[] = [];
    let score = 100;

    // Aspect ratio check
    if (img.width !== img.height) {
      suggestions.push('Use a square (1:1) aspect ratio for consistency');
      score -= 10;
    }

    // Resolution check
    if (img.width < 800 || img.height < 800) {
      suggestions.push('Use images at least 800x800 pixels for best quality');
      score -= 20;
    } else if (img.width < 1200 || img.height < 1200) {
      suggestions.push('Consider using higher resolution (1200x1200) for premium appearance');
      score -= 5;
    }

    // Add general photography tips
    if (score > 80) {
      suggestions.push('Ensure good lighting with minimal shadows');
      suggestions.push('Use a clean, neutral background');
      suggestions.push('Center the product in frame');
    }

    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) quality = 'excellent';
    else if (score >= 75) quality = 'good';
    else if (score >= 60) quality = 'fair';
    else quality = 'poor';

    return { quality, suggestions, score };
  };

  const guidelines = [
    {
      icon: 'fa-camera',
      title: 'Photography Tips',
      items: [
        'Use natural daylight or soft studio lighting',
        'Avoid harsh shadows and reflections',
        'Shoot at eye level for most products',
        'Keep the product as the main focus'
      ]
    },
    {
      icon: 'fa-crop',
      title: 'Composition',
      items: [
        'Center your product in the frame',
        'Leave some padding around the edges',
        'Use the rule of thirds for lifestyle shots',
        'Maintain consistent angles across products'
      ]
    },
    {
      icon: 'fa-palette',
      title: 'Background & Colors',
      items: [
        'Use a clean, white or neutral background',
        'Ensure accurate color representation',
        'Remove distracting elements',
        'Consider lifestyle context for some products'
      ]
    },
    {
      icon: 'fa-image',
      title: 'Technical Requirements',
      items: [
        'Minimum resolution: 800x800 pixels',
        'Maximum file size: 500KB',
        'Format: JPEG (auto-converted)',
        'Square aspect ratio (1:1)'
      ]
    }
  ];

  const exampleImages = [
    {
      type: 'good',
      description: 'Well-lit, centered product',
      tips: ['Clean background', 'Sharp focus', 'Good composition']
    },
    {
      type: 'bad',
      description: 'Common mistakes to avoid',
      tips: ['Blurry or out of focus', 'Poor lighting', 'Cluttered background']
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-camera-retro mr-2 text-[#478c0b]"></i>
          Product Photography Guidelines
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        )}
      </div>

      {/* AI Analysis Results */}
      {imageUrl && analysis && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <i className="fas fa-robot text-[#478c0b]"></i>
            AI Image Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-3xl ${
                  analysis.quality === 'excellent' ? 'text-green-600' :
                  analysis.quality === 'good' ? 'text-blue-600' :
                  analysis.quality === 'fair' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  <i className={`fas fa-${
                    analysis.quality === 'excellent' ? 'check-circle' :
                    analysis.quality === 'good' ? 'thumbs-up' :
                    analysis.quality === 'fair' ? 'exclamation-circle' :
                    'times-circle'
                  }`}></i>
                </div>
                <div>
                  <p className="font-semibold capitalize">{analysis.quality} Quality</p>
                  <p className="text-sm text-gray-600">Score: {analysis.score}/100</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Suggestions:</p>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <i className="fas fa-arrow-right text-xs mt-1 text-[#478c0b]"></i>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {guidelines.map((section, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[#478c0b]">
              <i className={`fas ${section.icon}`}></i>
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm text-gray-600 flex items-start gap-2">
                  <i className="fas fa-check text-xs mt-1 text-green-600"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Visual Examples */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Visual Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exampleImages.map((example, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              example.type === 'good' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <i className={`fas fa-${example.type === 'good' ? 'check' : 'times'}-circle text-2xl ${
                  example.type === 'good' ? 'text-green-600' : 'text-red-600'
                }`}></i>
                <p className="font-semibold">{example.description}</p>
              </div>
              
              {/* Placeholder for example image */}
              <div className="bg-white rounded-lg h-48 mb-3 flex items-center justify-center border-2 border-dashed border-gray-300">
                <i className="fas fa-image text-4xl text-gray-400"></i>
              </div>
              
              <ul className="space-y-1">
                {example.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                    <i className={`fas fa-${example.type === 'good' ? 'check' : 'times'} text-xs mt-1 ${
                      example.type === 'good' ? 'text-green-600' : 'text-red-600'
                    }`}></i>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-800">
          <i className="fas fa-lightbulb mr-2"></i>
          Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Take multiple shots from different angles and choose the best one</li>
          <li>• Edit brightness and contrast for consistency across your catalog</li>
          <li>• Use props sparingly to show scale or context</li>
          <li>• Maintain a consistent style across all your product images</li>
        </ul>
      </div>

      {analyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <i className="fas fa-spinner fa-spin text-2xl text-[#478c0b]"></i>
            <p>Analyzing image quality...</p>
          </div>
        </div>
      )}
    </div>
  );
}