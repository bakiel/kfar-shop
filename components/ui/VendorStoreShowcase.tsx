'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Sparkles, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function VendorStoreShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">NEW: AI-Powered Stores</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Every Vendor Gets a Free Website
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Not just a store listing - get your own professional website with AI-powered design, 
            analytics, and marketing tools. See how our vendors shine online.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Professional Design</h3>
            <p className="text-gray-600">
              Choose from 6 themes or let AI design your perfect store based on your products
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your Own Domain</h3>
            <p className="text-gray-600">
              Get yourstore.kfar.com or connect your own domain. Full SEO optimization included
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Marketing Tools</h3>
            <p className="text-gray-600">
              Automated product descriptions, smart pricing, and customer insights powered by AI
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold mb-4 text-gray-800">
                See Our Vendors' Success Stories
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                From plant-based delis to heritage shops, explore how KFAR vendors are building 
                thriving online businesses with their custom websites.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">Mobile responsive designs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">Integrated payment processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">Real-time analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">Social media integration</span>
                </div>
              </div>
              <Link 
                href="/vendor-showcase"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all w-fit"
              >
                Explore Vendor Stores
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-purple-100 to-blue-100">
              <div className="absolute inset-0 p-8 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  {/* Mock Store Preview */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="h-32 bg-gradient-to-br from-leaf-green to-sun-gold" />
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                          <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-200 rounded-full opacity-50 blur-xl" />
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}