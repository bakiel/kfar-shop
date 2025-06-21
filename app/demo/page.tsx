'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';

export default function DemoPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                  🎉 CLIENT DEMO - KFAR Marketplace
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                KFAR Marketplace
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                AI-Powered Vegan Commerce Platform
                <br />
                <span className="text-green-600 font-semibold">Village of Peace Community</span>
                <br />
                <span className="text-blue-600 font-semibold">✨ Now with ElevenLabs v3 Voice Technology!</span>
              </p>

              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-green-600">100+</div>
                  <div className="text-sm text-gray-600">Vegan Products</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">Active Vendors</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">AI Assistant</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Instructions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">
                🤖 Try the AI Assistant
              </h3>
              <p className="text-center text-gray-600 mb-8 text-lg">
                Click the AI chat button (bottom-right corner) and ask these questions:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🏘️</span>
                    <span className="text-gray-700 font-bold">"Tell me about your community"</span>
                  </div>
                  <p className="text-sm text-gray-600">Learn about 50+ years of vegan living in Dimona, Israel</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🛍️</span>
                    <span className="text-gray-700 font-bold">"Show me popular products"</span>
                  </div>
                  <p className="text-sm text-gray-600">See featured products with descriptions and pricing</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🥗</span>
                    <span className="text-gray-700 font-bold">"Tell me about Teva Deli"</span>
                  </div>
                  <p className="text-sm text-gray-600">Learn about our plant-based meat alternatives specialist</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💪</span>
                    <span className="text-gray-700 font-bold">"What about nutrition?"</span>
                  </div>
                  <p className="text-sm text-gray-600">Get information about plant-based nutrition and health</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-block bg-green-100 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">
                    ✅ AI Chat is working and ready to demo!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Look for the chat button in the bottom-right corner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Demo Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-gray-600">Interactive chat with community knowledge and product recommendations</p>
              </div>
              
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-2">Vegan Products</h3>
                <p className="text-gray-600">100+ authentic vegan products from Village of Peace vendors</p>
              </div>
              
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
                <p className="text-gray-600">Responsive design that works perfectly on all devices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience KFAR Marketplace?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Click the AI chat button and start exploring our community-driven marketplace
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold mb-4">🎬 Demo Instructions:</h3>
              <ol className="text-left space-y-2">
                <li>1. Look for the green chat button (bottom-right corner)</li>
                <li>2. Click to open the AI assistant</li>
                <li>3. Try any of the suggested questions above</li>
                <li>4. Explore products, vendors, and community stories</li>
                <li>5. Experience the future of AI-powered commerce!</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
