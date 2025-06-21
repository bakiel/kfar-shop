'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import QRNFCAnimation from '@/components/ui/QRNFCAnimation';
import { FaQrcode, FaWifi, FaMobileAlt, FaShieldAlt, FaRocket, FaUsers, FaLightbulb, FaChevronDown } from 'react-icons/fa';

export default function QRNFCInfoPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <Layout>
      <div style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section with Community Background */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/images/backgrounds/2.jpg')`,
                backgroundAttachment: 'fixed'
              }}
            />
            {/* Multi-layer Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-[#fef9ef]/90 to-white/95" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#478c0b]/10 via-transparent to-[#f6af0d]/10" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div>
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 mx-auto shadow-xl" 
                     style={{ backgroundColor: '#478c0b' }}>
                  <FaQrcode className="text-4xl text-white" />
                  <FaWifi className="text-4xl text-white -ml-2" />
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Smart Technology for Our Community
                </h1>
                
                <p className="text-xl md:text-2xl mb-8" style={{ color: '#3a3a1d' }}>
                  QR Codes & NFC: Making Village of Peace marketplace more accessible
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/demo/qr-nfc"
                    className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <FaRocket className="inline mr-2" />
                    Try Live Demo
                  </Link>
                  <Link 
                    href="#how-it-works"
                    className="px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: '#f6af0d', color: 'white' }}
                  >
                    <FaLightbulb className="inline mr-2" />
                    Learn How It Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Summary Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
                Technology That Serves Our Values
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* QR Codes */}
                <div className="bg-gradient-to-br from-[#cfe7c1]/20 to-[#478c0b]/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-md"
                       style={{ backgroundColor: '#478c0b' }}>
                    <FaQrcode className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>QR Codes</h3>
                  <p className="text-gray-600 mb-4">
                    Universal access technology that works on any smartphone. Perfect for payments, 
                    product info, and order tracking.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#478c0b' }}>✓</span>
                      <span>Works on all phones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#478c0b' }}>✓</span>
                      <span>No app needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#478c0b' }}>✓</span>
                      <span>Secure & encrypted</span>
                    </li>
                  </ul>
                </div>

                {/* NFC */}
                <div className="bg-gradient-to-br from-[#f6af0d]/20 to-[#c23c09]/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-md"
                       style={{ backgroundColor: '#f6af0d' }}>
                    <FaWifi className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>NFC Tags</h3>
                  <p className="text-gray-600 mb-4">
                    Tap-and-go technology for instant interactions. Premium experience for 
                    modern devices.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f6af0d' }}>✓</span>
                      <span>Instant tap access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f6af0d' }}>✓</span>
                      <span>Contactless payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#f6af0d' }}>✓</span>
                      <span>Smart authentication</span>
                    </li>
                  </ul>
                </div>

                {/* AI Integration */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-md"
                       style={{ backgroundColor: '#c23c09' }}>
                    <FaLightbulb className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>AI Enhanced</h3>
                  <p className="text-gray-600 mb-4">
                    Smart features powered by AI make our marketplace more intuitive and helpful.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c23c09' }}>✓</span>
                      <span>Smart product search</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c23c09' }}>✓</span>
                      <span>Vision analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c23c09' }}>✓</span>
                      <span>Multi-language support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Animation Demo */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <QRNFCAnimation />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
                How It Works in KiFar Marketplace
              </h2>

              {/* QR Code Uses */}
              <div className="mb-12">
                <div 
                  className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer"
                  onClick={() => toggleSection('qr-uses')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#478c0b' }}>
                      <FaQrcode />
                      QR Code Applications
                    </h3>
                    <FaChevronDown 
                      className={`text-xl transition-transform ${activeSection === 'qr-uses' ? 'rotate-180' : ''}`}
                      style={{ color: '#478c0b' }}
                    />
                  </div>
                  
                  {activeSection === 'qr-uses' && (
                    <div className="mt-6 space-y-6">
                      {/* Payment QR */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#478c0b' }}>
                        <h4 className="font-semibold text-lg mb-2">Payment Processing</h4>
                        <p className="text-gray-600 mb-3">
                          Generate secure payment QR codes at checkout that work with all Israeli banks 
                          and international payment systems.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-mono">Example: Order #KFAR-2024-001</p>
                          <p className="text-sm text-gray-600">Amount: ₪125.00 | Expires: 5 minutes</p>
                        </div>
                      </div>

                      {/* Product QR */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#f6af0d' }}>
                        <h4 className="font-semibold text-lg mb-2">Product Information</h4>
                        <p className="text-gray-600 mb-3">
                          Every product has a QR code for instant mobile access. Scan to view details, 
                          add to cart, or share with friends.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm">✓ Nutrition facts & ingredients</p>
                          <p className="text-sm">✓ Cultural significance</p>
                          <p className="text-sm">✓ Vendor story</p>
                        </div>
                      </div>

                      {/* Order Tracking */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#c23c09' }}>
                        <h4 className="font-semibold text-lg mb-2">Order Management</h4>
                        <p className="text-gray-600 mb-3">
                          Track orders, verify pickups, and manage returns with QR codes that update 
                          in real-time.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm">📦 Preparing → 🚚 Shipping → ✅ Delivered</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NFC Uses */}
              <div className="mb-12">
                <div 
                  className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer"
                  onClick={() => toggleSection('nfc-uses')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#f6af0d' }}>
                      <FaWifi />
                      NFC Tag Features
                    </h3>
                    <FaChevronDown 
                      className={`text-xl transition-transform ${activeSection === 'nfc-uses' ? 'rotate-180' : ''}`}
                      style={{ color: '#f6af0d' }}
                    />
                  </div>
                  
                  {activeSection === 'nfc-uses' && (
                    <div className="mt-6 space-y-6">
                      {/* Tap to Pay */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#478c0b' }}>
                        <h4 className="font-semibold text-lg mb-2">Tap-to-Pay</h4>
                        <p className="text-gray-600 mb-3">
                          Use your NFC-enabled phone or Braysheet card to pay instantly at vendor 
                          locations. No scanning needed.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>💳 Tap</span>
                          <span>→</span>
                          <span>✅ Paid</span>
                          <span className="text-green-600 font-semibold">&lt; 1 second</span>
                        </div>
                      </div>

                      {/* Smart Products */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#f6af0d' }}>
                        <h4 className="font-semibold text-lg mb-2">Smart Product Tags</h4>
                        <p className="text-gray-600 mb-3">
                          Premium products include NFC tags with complete transparency: farm source, 
                          harvest date, certifications, and more.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm">🌱 Organic Certified</p>
                          <p className="text-sm">🏭 Teva Deli Factory</p>
                          <p className="text-sm">📅 Made: Today</p>
                        </div>
                      </div>

                      {/* Collection Points */}
                      <div className="border-l-4 pl-6" style={{ borderColor: '#c23c09' }}>
                        <h4 className="font-semibold text-lg mb-2">Smart Lockers</h4>
                        <p className="text-gray-600 mb-3">
                          Tap your phone on collection lockers to instantly open your assigned 
                          compartment. No codes to remember.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm">
                          <p>📱 Tap phone → 🔓 Locker opens → 📦 Collect order</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Features */}
              <div className="mb-12">
                <div 
                  className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer"
                  onClick={() => toggleSection('security')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#c23c09' }}>
                      <FaShieldAlt />
                      Security & Privacy
                    </h3>
                    <FaChevronDown 
                      className={`text-xl transition-transform ${activeSection === 'security' ? 'rotate-180' : ''}`}
                      style={{ color: '#c23c09' }}
                    />
                  </div>
                  
                  {activeSection === 'security' && (
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Data Protection</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>🔐 End-to-end encryption</li>
                          <li>🔑 Digital signatures on all QR codes</li>
                          <li>⏱️ Time-based expiration for payments</li>
                          <li>🔒 Password-protected NFC writes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Privacy First</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>👤 No personal data in QR codes</li>
                          <li>🏠 Local processing when possible</li>
                          <li>🚫 No tracking without consent</li>
                          <li>✅ GDPR compliant</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
                Benefits for Our Community
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* For Customers */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{ backgroundColor: '#478c0b' }}>
                    <FaMobileAlt className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>For Customers</h3>
                  <ul className="text-left space-y-2 text-gray-600">
                    <li>• Faster checkout process</li>
                    <li>• Easy order tracking</li>
                    <li>• Save favorite products</li>
                    <li>• Access on any device</li>
                    <li>• Secure payments</li>
                  </ul>
                </div>

                {/* For Vendors */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{ backgroundColor: '#f6af0d' }}>
                    <FaRocket className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>For Vendors</h3>
                  <ul className="text-left space-y-2 text-gray-600">
                    <li>• Reduced transaction fees</li>
                    <li>• Inventory tracking</li>
                    <li>• Customer insights</li>
                    <li>• Marketing tools</li>
                    <li>• Automated processes</li>
                  </ul>
                </div>

                {/* For Community */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{ backgroundColor: '#c23c09' }}>
                    <FaUsers className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#3a3a1d' }}>For Community</h3>
                  <ul className="text-left space-y-2 text-gray-600">
                    <li>• Supports local economy</li>
                    <li>• Reduces contact needs</li>
                    <li>• Eco-friendly (less paper)</li>
                    <li>• Inclusive technology</li>
                    <li>• Preserves traditions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8" style={{ color: '#3a3a1d' }}>
                Ready to Experience Smart Shopping?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>
                    For Shoppers
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start using QR codes today - no app download needed!
                  </p>
                  <Link 
                    href="/marketplace"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Browse Marketplace
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#f6af0d' }}>
                    For Vendors
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get QR & NFC tools for your business
                  </p>
                  <Link 
                    href="/vendors"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#f6af0d' }}
                  >
                    Join as Vendor
                  </Link>
                </div>
              </div>

              {/* Support Links */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Need help getting started?</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/support" className="text-blue-600 hover:underline">
                    Visit Support Center
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link href="/demo/qr-nfc" className="text-blue-600 hover:underline">
                    Try Interactive Demo
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Message */}
        <section className="py-16 text-white" style={{ backgroundColor: '#3a3a1d' }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Technology with Heart
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8 opacity-90">
              At Village of Peace, we embrace technology that enhances human connection, 
              not replaces it. Our QR & NFC systems are designed to make transactions 
              smoother so you can focus on what matters - community, quality, and tradition.
            </p>
            <p className="text-2xl font-bold">
              יה חי! HalleluYah!
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}