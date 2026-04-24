'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import { useMobileDetect } from '@/hooks/useMobileDetect'
import { motion } from 'framer-motion'
import { CheckCircle, QrCode, Mic, Bot, Gift, Store, UserPlus, ArrowRight, TrendingUp, Megaphone, Globe, Star, Headphones } from 'lucide-react'

export default function JoinKFAR() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendor' | 'customer' | 'faq'>('overview')
  const { isMobile } = useMobileDetect()

  const faqItems = [
    {
      question: "What is KFAR Marketplace?",
      answer: "KFAR Marketplace is the digital platform for the Village of Peace community, offering AI-powered shopping, voice ordering, QR payments, and rewards programs for both vendors and customers."
    },
    {
      question: "How do I become a vendor?",
      answer: "Simply click 'Become a Vendor' and fill out the registration form. You'll need business details, verification documents, and can start selling within 24-48 hours after approval."
    },
    {
      question: "What are the benefits of joining as a customer?",
      answer: "Customers get a personal QR code, access to voice shopping in 3 languages, AI recommendations, loyalty rewards (50-200 points per action), and exclusive deals from local vendors."
    },
    {
      question: "Is there a membership fee?",
      answer: "No! Joining as a customer is completely free. Vendors pay a small transaction fee only when they make sales."
    },
    {
      question: "What languages are supported?",
      answer: "KFAR supports English, Hebrew, and Amharic for both the interface and voice shopping features."
    },
    {
      question: "How does the QR code system work?",
      answer: "Each customer gets a unique QR code containing their profile and preferences. Vendors scan it for instant checkout, loyalty points, and personalized offers."
    }
  ]

  return (
    <Layout>
      {/* Hero Section with KFAR Branding */}
      <section className="relative bg-gradient-to-b from-herbal-mint to-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sun-gold rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-leaf-green rounded-full filter blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* KFAR Logo */}
            <div className="mb-8">
              <Image
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR Marketplace"
                width={200}
                height={60}
                className="mx-auto"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Join the KFAR Community
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
              Experience the future of community commerce with AI-powered shopping, 
              voice ordering, and personalized rewards at the Village of Peace
            </p>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {(['overview', 'vendor', 'customer', 'faq'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
                    activeTab === tab
                      ? 'bg-leaf-green text-white shadow-lg'
                      : 'bg-white text-soil-brown hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h2 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                    About KFAR Marketplace
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    KFAR Marketplace is the digital transformation of the Village of Peace, 
                    bringing together traditional African heritage with cutting-edge technology.
                  </p>
                  <p className="text-lg text-gray-700 mb-6">
                    Our platform empowers local vendors with digital tools while providing 
                    customers with a seamless, modern shopping experience that respects our 
                    community values.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                      <span className="text-gray-700">Established in 1967</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                      <span className="text-gray-700">Supporting local entrepreneurs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                      <span className="text-gray-700">Preserving African heritage</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold mb-6" style={{ color: '#478c0b' }}>
                      Platform Features
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4">
                        <QrCode className="w-10 h-10 stroke-[1.5] mb-2 mx-auto" style={{ color: '#f6af0d' }} />
                        <p className="font-semibold">QR Payments</p>
                      </div>
                      <div className="text-center p-4">
                        <Mic className="w-10 h-10 stroke-[1.5] mb-2 mx-auto" style={{ color: '#c23c09' }} />
                        <p className="font-semibold">Voice Shopping</p>
                      </div>
                      <div className="text-center p-4">
                        <Bot className="w-10 h-10 stroke-[1.5] mb-2 mx-auto" style={{ color: '#478c0b' }} />
                        <p className="font-semibold">AI Assistant</p>
                      </div>
                      <div className="text-center p-4">
                        <Gift className="w-10 h-10 stroke-[1.5] mb-2 mx-auto" style={{ color: '#3a3a1d' }} />
                        <p className="font-semibold">Rewards Program</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access CTAs */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Choose Your Path
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/become-a-vendor"
                    className="px-8 py-4 bg-leaf-green text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center"
                  >
                    <Store className="w-5 h-5 stroke-[1.5] mr-2" />
                    Become a Vendor
                  </Link>
                  <Link
                    href="/join-as-customer"
                    className="px-8 py-4 bg-sun-gold text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center"
                  >
                    <UserPlus className="w-5 h-5 stroke-[1.5] mr-2" />
                    Join as Customer
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vendor Tab */}
          {activeTab === 'vendor' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
                Grow Your Business with KFAR
              </h2>
              
              {/* Vendor Benefits */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <QrCode className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#478c0b' }} />
                  <h3 className="font-bold mb-2">QR Payments</h3>
                  <p className="text-sm text-gray-600">Accept instant payments via customer QR codes</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <TrendingUp className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#f6af0d' }} />
                  <h3 className="font-bold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Track sales, views, and customer behavior</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Megaphone className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#c23c09' }} />
                  <h3 className="font-bold mb-2">Custom Banners</h3>
                  <p className="text-sm text-gray-600">6 professional templates for promotions</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Globe className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#3a3a1d' }} />
                  <h3 className="font-bold mb-2">Multi-Language</h3>
                  <p className="text-sm text-gray-600">Reach customers in 3 languages</p>
                </div>
              </div>

              {/* Vendor Steps */}
              <div className="bg-gray-50 rounded-xl p-8 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#478c0b' }}>
                  Start Selling in 4 Simple Steps
                </h3>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-4 gap-8'}`}>
                  {[
                    { step: 1, title: "Register", desc: "Create your vendor account", icon: "fa-user-plus" },
                    { step: 2, title: "Customize", desc: "Set up your digital store", icon: "fa-store" },
                    { step: 3, title: "Add Products", desc: "Upload your inventory", icon: "fa-box" },
                    { step: 4, title: "Go Live", desc: "Start accepting orders", icon: "fa-rocket" }
                  ].map((item, index) => (
                    <div key={index} className={`text-center ${isMobile ? 'flex items-center gap-4' : ''}`}>
                      <div className={`${isMobile ? 'flex-shrink-0' : 'mx-auto mb-4'}`}>
                        <div className="w-16 h-16 rounded-full bg-leaf-green text-white flex items-center justify-center text-2xl font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className={isMobile ? 'text-left' : ''}>
                        <h4 className="font-bold mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link
                  href="/become-a-vendor"
                  className="inline-flex items-center px-8 py-4 bg-leaf-green text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Start Your Digital Store Today
                  <ArrowRight className="w-5 h-5 stroke-[1.5] ml-2" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Customer Tab */}
          {activeTab === 'customer' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
                Shop Smarter with KFAR
              </h2>
              
              {/* Customer Benefits */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <QrCode className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#478c0b' }} />
                  <h3 className="font-bold mb-2">Personal QR</h3>
                  <p className="text-sm text-gray-600">Your unique code for quick checkout</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Mic className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#f6af0d' }} />
                  <h3 className="font-bold mb-2">Voice Shopping</h3>
                  <p className="text-sm text-gray-600">Order in English, Hebrew, or Amharic</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Star className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#c23c09' }} />
                  <h3 className="font-bold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-gray-600">50-200 points per action</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Bot className="w-10 h-10 stroke-[1.5] mb-4 mx-auto" style={{ color: '#3a3a1d' }} />
                  <h3 className="font-bold mb-2">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Personalized recommendations</p>
                </div>
              </div>

              {/* Loyalty Tiers */}
              <div className="bg-gray-50 rounded-xl p-8 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#478c0b' }}>
                  Loyalty Program Tiers
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { tier: "Bronze", points: "0-999", benefits: "5% discount", color: "#CD7F32" },
                    { tier: "Silver", points: "1000-2999", benefits: "10% discount", color: "#C0C0C0" },
                    { tier: "Gold", points: "3000-4999", benefits: "15% discount", color: "#FFD700" },
                    { tier: "Platinum", points: "5000+", benefits: "20% discount", color: "#E5E4E2" }
                  ].map((tier, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-2" 
                        style={{ backgroundColor: tier.color }}
                      ></div>
                      <h4 className="font-bold">{tier.tier}</h4>
                      <p className="text-sm text-gray-600">{tier.points} pts</p>
                      <p className="text-sm font-semibold" style={{ color: '#478c0b' }}>{tier.benefits}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link
                  href="/join-as-customer"
                  className="inline-flex items-center px-8 py-4 bg-sun-gold text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Get Your QR Code Now
                  <ArrowRight className="w-5 h-5 stroke-[1.5] ml-2" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#478c0b' }}>
                      {item.question}
                    </h3>
                    <p className="text-gray-700">{item.answer}</p>
                  </motion.div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="text-center mt-12">
                <p className="text-lg text-gray-700 mb-4">Still have questions?</p>
                <Link
                  href="/support"
                  className="inline-flex items-center px-6 py-3 border-2 border-leaf-green text-leaf-green rounded-full font-semibold hover:bg-leaf-green hover:text-white transition-all"
                >
                  Contact Support
                  <Headphones className="w-5 h-5 stroke-[1.5] ml-2" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 bg-gradient-to-r from-leaf-green to-sun-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join KFAR?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Be part of the Village of Peace digital transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/become-a-vendor"
              className="px-8 py-4 bg-white text-leaf-green rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center"
            >
              <Store className="w-5 h-5 stroke-[1.5] mr-2" />
              Become a Vendor
            </Link>
            <Link
              href="/join-as-customer"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-leaf-green transition-all inline-flex items-center"
            >
              <UserPlus className="w-5 h-5 stroke-[1.5] mr-2" />
              Join as Customer
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Spacing */}
      {isMobile && <div className="h-20"></div>}
    </Layout>
  )
}