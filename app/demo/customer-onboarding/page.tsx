'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import OnboardingFlow from '@/components/customer/OnboardingFlow';
import CustomerQRCode from '@/components/customer/CustomerQRCode';

export default function CustomerOnboardingDemo() {
  const [showFlow, setShowFlow] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<any>(null);

  const handleOnboardingComplete = (profile: any) => {
    setCompletedProfile(profile);
    setShowFlow(false);
  };

  const features = [
    {
      step: 1,
      title: 'Personal Information',
      description: 'Basic details and optional profile photo',
      icon: '👤',
      details: [
        'Name and email registration',
        'Optional phone number',
        'AI-analyzed profile photo',
        'Secure data handling'
      ]
    },
    {
      step: 2,
      title: 'Dietary Preferences',
      description: 'Customize your shopping experience',
      icon: '🥗',
      details: [
        'Vegan, gluten-free, organic options',
        'Shopping frequency preferences',
        'Allergen tracking',
        'Personalized recommendations'
      ]
    },
    {
      step: 3,
      title: 'Location & Settings',
      description: 'Final touches for your profile',
      icon: '📍',
      details: [
        'Delivery location selection',
        'Language preferences',
        'Marketing consent options',
        'Notification settings'
      ]
    },
    {
      step: 4,
      title: 'QR Code Generation',
      description: 'Your digital identity for seamless shopping',
      icon: '🎯',
      details: [
        'Unique QR code creation',
        '100 welcome bonus points',
        'Instant loyalty tier assignment',
        'Ready to shop immediately'
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
              Customer Onboarding Flow
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our seamless registration process with automatic QR code generation
              and personalized profile creation
            </p>
          </motion.div>

          {!showFlow && !completedProfile && (
            <>
              {/* Flow Overview */}
              <div className="max-w-5xl mx-auto mb-12">
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
                  Onboarding Journey
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Connection Line */}
                      {index < features.length - 1 && (
                        <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-300 -z-10" />
                      )}
                      
                      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                        <div className="text-center mb-4">
                          <span className="inline-block w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold">
                            {feature.step}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                        
                        <ul className="space-y-1">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                              <i className="fas fa-check text-green-500 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                    Why Our Onboarding Works
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-rocket text-green-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Quick & Easy</h4>
                        <p className="text-sm text-gray-600">
                          Complete registration in under 2 minutes with our intuitive step-by-step process
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-shield-alt text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Secure & Private</h4>
                        <p className="text-sm text-gray-600">
                          Your data is encrypted and protected with enterprise-grade security
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-magic text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">AI-Enhanced</h4>
                        <p className="text-sm text-gray-600">
                          Vision AI analyzes profile photos for enhanced personalization
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-gift text-orange-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Instant Rewards</h4>
                        <p className="text-sm text-gray-600">
                          Get 100 welcome points immediately upon completion
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Try It Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <button
                  onClick={() => setShowFlow(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
                >
                  <i className="fas fa-play-circle text-2xl" />
                  Try the Onboarding Flow
                </button>
                
                <p className="mt-4 text-sm text-gray-600">
                  Experience the complete registration process
                </p>
              </motion.div>
            </>
          )}

          {/* Onboarding Flow */}
          {showFlow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <OnboardingFlow 
                onComplete={handleOnboardingComplete}
                className="mb-8"
              />
              
              <div className="text-center">
                <button
                  onClick={() => setShowFlow(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <i className="fas fa-times mr-2" />
                  Cancel Demo
                </button>
              </div>
            </motion.div>
          )}

          {/* Completed Profile Display */}
          {completedProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                  Registration Complete! 🎉
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Profile Summary */}
                  <div>
                    <h3 className="font-semibold mb-4">Profile Summary</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <p className="font-medium">{completedProfile.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">{completedProfile.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">{completedProfile.location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Dietary Preferences:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {completedProfile.dietary_restrictions?.map((diet: string) => (
                            <span key={diet} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {diet}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Loyalty Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Bronze Tier
                          </span>
                          <span className="text-sm">100 points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div>
                    <h3 className="font-semibold mb-4 text-center">Your QR Code</h3>
                    <CustomerQRCode 
                      profile={completedProfile}
                      variant="full"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <button
                  onClick={() => {
                    setCompletedProfile(null);
                    setShowFlow(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start New Demo
                </button>
                
                <div className="text-sm text-gray-600">
                  <p>In a real scenario, the user would be redirected to their dashboard</p>
                  <Link href="/customer/dashboard" className="text-green-600 hover:text-green-700 font-medium">
                    View Customer Dashboard →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Technical Details */}
          {!showFlow && !completedProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-4xl mx-auto mt-16"
            >
              <div className="bg-gray-100 rounded-2xl p-8">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Technical Implementation
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Frontend Features</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Multi-step form with validation</li>
                      <li>• Real-time progress tracking</li>
                      <li>• Image upload with preview</li>
                      <li>• Responsive design for all devices</li>
                      <li>• Smooth animations with Framer Motion</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Backend Integration</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Supabase authentication</li>
                      <li>• Vision AI for avatar analysis</li>
                      <li>• Automatic QR code generation</li>
                      <li>• Points system initialization</li>
                      <li>• Real-time database updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}