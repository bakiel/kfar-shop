'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { 
  Sparkles, 
  QrCode, 
  Store, 
  Clock, 
  DollarSign, 
  Globe, 
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  CheckCircle,
  BarChart,
  Languages,
  Package
} from 'lucide-react';

export default function BecomeAVendorPage() {
  const [savingsCalculator, setSavingsCalculator] = useState({
    productsPerWeek: 10,
    hoursPerProduct: 0.5,
    marketingBudget: 500
  });

  const calculateSavings = () => {
    const hoursSaved = savingsCalculator.productsPerWeek * 0.4; // AI saves 80% of time
    const marketingReduction = savingsCalculator.marketingBudget * 0.7; // 70% reduction
    const revenueIncrease = 40; // 40% average increase
    return {
      hoursSaved: Math.round(hoursSaved * 52), // Annual
      moneySaved: Math.round(marketingReduction * 12), // Annual
      revenueBoost: revenueIncrease
    };
  };

  const savings = calculateSavings();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Product Enhancement',
      description: 'Auto-generate descriptions, detect ingredients, and optimize listings',
      color: '#478c0b' // leaf-green
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Smart QR Marketing',
      description: 'Instant store access with QR codes for packaging and promotions',
      color: '#f6af0d' // sun-gold
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: 'Beautiful Store Pages',
      description: 'Professional storefront with customizable themes and layouts',
      color: '#c23c09' // harvest-red
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Track sales, visitors, and product performance instantly',
      color: '#478c0b'
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: 'Hebrew Translation',
      description: 'Reach more customers with AI-powered Hebrew translations',
      color: '#3a3a1d' // soil-brown
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Fair Pricing Guide',
      description: 'AI suggests competitive prices based on market data',
      color: '#f6af0d'
    }
  ];

  const steps = [
    { number: '1', title: 'Basic Information', time: '5 minutes', description: 'Store name, category, and contact details' },
    { number: '2', title: 'Upload Products', time: 'AI Assisted', description: 'AI analyzes and enhances your product listings' },
    { number: '3', title: 'Customize Store', time: '10 minutes', description: 'Choose theme and arrange your storefront' },
    { number: '4', title: 'Go Live!', time: 'Instant', description: 'Your store is ready for customers' }
  ];

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section with KFAR Branding */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-leaf-green/10 to-sun-gold/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
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
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#478c0b' }} />
                  <span className="font-semibold" style={{ color: '#3a3a1d' }}>AI-Powered Vendor Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Turn Your Products Into a
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #478c0b, #f6af0d)' }}>
                    Thriving Online Business
                  </span>
                </h1>
                
                <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: '#6b7280' }}>
                  Join KFAR Marketplace and let our AI technology transform your products into 
                  professional listings, manage your inventory, and grow your customer base - all in minutes!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/vendor/onboarding">
                    <button className="px-8 py-4 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2" style={{ backgroundColor: '#c23c09' }}>
                      <i className="fas fa-store"></i>
                      Start Your Store Now
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </Link>
                  <Link href="#demo">
                    <button className="px-8 py-4 font-semibold rounded-xl border-2 transition-all duration-300" style={{ borderColor: '#478c0b', color: '#478c0b', backgroundColor: 'white' }}>
                      <i className="fas fa-play-circle mr-2"></i>
                      Watch AI Demo
                    </button>
                  </Link>
                </div>
              </div>

              {/* Village of Peace Badge */}
              <div className="text-center mb-12">
                <p className="text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>Part of the</p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                    <i className="fas fa-leaf text-lg" style={{ color: '#478c0b' }}></i>
                  </div>
                  <div className="text-left">
                    <p className="font-bold" style={{ color: '#3a3a1d' }}>Village of Peace</p>
                    <p className="text-xs" style={{ color: '#f6af0d' }}>Est. 1967</p>
                  </div>
                </div>
              </div>

              {/* Stats with KFAR Colors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#478c0b' }}>30+</div>
                  <div style={{ color: '#6b7280' }}>Active Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#f6af0d' }}>1000+</div>
                  <div style={{ color: '#6b7280' }}>Products Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#c23c09' }}>40%</div>
                  <div style={{ color: '#6b7280' }}>Revenue Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#3a3a1d' }}>4.8★</div>
                  <div style={{ color: '#6b7280' }}>Vendor Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid with KFAR Style */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Everything You Need to Succeed
              </h2>
              <p className="text-xl" style={{ color: '#6b7280' }}>
                Powerful tools designed to help your business thrive in our community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1" style={{ borderTop: `4px solid ${feature.color}` }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}20`, color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works with KFAR Timeline */}
        <section className="py-20" style={{ backgroundColor: '#fef9ef' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Launch Your Store in 4 Simple Steps
              </h2>
              <p className="text-xl" style={{ color: '#6b7280' }}>
                Our AI-powered platform makes it incredibly easy
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 mb-8 last:mb-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#478c0b' }}>
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold" style={{ color: '#3a3a1d' }}>{step.title}</h3>
                      <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#cfe7c1', color: '#478c0b' }}>
                        {step.time}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280' }}>{step.description}</p>
                    {index < steps.length - 1 && (
                      <div className="ml-6 mt-4 mb-4 h-8" style={{ borderLeft: '2px dashed #cfe7c1' }}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/vendor/onboarding">
                <button className="px-8 py-4 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 mx-auto" style={{ backgroundColor: '#478c0b' }}>
                  <i className="fas fa-bolt"></i>
                  Get Started Now - It's Free!
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section with KFAR Gradient */}
        <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #478c0b 0%, #f6af0d 100%)' }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join KFAR Marketplace today and become part of the Village of Peace community. 
              No technical skills needed - our AI handles everything!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vendor/onboarding">
                <button className="px-8 py-4 bg-white font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2" style={{ color: '#478c0b' }}>
                  <i className="fas fa-store"></i>
                  Create Your Store
                </button>
              </Link>
              <Link href="/vendor/login">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white transition-all duration-300 hover:text-soil-brown">
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Vendor Login
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
