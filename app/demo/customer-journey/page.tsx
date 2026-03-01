'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Brain, QrCode, ShoppingBasket, Percent, CheckCircle, Star, Shield, AlertTriangle, Check, Coins, History, RotateCw, Loader } from 'lucide-react';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import CustomerQRScanner from '@/components/vendor/CustomerQRScanner';
import { useAuth } from '@/lib/context/AuthContext';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  loyaltyTier: string;
  points: number;
  preferences: {
    dietary: string[];
    allergies: string[];
    favoriteCategories: string[];
  };
  avatar: string;
  memberSince: string;
  stats: {
    totalOrders: number;
    totalSpent: number;
    savedByDiscounts: number;
  };
}

export default function CustomerJourneyDemo() {
  const { accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [showScanResult, setShowScanResult] = useState(false);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch('/api/admin/crm/customers?limit=6', { headers });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.customers || []).map((c: any) => ({
            id: c.id,
            name: c.name || 'Customer',
            email: c.email || '',
            phone: c.phone || '',
            description: `A valued KFAR marketplace ${c.loyalty_tier || 'bronze'} member`,
            loyaltyTier: c.loyalty_tier || 'bronze',
            points: c.points || 0,
            preferences: {
              dietary: c.preferences?.dietary || [],
              allergies: c.preferences?.allergies || [],
              favoriteCategories: c.preferences?.favoriteCategories || [],
            },
            avatar: '',
            memberSince: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
            stats: {
              totalOrders: c.total_orders || 0,
              totalSpent: c.total_spent || 0,
              savedByDiscounts: 0,
            },
          }));
          setCustomers(mapped);
        }
      } catch {
        // Silently fail - demo page
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, [accessToken]);

  const customerProfile = customers[selectedCustomer] || {
    id: 'none',
    name: 'No Customer Data',
    email: '',
    phone: '',
    description: 'No customers in database yet',
    loyaltyTier: 'bronze',
    points: 0,
    preferences: { dietary: [], allergies: [], favoriteCategories: [] },
    avatar: '',
    memberSince: 'N/A',
    stats: { totalOrders: 0, totalSpent: 0, savedByDiscounts: 0 },
  };

  const journeySteps = [
    {
      title: 'AI Profile Analysis',
      description: 'Customer avatar is analyzed using Vision AI to create personalized profile',
      icon: <Brain className="w-7 h-7 stroke-[1.5]" />
    },
    {
      title: 'QR Code Generation',
      description: 'Unique QR code created with embedded profile data and preferences',
      icon: <QrCode className="w-7 h-7 stroke-[1.5]" />
    },
    {
      title: 'Shopping Experience',
      description: 'Customer shops at KFAR marketplace with personalized recommendations',
      icon: <ShoppingBasket className="w-7 h-7 stroke-[1.5]" />
    },
    {
      title: 'Vendor Scan & Benefits',
      description: 'Vendor scans QR to apply discounts and see customer preferences',
      icon: <Percent className="w-7 h-7 stroke-[1.5]" />
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
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
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
                    {step.icon}
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
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 stroke-[1.5] animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Loading customers...</span>
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No customers in database yet.</p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {customers.map((profile, index) => (
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
                          <div className="w-full h-32 flex items-center justify-center text-4xl font-bold text-white"
                            style={{ backgroundColor: profile.loyaltyTier === 'platinum' ? '#7c3aed' : profile.loyaltyTier === 'gold' ? '#d4a017' : profile.loyaltyTier === 'silver' ? '#8e8e8e' : '#CD7F32' }}>
                            {profile.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="p-2 text-center">
                            <p className="text-sm font-semibold">{profile.name}</p>
                            <p className="text-xs text-gray-600 capitalize">{profile.loyaltyTier}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Analysis Results</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: customerProfile.loyaltyTier === 'platinum' ? '#7c3aed' : customerProfile.loyaltyTier === 'gold' ? '#d4a017' : customerProfile.loyaltyTier === 'silver' ? '#8e8e8e' : '#CD7F32' }}>
                          {customerProfile.name.charAt(0).toUpperCase()}
                        </div>
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
                    <ArrowRight className="w-4 h-4 stroke-[1.5] ml-2 inline-block" />
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
                        <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500" />
                        <span>Encrypted for security</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500" />
                        <span>Works offline</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500" />
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
                    <ArrowRight className="w-4 h-4 stroke-[1.5] ml-2 inline-block" />
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
                    <Star className="w-8 h-8 stroke-[1.5] mb-3" style={{ color: '#f6af0d' }} />
                    <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
                    <p className="text-sm text-gray-600">
                      Based on {customerProfile.name}'s preferences for{' '}
                      {customerProfile.preferences.favoriteCategories.slice(0, 2).join(' and ')}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <Percent className="w-8 h-8 stroke-[1.5] mb-3" style={{ color: '#c23c09' }} />
                    <h3 className="font-semibold mb-2">Automatic Discounts</h3>
                    <p className="text-sm text-gray-600">
                      {customerProfile.loyaltyTier === 'platinum' ? '20%' :
                       customerProfile.loyaltyTier === 'gold' ? '15%' :
                       customerProfile.loyaltyTier === 'silver' ? '10%' : '5%'} off
                      as a {customerProfile.loyaltyTier} member
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <Shield className="w-8 h-8 stroke-[1.5] mb-3" style={{ color: '#7c3aed' }} />
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
                      <QrCode className="w-5 h-5 stroke-[1.5] mr-2 inline-block" />
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
                          <Check className="w-7 h-7 stroke-[1.5]" />
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
                            <AlertTriangle className="w-4 h-4 stroke-[1.5] mr-2 inline-block" />
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
                        <CheckCircle className="w-5 h-5 stroke-[1.5] text-green-500 mb-2" />
                        <h4 className="font-semibold">Loyalty Discount Applied</h4>
                        <p className="text-sm text-gray-600">
                          {customerProfile.loyaltyTier === 'platinum' ? '20%' :
                           customerProfile.loyaltyTier === 'gold' ? '15%' :
                           customerProfile.loyaltyTier === 'silver' ? '10%' : '5%'} discount
                          automatically applied
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <Coins className="w-5 h-5 stroke-[1.5] text-blue-500 mb-2" />
                        <h4 className="font-semibold">Points Earned</h4>
                        <p className="text-sm text-gray-600">
                          +{Math.floor(125 * 0.85)} points added to account
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <History className="w-5 h-5 stroke-[1.5] text-purple-500 mb-2" />
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
                        <RotateCw className="w-4 h-4 stroke-[1.5] mr-2 inline-block" />
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