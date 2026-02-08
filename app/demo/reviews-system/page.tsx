'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { FaStar, FaCamera, FaGift, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

export default function ReviewsSystemDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'integration'>('overview');
  const [showReviewSubmission, setShowReviewSubmission] = useState(false);

  const features = [
    {
      icon: <FaStar className="text-2xl" />,
      title: 'Star Rating System',
      description: 'Intuitive 5-star rating with detailed breakdown'
    },
    {
      icon: <FaCamera className="text-2xl" />,
      title: 'Photo Reviews',
      description: 'Upload multiple images with reviews for bonus points'
    },
    {
      icon: <FaGift className="text-2xl" />,
      title: 'Points Rewards',
      description: 'Earn 50-150 points based on review quality'
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Verified Purchases',
      description: 'Automatic verification for authentic reviews'
    }
  ];

  const pointsStructure = [
    { type: 'Basic Review', description: 'Rating only', points: 50 },
    { type: 'Detailed Review', description: 'Rating + 50+ character comment', points: 100 },
    { type: 'Photo Review', description: 'Rating + Comment + Photos', points: 150 }
  ];

  const integrationPoints = [
    {
      component: 'Product Pages',
      description: 'Reviews appear directly on product detail pages',
      connected: true
    },
    {
      component: 'Customer Profiles',
      description: 'Reviews linked to customer loyalty tiers',
      connected: true
    },
    {
      component: 'Points System',
      description: 'Automatic points calculation and awarding',
      connected: true
    },
    {
      component: 'Vendor Analytics',
      description: 'Review insights in vendor dashboard',
      connected: true
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
              Connected Reviews & Rewards System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience how customer reviews seamlessly integrate with product pages,
              loyalty programs, and reward points to create a comprehensive feedback ecosystem
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              {(['overview', 'benefits', 'integration'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 text-center"
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: '#cfe7c1' }}
                    >
                      <div style={{ color: '#478c0b' }}>{feature.icon}</div>
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Review Flow Demo */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Review Submission Flow
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#478c0b' }}
                        >
                          <span className="text-white font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Customer Makes Purchase</h4>
                          <p className="text-sm text-gray-600">
                            Order is tracked and verified in the system
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#f6af0d' }}
                        >
                          <span className="text-white font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Review Invitation</h4>
                          <p className="text-sm text-gray-600">
                            Customer receives prompt to review on product page
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#c23c09' }}
                        >
                          <span className="text-white font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Submit Review</h4>
                          <p className="text-sm text-gray-600">
                            Rate, comment, and upload photos for extra points
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#7c3aed' }}
                        >
                          <span className="text-white font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Earn Rewards</h4>
                          <p className="text-sm text-gray-600">
                            Points automatically added to customer account
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowReviewSubmission(true)}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Try Demo Submission
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Image
                      src="/images/review-demo-mockup.jpg"
                      alt="Review System"
                      width={500}
                      height={400}
                      className="rounded-lg shadow-lg"
                      onError={(e) => {
                        const div = document.createElement('div');
                        div.className = 'bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg p-12 text-center';
                        div.innerHTML = '<i class="fas fa-star text-6xl text-yellow-400 mb-4"></i><p class="text-gray-600">Review System Preview</p>';
                        e.currentTarget.parentNode?.replaceChild(div, e.currentTarget);
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Points Structure */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Points Reward Structure
                </h2>
                
                <div className="space-y-4">
                  {pointsStructure.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold">{item.type}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div 
                        className="text-2xl font-bold flex items-center gap-2"
                        style={{ color: '#478c0b' }}
                      >
                        <FaGift />
                        {item.points} pts
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Pro Tip:</strong> Add photos to your reviews to earn maximum points!
                    Each photo adds +20 points to your base reward.
                  </p>
                </div>
              </div>

              {/* Customer Benefits */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Customer Benefits
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-coins text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Earn Valuable Points</h4>
                      <p className="text-sm text-gray-600">
                        Every review contributes to your loyalty tier progression
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-trophy text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Build Reputation</h4>
                      <p className="text-sm text-gray-600">
                        Verified reviewer badge and loyalty tier display
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-users text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Help Community</h4>
                      <p className="text-sm text-gray-600">
                        Share experiences to guide other shoppers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-chart-line text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Track Impact</h4>
                      <p className="text-sm text-gray-600">
                        See how many found your reviews helpful
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Benefits */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Vendor Benefits
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-green-500 text-xl" />
                    <span>Detailed analytics on customer satisfaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-blue-500 text-xl" />
                    <span>Build trust with verified purchase reviews</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-comments text-purple-500 text-xl" />
                    <span>Direct feedback channel from customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-award text-yellow-500 text-xl" />
                    <span>Showcase high ratings to attract new customers</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integration' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  System Integration Points
                </h2>
                
                <div className="space-y-6">
                  {integrationPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            point.connected 
                              ? 'bg-green-100' 
                              : 'bg-gray-100'
                          }`}
                        >
                          <i 
                            className={`fas fa-${point.connected ? 'check' : 'times'} ${
                              point.connected ? 'text-green-600' : 'text-gray-400'
                            }`} 
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{point.component}</h4>
                          <p className="text-sm text-gray-600">{point.description}</p>
                        </div>
                      </div>
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          point.connected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {point.connected ? 'Connected' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-3">API Endpoints</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded">GET</span>
                      <span>/api/reviews?productId={'{id}'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">POST</span>
                      <span>/api/reviews/submit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">POST</span>
                      <span>/api/reviews/{'{id}'}/helpful</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Demo Review Submission */}
          {showReviewSubmission && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Demo Review Submitted!
                </h3>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg font-semibold" style={{ color: '#478c0b' }}>
                    You earned 150 points!
                  </p>
                  <p className="text-gray-600 mt-2">
                    Your review has been connected to the product page
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReviewSubmission(false);
                    toast({
                      title: "Review System Demo",
                      description: "This demonstrates how reviews connect to products and reward customers",
                    });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Awesome!
                </button>
              </motion.div>
            </div>
          )}

          {/* Try It Live CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
              <p className="text-lg mb-6 opacity-90">
                Visit any product page to see the connected review system live
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/product/vegan-shawarma"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <i className="fas fa-shopping-bag" />
                  View Product with Reviews
                </Link>
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
                >
                  <i className="fas fa-user" />
                  Customer Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}