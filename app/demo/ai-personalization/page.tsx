'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PersonalizedShopping from '@/components/customer/PersonalizedShopping';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import { toast } from '@/components/ui/use-toast';

export default function AIPersonalizationDemo() {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'live-demo' | 'technical'>('overview');
  const [simulatedScan, setSimulatedScan] = useState(false);
  
  // Demo customer profile
  const demoCustomer = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Sarah Cohen',
    email: 'sarah.cohen@example.com',
    loyaltyTier: 'gold',
    points: 5250,
    lifetimePoints: 5250,
    preferences: {
      favoriteCategories: ['dairy-alternatives', 'prepared-foods'],
      shoppingFrequency: 'weekly',
      dietaryRestrictions: ['vegan', 'gluten-free']
    }
  };

  const simulateQRScan = async () => {
    setSimulatedScan(true);
    
    // Simulate QR scan analysis
    const scanData = {
      customerId: demoCustomer.id,
      timestamp: new Date().toISOString(),
      location: 'Village Store - Main Entrance',
      vendorId: 'vop-shop'
    };

    try {
      const response = await fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: demoCustomer.id,
          scanData
        })
      });

      const data = await response.json();
      
      toast({
        title: "QR Scan Analyzed!",
        description: data.analysis?.insights?.[0] || "Pattern recognized successfully",
      });

      // Show personalized greeting
      setTimeout(() => {
        toast({
          title: `Welcome back, ${demoCustomer.name}!`,
          description: "Your personalized recommendations are ready",
        });
      }, 1500);
    } catch (error) {
      console.error('Scan simulation error:', error);
    }

    setTimeout(() => setSimulatedScan(false), 3000);
  };

  const features = [
    {
      icon: '🧠',
      title: 'Behavioral Analysis',
      description: 'AI learns from shopping patterns, QR scans, and preferences',
      details: [
        'Purchase history analysis',
        'Scan location tracking',
        'Time pattern recognition',
        'Category preferences'
      ]
    },
    {
      icon: '🎯',
      title: 'Smart Predictions',
      description: 'Anticipate customer needs before they do',
      details: [
        'Next purchase date prediction',
        'Likely product categories',
        'Churn risk assessment',
        'Lifetime value calculation'
      ]
    },
    {
      icon: '💡',
      title: 'Personalized Insights',
      description: 'Actionable recommendations for each customer',
      details: [
        'Product recommendations',
        'Timing suggestions',
        'Vendor preferences',
        'Price range optimization'
      ]
    },
    {
      icon: '📈',
      title: 'Real-time Adaptation',
      description: 'Continuously learns and improves recommendations',
      details: [
        'QR scan pattern analysis',
        'Seasonal adjustments',
        'Trend detection',
        'Preference evolution'
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <i className="fas fa-arrow-left" />
              Back to Demos
            </Link>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              AI-Powered Personalization
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience how our AI analyzes QR scan data and shopping patterns
              to deliver hyper-personalized shopping experiences
            </p>
          </motion.div>

          {/* Demo Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              {(['overview', 'live-demo', 'technical'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDemo(tab)}
                  className={`px-6 py-3 rounded-md font-semibold transition-all capitalize ${
                    activeDemo === tab
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'live-demo' ? 'Live Demo' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeDemo === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <i className="fas fa-check-circle text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                  How AI Personalization Works
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-qrcode text-green-600 text-2xl" />
                    </div>
                    <h4 className="font-semibold mb-2">1. QR Scan</h4>
                    <p className="text-sm text-gray-600">
                      Customer scans QR code at vendor location
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-database text-blue-600 text-2xl" />
                    </div>
                    <h4 className="font-semibold mb-2">2. Data Collection</h4>
                    <p className="text-sm text-gray-600">
                      System captures location, time, and context
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-brain text-purple-600 text-2xl" />
                    </div>
                    <h4 className="font-semibold mb-2">3. AI Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Machine learning processes patterns
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-magic text-orange-600 text-2xl" />
                    </div>
                    <h4 className="font-semibold mb-2">4. Personalization</h4>
                    <p className="text-sm text-gray-600">
                      Delivers tailored recommendations
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                  <p className="text-gray-700 font-medium">Higher Engagement</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customers interact more with personalized content
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3.5x</div>
                  <p className="text-gray-700 font-medium">Purchase Frequency</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Personalized reminders increase repeat purchases
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                  <p className="text-gray-700 font-medium">Satisfaction Rate</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customers love relevant recommendations
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Demo Tab */}
          {activeDemo === 'live-demo' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* QR Scan Simulation */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                    Simulate QR Scan
                  </h3>
                  
                  <div className="text-center mb-6">
                    <CustomerQRCode 
                      profile={demoCustomer}
                      variant="compact"
                    />
                  </div>
                  
                  <button
                    onClick={simulateQRScan}
                    disabled={simulatedScan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      simulatedScan
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {simulatedScan ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        Analyzing Pattern...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-qrcode" />
                        Simulate Vendor Scan
                      </>
                    )}
                  </button>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">What Happens:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vendor scans customer QR code</li>
                      <li>• AI analyzes scan context and timing</li>
                      <li>• Pattern recognition identifies behavior</li>
                      <li>• Personalized insights generated instantly</li>
                    </ul>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                    Demo Customer Profile
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Name</span>
                      <p className="font-semibold">{demoCustomer.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Loyalty Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                          {demoCustomer.loyaltyTier} Tier
                        </span>
                        <span className="text-sm">{demoCustomer.points} points</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Dietary Preferences</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {demoCustomer.preferences.dietaryRestrictions.map((diet) => (
                          <span key={diet} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Shopping Pattern</span>
                      <p className="font-medium capitalize">{demoCustomer.preferences.shoppingFrequency}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Favorite Categories</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {demoCustomer.preferences.favoriteCategories.map((cat) => (
                          <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {cat.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Shopping Component */}
              <div className="mt-8">
                <PersonalizedShopping 
                  customerId={demoCustomer.id}
                  customerName={demoCustomer.name}
                />
              </div>
            </motion.div>
          )}

          {/* Technical Tab */}
          {activeDemo === 'technical' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Technical Implementation
                </h2>
                
                <div className="space-y-8">
                  {/* Architecture */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">System Architecture</h3>
                    <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
                      <pre>{`PersonalizationService
├── analyzeCustomerBehavior()
│   ├── QR scan history analysis
│   ├── Order pattern recognition
│   └── Preference extraction
├── generatePersonalizedRecommendations()
│   ├── Product matching
│   ├── Timing predictions
│   └── Confidence scoring
├── predictNextPurchase()
│   ├── Frequency calculation
│   ├── Pattern matching
│   └── Date prediction
└── analyzeQRScanPattern()
    ├── Location analysis
    ├── Time pattern detection
    └── Behavior insights`}</pre>
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Data Flow</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">QR Scan Event</h4>
                          <p className="text-sm text-gray-600">
                            Customer QR code scanned at vendor location with timestamp and context
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Data Processing</h4>
                          <p className="text-sm text-gray-600">
                            Supabase stores scan data, triggers real-time analysis
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">AI Analysis</h4>
                          <p className="text-sm text-gray-600">
                            Machine learning algorithms process patterns and generate insights
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Personalization Delivery</h4>
                          <p className="text-sm text-gray-600">
                            Real-time recommendations served through API endpoints
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Endpoints */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">GET</span>
                        <span>/api/personalization?customerId=X&type=profile</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">GET</span>
                        <span>/api/personalization?customerId=X&type=recommendations</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">GET</span>
                        <span>/api/personalization?customerId=X&type=predictions</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">POST</span>
                        <span>/api/personalization - Analyze QR scan pattern</span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Data Protection</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Encrypted at rest and in transit</li>
                          <li>• GDPR compliant data handling</li>
                          <li>• User consent management</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Ethical AI</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Transparent recommendations</li>
                          <li>• No dark patterns</li>
                          <li>• User control over data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Try It CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Personalize Your Shopping?</h3>
              <p className="text-lg mb-6 opacity-90">
                Join KFAR and experience AI-powered personalization tailored just for you
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/onboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <i className="fas fa-user-plus" />
                  Create Your Profile
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
                >
                  <i className="fas fa-play" />
                  More Demos
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}