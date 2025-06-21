'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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

// Dynamic imports to prevent SSR issues
const Link = dynamic(() => import('next/link').then(mod => mod.default), { ssr: false });
const InteractiveAIDemo = dynamic(() => import('@/components/vendor/InteractiveAIDemo'), { ssr: false });
const CostSavingsCalculator = dynamic(() => import('@/components/vendor/CostSavingsCalculator'), { ssr: false });

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
      description: 'Auto-generate descriptions, detect ingredients, and optimize listings'
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Smart QR Marketing',
      description: 'Instant store access with QR codes for packaging and promotions'
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: 'Beautiful Store Pages',
      description: 'Professional storefront with customizable themes and layouts'
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Track sales, visitors, and product performance instantly'
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: 'Hebrew Translation',
      description: 'Reach more customers with AI-powered Hebrew translations'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Fair Pricing Guide',
      description: 'AI suggests competitive prices based on market data'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'VOP Compliance',
      description: 'Automatic verification for Village of Peace dietary standards'
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Inventory Management',
      description: 'Track stock levels and get low inventory alerts'
    }
  ];

  const steps = [
    { number: '1', title: 'Basic Information', time: '5 minutes', description: 'Store name, category, and contact details' },
    { number: '2', title: 'Upload Products', time: 'AI Assisted', description: 'AI analyzes and enhances your product listings' },
    { number: '3', title: 'Customize Store', time: '10 minutes', description: 'Choose theme and arrange your storefront' },
    { number: '4', title: 'Go Live!', time: 'Instant', description: 'Your store is ready for customers' }
  ];

  const testimonials = [
    {
      name: 'Teva Deli',
      owner: 'Sarah Cohen',
      text: 'The AI saved us hours every week. Our product descriptions are now perfect in both English and Hebrew!',
      growth: '+65% sales'
    },
    {
      name: "Queen's Cuisine",
      owner: 'Michael Levy',
      text: 'QR codes on our packaging brought in 40% more customers. Game changer for our catering business.',
      growth: '+40% customers'
    },
    {
      name: 'Garden of Light',
      owner: 'Rachel Green',
      text: 'Setting up our store took just 30 minutes. The AI understood our products perfectly.',
      growth: '2 hours saved/week'
    }
  ];

  return (
    <div className="min-h-screen bg-cream-base">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-leaf-green/10 via-transparent to-sun-gold/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Join the Village of Peace Marketplace
            </h1>
            <p className="text-2xl mb-8 text-gray-700">
              Grow Your Business with AI-Powered Tools
            </p>
            <p className="text-lg mb-10 text-gray-600 max-w-2xl mx-auto">
              Transform your store with intelligent product management, automated marketing, and a supportive community of over 50 successful vendors.
            </p>
            
            {Link && (
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center gap-3 px-8 py-4 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#c23c09' }}
              >
                Start Your Store Today
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
            
            <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#478c0b' }} />
                Free to start
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#478c0b' }} />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#478c0b' }} />
                AI assistance included
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive AI Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {InteractiveAIDemo && <InteractiveAIDemo />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cost Savings Calculator Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {CostSavingsCalculator && <CostSavingsCalculator />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools designed for Village of Peace vendors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#f6af0d20', color: '#f6af0d' }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Savings Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Calculate Your Savings
              </h2>
              <p className="text-xl text-gray-600">
                See how much time and money you'll save with AI assistance
              </p>
            </motion.div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                    Products Added Per Week
                  </label>
                  <input
                    type="number"
                    value={savingsCalculator.productsPerWeek}
                    onChange={(e) => setSavingsCalculator({
                      ...savingsCalculator,
                      productsPerWeek: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#478c0b40', focusRingColor: '#478c0b' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                    Hours Per Product (Manual)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={savingsCalculator.hoursPerProduct}
                    onChange={(e) => setSavingsCalculator({
                      ...savingsCalculator,
                      hoursPerProduct: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#478c0b40', focusRingColor: '#478c0b' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                    Monthly Marketing Budget (₪)
                  </label>
                  <input
                    type="number"
                    value={savingsCalculator.marketingBudget}
                    onChange={(e) => setSavingsCalculator({
                      ...savingsCalculator,
                      marketingBudget: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#478c0b40', focusRingColor: '#478c0b' }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: '#478c0b' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#478c0b' }}>
                    {savings.hoursSaved}
                  </div>
                  <p className="text-gray-600">Hours Saved Annually</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <DollarSign className="w-10 h-10 mx-auto mb-3" style={{ color: '#f6af0d' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#f6af0d' }}>
                    ₪{savings.moneySaved.toLocaleString()}
                  </div>
                  <p className="text-gray-600">Marketing Costs Reduced</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: '#c23c09' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#c23c09' }}>
                    +{savings.revenueBoost}%
                  </div>
                  <p className="text-gray-600">Average Revenue Increase</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Steps */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Your store can be live in less than 30 minutes
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6 mb-8"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-1">{step.description}</p>
                  <span className="text-sm font-medium" style={{ color: '#f6af0d' }}>
                    {step.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            {Link && (
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center gap-3 px-8 py-4 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#c23c09' }}
              >
                Begin Onboarding
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Success Stories from Our Vendors
            </h2>
            <p className="text-xl text-gray-600">
              Join the growing community of successful Village of Peace vendors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.owner}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: '#478c0b20', color: '#478c0b' }}
                >
                  <TrendingUp className="w-4 h-4" />
                  {testimonial.growth}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Is it really free to start?',
                a: 'Yes! There are no upfront costs. We only charge a small commission on successful sales.'
              },
              {
                q: 'How does AI help my store?',
                a: 'AI automatically generates product descriptions, translates to Hebrew, suggests prices, and ensures dietary compliance - saving you hours of work.'
              },
              {
                q: 'What about Hebrew-speaking customers?',
                a: 'All your content is automatically translated to Hebrew, and customers can browse in their preferred language.'
              },
              {
                q: 'Can I manage my store from my phone?',
                a: 'Absolutely! Our vendor dashboard is fully mobile-responsive, so you can manage products, view analytics, and process orders on the go.'
              },
              {
                q: 'How quickly can I start selling?',
                a: 'Most vendors have their store live within 30 minutes of starting the onboarding process.'
              },
              {
                q: 'Do I need technical skills?',
                a: 'Not at all! Our system is designed to be user-friendly, and AI handles the technical aspects for you.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6"
              >
                <h3 className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                  {faq.q}
                </h3>
                <p className="text-gray-700">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-leaf-green to-sun-gold">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the Village of Peace marketplace today and start growing with AI-powered tools
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {Link && (
                <Link
                  href="/vendor/onboarding"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ color: '#478c0b' }}
                >
                  Begin Onboarding
                  <Zap className="w-5 h-5" />
                </Link>
              )}
              
              <button
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur text-white text-lg font-semibold rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                Chat with AI Assistant
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-8 text-white/80 text-sm">
              Questions? Email us at vendors@kfar-marketplace.com or call +972-8-655-7777
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
