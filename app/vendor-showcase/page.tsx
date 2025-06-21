'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, Eye, Sparkles, Globe, Smartphone, Shield, TrendingUp, Users } from 'lucide-react';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

const vendorShowcaseData = [
  {
    id: 'teva-deli',
    theme: 'Modern & Professional',
    color: '#478c0b',
    features: ['Product Catalog', 'Quick Ordering', 'Bulk Discounts', 'Kosher Certified'],
    description: 'A sleek, modern design perfect for a professional plant-based deli'
  },
  {
    id: 'queens-cuisine',
    theme: 'Artisanal & Warm',
    color: '#8B4513',
    features: ['Recipe Integration', 'Story Telling', 'Craft Process', 'Local Sourcing'],
    description: 'Handcrafted feel that tells the story of traditional vegan cuisine'
  },
  {
    id: 'gahn-delight',
    theme: 'Fresh & Vibrant',
    color: '#2ECC71',
    features: ['Seasonal Menus', 'Flavor Profiles', 'Instagram Ready', 'Quick Delivery'],
    description: 'Colorful and appetizing design for artisanal ice cream'
  },
  {
    id: 'garden-of-light',
    theme: 'Premium & Elegant',
    color: '#1a1a1a',
    features: ['Health Benefits', 'Ingredient Stories', 'Subscription Plans', 'Wellness Blog'],
    description: 'Sophisticated design for premium wellness products'
  },
  {
    id: 'people-store',
    theme: 'Community & Trust',
    color: '#478c0b',
    features: ['Member Benefits', 'Bulk Options', 'Co-op Values', 'Local Partners'],
    description: 'Welcoming community store with cooperative values'
  },
  {
    id: 'vop-shop',
    theme: 'Heritage & Culture',
    color: '#8B0000',
    features: ['Cultural Stories', 'Heritage Items', 'Educational Content', '50+ Years Legacy'],
    description: 'Rich cultural heritage showcasing decades of community history'
  }
];

export default function VendorShowcasePage() {
  const vendors = completeProductCatalog;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-leaf-green to-sun-gold text-white py-20">
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
                <span>Custom Domain Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                <span>Mobile Responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>Secure Checkout</span>
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
            {vendorShowcaseData.map((showcase) => {
              const vendor = vendors.find(v => v.id === showcase.id);
              if (!vendor) return null;

              return (
                <div key={vendor.id} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {/* Store Preview Header */}
                  <div 
                    className="h-48 relative"
                    style={{ backgroundColor: showcase.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white rounded-xl p-1">
                          <Image
                            src={vendor.logo}
                            alt={vendor.name || "Image"}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{vendor.name}</h3>
                          <p className="text-sm opacity-90">{showcase.theme}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{showcase.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {showcase.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
                      <span>{vendor.products.length} Products</span>
                      <span>⭐ {vendor.rating} ({vendor.reviewCount})</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link 
                        href={`/store/${vendor.id}`}
                        className="flex-1 bg-leaf-green text-white text-center py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        View Store
                      </Link>
                      <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                        <Store className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-leaf-green to-earth-flame text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Launch Your Professional Store?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join KiFar Marketplace and get your own website with AI-powered tools, 
            analytics, and everything you need to succeed online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/vendor/register"
              className="px-8 py-4 bg-white text-leaf-green rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
            >
              Start Your Store Today
            </Link>
            <Link 
              href="/vendor/demo"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}