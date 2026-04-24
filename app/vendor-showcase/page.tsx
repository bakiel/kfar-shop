'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, Eye, Sparkles, Globe, Smartphone, Shield, TrendingUp, Users } from 'lucide-react';

// Mock vendor data for showcase
const vendorShowcaseData = [
  {
    id: 'teva-deli',
    name: 'Teva Deli',
    logo: '/images/logos/placeholder-logo.png',
    theme: 'Modern & Professional',
    color: '#478c0b',
    features: ['Product Catalog', 'Quick Ordering', 'Bulk Discounts', 'Kosher Certified'],
    description: 'A sleek, modern design perfect for a professional plant-based deli'
  },
  {
    id: 'queens-cuisine',
    name: 'Queens Cuisine',
    logo: '/images/logos/placeholder-logo.png',
    theme: 'Artisanal & Warm',
    color: '#8B4513',
    features: ['Recipe Integration', 'Story Telling', 'Local Delivery', 'Catering Services'],
    description: 'Warm, inviting design that tells the story behind each dish'
  },
  {
    id: 'kfar-natural',
    name: 'KFAR Natural',
    logo: '/images/logos/placeholder-logo.png',
    theme: 'Clean & Organic',
    color: '#2F7D32',
    features: ['Sustainability Focus', 'Farm Stories', 'Seasonal Products', 'Community Hub'],
    description: 'Clean, eco-friendly design highlighting organic and sustainable products'
  }
];

export default function VendorShowcasePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Your Store, Your Website, Your Success
            </h1>
            <p className="text-2xl mb-8 text-white/90">
              Every KFAR vendor gets a professional website - not just a store listing
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6" />
                <span>Custom Domain</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                <span>Mobile Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>Secure & Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Built-in Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Powered by AI</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              AI-Powered Store Builder
            </h2>
            <p className="text-xl text-gray-600">
              Our AI analyzes your products and creates the perfect store design in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Design</h3>
              <p className="text-gray-600">AI selects the perfect theme based on your products</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">SEO Optimized</h3>
              <p className="text-gray-600">Automatically optimized for search engines</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Insights</h3>
              <p className="text-gray-600">AI-powered analytics and recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Showcase Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            See Our Vendors' Beautiful Stores
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendorShowcaseData.map((vendor) => (
              <div key={vendor.id} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Store Preview Header */}
                <div 
                  className="h-48 relative"
                  style={{ backgroundColor: vendor.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white rounded-xl p-2 flex items-center justify-center">
                        <Store className="w-8 h-8 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{vendor.name}</h3>
                        <p className="text-sm opacity-90">{vendor.theme}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Details */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{vendor.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {vendor.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link 
                      href={`/vendors/${vendor.id}`}
                      className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Store
                    </Link>
                    <Link 
                      href="/vendor/register"
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Store className="w-4 h-4" />
                      Create Yours
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Launch Your Professional Store?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join KFAR marketplace and get your own AI-powered website in minutes
          </p>
          <Link 
            href="/vendor/register"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Store className="w-5 h-5" />
            Start Your Store Now
          </Link>
        </div>
      </section>
    </>
  );
}
