'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import CustomerQRScanner from '@/components/vendor/CustomerQRScanner';
import { ANALYZED_CUSTOMER_PROFILES } from '@/lib/services/customer-avatar-analyzer';

export default function CustomerJourneyDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [showScanResult, setShowScanResult] = useState(false);

  // Convert analyzed profile to full customer profile
  const customerProfile = {
    ...ANALYZED_CUSTOMER_PROFILES[selectedCustomer],
    email: `${ANALYZED_CUSTOMER_PROFILES[selectedCustomer].name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '+972-50-' + Math.floor(Math.random() * 9000000 + 1000000),
    avatar: `/images/customer-onboarding/${ANALYZED_CUSTOMER_PROFILES[selectedCustomer].imageId}.jpg`,
    memberSince: 'Jan 2023',
    stats: {
      totalOrders: 47,
      totalSpent: 2840,
      savedByDiscounts: 426
    }
  };

  const journeySteps = [
    {
      title: 'AI Profile Analysis',
      description: 'Customer avatar is analyzed using Vision AI to create personalized profile',
      icon: 'fa-brain'
    },
    {
      title: 'QR Code Generation',
      description: 'Unique QR code created with embedded profile data and preferences',
      icon: 'fa-qrcode'
    },
    {
      title: 'Shopping Experience',
      description: 'Customer shops at KFAR marketplace with personalized recommendations',
      icon: 'fa-shopping-basket'
    },
    {
      title: 'Vendor Scan & Benefits',
      description: 'Vendor scans QR to apply discounts and see customer preferences',
      icon: 'fa-percentage'
    }
  ];

  const handleMockScan = () => {
    setShowScanResult(true);
    setTimeout(() => {
      setCurrentStep(3);
    }, 1500);
  };

  return (
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
            Customer Journey with AI & QR
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how AI-powered profile analysis and QR codes create a seamless, 
            personalized shopping experience at KFAR marketplace
          </p>
        </motion.div>

        {/* Journey Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {journeySteps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center cursor-pointer ${
                    currentStep === index ? 'scale-110' : ''
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= index
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <i className={`fas ${step.icon} text-2xl`} />
                  </div>
                  <p className="text-sm font-semibold">{step.title}</p>
                </motion.div>
                
                {index < journeySteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all ${
                      currentStep > index ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: AI Profile Analysis */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Step 1: AI-Powered Customer Profile Analysis
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select a Customer Avatar</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {ANALYZED_CUSTOMER_PROFILES.map((profile, index) => (
                        <motion.div
                          key={profile.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                            selectedCustomer === index
                              ? 'border-green-500 shadow-lg'
                              : 'border-gray-300'
                          }`}
                          onClick={() => setSelectedCustomer(index)}
                        >
                          <Image
                            src={`/images/customer-onboarding/${profile.imageId}.jpg`}
                            alt={profile.name}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 text-center">
                            <p className="text-sm font-semibold">{profile.name}</p>
                            <p className="text-xs text-gray-600">{profile.loyaltyTier}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Analysis Results</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Image
                          src={customerProfile.avatar}
                          alt={customerProfile.name}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                        <div>
                          <h4 className="font-bold text-lg">{customerProfile.name}</h4>
                          <p className="text-sm text-gray-600">{customerProfile.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Detected Preferences:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {customerProfile.preferences.favoriteCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-1 bg-white rounded-full text-xs"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {customerProfile.preferences.dietary.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Dietary:</p>
                            <p className="text-sm">{customerProfile.preferences.dietary.join(', ')}</p>
                          </div>
                        )}
                        
                        {customerProfile.preferences.allergies.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Allergies:</p>
                            <p className="text-sm text-red-600">{customerProfile.preferences.allergies.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Generate QR Code
                    <i className="fas fa-arrow-right ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: QR Code Generation */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Step 2: Personalized QR Code Generation
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <CustomerQRCode
                      profile={customerProfile}
                      variant="full"
                      showActions={false}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Embedded Data</h3>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">
{JSON.stringify({
  type: 'customer',
  id: customerProfile.id,
  name: customerProfile.name,
  tier: customerProfile.loyaltyTier,
  points: customerProfile.points,
  preferences: customerProfile.preferences
}, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-check-circle text-green-500" />
                        <span>Encrypted for security</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-check-circle text-green-500" />
                        <span>Works offline</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-check-circle text-green-500" />
                        <span>Updates in real-time</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Start Shopping
                    <i className="fas fa-arrow-right ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Shopping Experience */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Step 3: Personalized Shopping Experience
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <i className="fas fa-star text-3xl mb-3" style={{ color: '#f6af0d' }} />
                    <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
                    <p className="text-sm text-gray-600">
                      Based on {customerProfile.name}'s preferences for{' '}
                      {customerProfile.preferences.favoriteCategories.slice(0, 2).join(' and ')}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <i className="fas fa-percentage text-3xl mb-3" style={{ color: '#c23c09' }} />
                    <h3 className="font-semibold mb-2">Automatic Discounts</h3>
                    <p className="text-sm text-gray-600">
                      {customerProfile.loyaltyTier === 'platinum' ? '20%' :
                       customerProfile.loyaltyTier === 'gold' ? '15%' :
                       customerProfile.loyaltyTier === 'silver' ? '10%' : '5%'} off
                      as a {customerProfile.loyaltyTier} member
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <i className="fas fa-shield-alt text-3xl mb-3" style={{ color: '#7c3aed' }} />
                    <h3 className="font-semibold mb-2">Allergy Protection</h3>
                    <p className="text-sm text-gray-600">
                      {customerProfile.preferences.allergies.length > 0
                        ? `Alerts for ${customerProfile.preferences.allergies.join(', ')}`
                        : 'No allergies detected'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Shopping at Teva Deli</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src="/images/vendors/teva_deli_logo_vegan_factory.jpg"
                        alt="Teva Deli"
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />
                      <div>
                        <p className="font-semibold">Ready to checkout</p>
                        <p className="text-sm text-gray-600">3 items • ₪125</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleMockScan}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      <i className="fas fa-qrcode mr-2" />
                      Present QR Code
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Vendor Scan */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Step 4: Vendor Scans Customer QR
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vendor View</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl">
                          <i className="fas fa-check" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Customer Identified</p>
                          <p className="text-gray-600">{customerProfile.name} - {customerProfile.loyaltyTier} member</p>
                        </div>
                      </div>
                      
                      {/* Customer Preferences Alert */}
                      {(customerProfile.preferences.dietary.length > 0 || customerProfile.preferences.allergies.length > 0) && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">
                            <i className="fas fa-exclamation-triangle mr-2" />
                            Customer Preferences
                          </h4>
                          {customerProfile.preferences.dietary.length > 0 && (
                            <p className="text-sm text-gray-700">
                              <strong>Dietary:</strong> {customerProfile.preferences.dietary.join(', ')}
                            </p>
                          )}
                          {customerProfile.preferences.allergies.length > 0 && (
                            <p className="text-sm text-red-700">
                              <strong>Allergies:</strong> {customerProfile.preferences.allergies.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Transaction Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₪125.00</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>{customerProfile.loyaltyTier} Discount</span>
                          <span>-₪{(125 * (
                            customerProfile.loyaltyTier === 'platinum' ? 0.20 :
                            customerProfile.loyaltyTier === 'gold' ? 0.15 :
                            customerProfile.loyaltyTier === 'silver' ? 0.10 : 0.05
                          )).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₪{(125 * (1 - (
                            customerProfile.loyaltyTier === 'platinum' ? 0.20 :
                            customerProfile.loyaltyTier === 'gold' ? 0.15 :
                            customerProfile.loyaltyTier === 'silver' ? 0.10 : 0.05
                          ))).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Benefits Applied</h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <i className="fas fa-check-circle text-green-500 text-xl mb-2" />
                        <h4 className="font-semibold">Loyalty Discount Applied</h4>
                        <p className="text-sm text-gray-600">
                          {customerProfile.loyaltyTier === 'platinum' ? '20%' :
                           customerProfile.loyaltyTier === 'gold' ? '15%' :
                           customerProfile.loyaltyTier === 'silver' ? '10%' : '5%'} discount
                          automatically applied
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <i className="fas fa-coins text-blue-500 text-xl mb-2" />
                        <h4 className="font-semibold">Points Earned</h4>
                        <p className="text-sm text-gray-600">
                          +{Math.floor(125 * 0.85)} points added to account
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <i className="fas fa-history text-purple-500 text-xl mb-2" />
                        <h4 className="font-semibold">Purchase History Updated</h4>
                        <p className="text-sm text-gray-600">
                          Transaction recorded for future recommendations
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                      >
                        <i className="fas fa-redo mr-2" />
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-green-100 to-yellow-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              The Power of AI + QR Integration
            </h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#478c0b' }}>100%</p>
                <p className="text-sm text-gray-600">Personalized Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#f6af0d' }}>0</p>
                <p className="text-sm text-gray-600">Manual Data Entry</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#c23c09' }}>Instant</p>
                <p className="text-sm text-gray-600">Benefit Application</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>Secure</p>
                <p className="text-sm text-gray-600">Data Protection</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}