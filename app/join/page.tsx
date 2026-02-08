'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { 
  Star, 
  Gift, 
  ShoppingBag, 
  Heart,
  Users,
  Sparkles,
  Trophy,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';

export default function JoinKFARPage() {
  const [selectedBenefit, setSelectedBenefit] = useState(0);

  const benefits = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Exclusive Rewards',
      description: 'Earn points on every purchase and unlock special discounts',
      color: 'sun-gold'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Support Local',
      description: 'Your purchases directly support Village of Peace families',
      color: 'harvest-red'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Connection',
      description: 'Be part of our growing international community',
      color: 'leaf-green'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with industry-standard security',
      color: 'soil-brown'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'Tel Aviv, Israel',
      image: '/images/customer-onboarding/1.jpg',
      quote: 'KFAR Marketplace has connected me to authentic products I can\'t find anywhere else. The rewards program is amazing!',
      rating: 5
    },
    {
      name: 'David L.',
      location: 'New York, USA',
      image: '/images/customer-onboarding/2.jpg',
      quote: 'Supporting the Village of Peace community while getting quality products is a win-win. Love the fast shipping!',
      rating: 5
    },
    {
      name: 'Miriam K.',
      location: 'London, UK',
      image: '/images/customer-onboarding/3.jpg',
      quote: 'The variety of vegan products is incredible. I\'ve discovered so many new favorites through KFAR.',
      rating: 5
    }
  ];

  const steps = [
    { number: '1', title: 'Sign Up', description: 'Create your free account in seconds' },
    { number: '2', title: 'Explore', description: 'Browse unique products from our vendors' },
    { number: '3', title: 'Shop & Save', description: 'Earn rewards with every purchase' },
    { number: '4', title: 'Connect', description: 'Join our community events and offers' }
  ];

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section with KFAR Branding */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-leaf-green/10 via-sun-gold/5 to-harvest-red/10"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-sun-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-leaf-green/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  {/* KFAR Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#cfe7c1' }}>
                    <Sparkles className="w-5 h-5" style={{ color: '#478c0b' }} />
                    <span className="font-semibold" style={{ color: '#3a3a1d' }}>Join the KFAR Family</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                    Welcome to Your
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #478c0b, #f6af0d)' }}>
                      Village Marketplace
                    </span>
                  </h1>
                  
                  <p className="text-xl mb-8" style={{ color: '#6b7280' }}>
                    Join thousands of customers worldwide who shop authentic products from the 
                    Village of Peace while earning rewards and supporting our community.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/customer/dashboard">
                      <button className="px-8 py-4 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2" style={{ backgroundColor: '#478c0b' }}>
                        <i className="fas fa-user-plus"></i>
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                    <button className="px-8 py-4 font-semibold rounded-xl border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: '#478c0b', color: '#478c0b', backgroundColor: 'white' }}>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Sign In
                    </button>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: '#478c0b' }} />
                      <span className="text-sm" style={{ color: '#6b7280' }}>Secure Shopping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" style={{ color: '#f6af0d' }} />
                      <span className="text-sm" style={{ color: '#6b7280' }}>Ships Worldwide</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Content - Image Collage */}
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Image
                          src="/images/customer-onboarding/1.jpg"
                          alt="Happy Customer"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Image
                          src="/images/customer-onboarding/2.jpg"
                          alt="Shopping Experience"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Image
                          src="/images/customer-onboarding/3.jpg"
                          alt="Community Member"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Image
                          src="/images/customer-onboarding/4.jpg"
                          alt="Product Quality"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                        <Trophy className="w-6 h-6" style={{ color: '#478c0b' }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>4.9★</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>Customer Rating</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffeaa7' }}>
                        <Users className="w-6 h-6" style={{ color: '#f6af0d' }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>10K+</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>Happy Customers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Why Join KFAR Marketplace?
              </h2>
              <p className="text-xl" style={{ color: '#6b7280' }}>
                Experience the benefits of being part of our community
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => {
                const colorMap = {
                  'sun-gold': '#f6af0d',
                  'harvest-red': '#c23c09',
                  'leaf-green': '#478c0b',
                  'soil-brown': '#3a3a1d'
                };
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    style={{ borderTop: `4px solid ${colorMap[benefit.color]}` }}
                    onMouseEnter={() => setSelectedBenefit(index)}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${colorMap[benefit.color]}20`, color: colorMap[benefit.color] }}>
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                      {benefit.title}
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20" style={{ backgroundColor: '#fef9ef' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Start Shopping in Minutes
              </h2>
              <p className="text-xl" style={{ color: '#6b7280' }}>
                Join our community in 4 simple steps
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4" style={{ backgroundColor: '#478c0b' }}>
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-8 left-full w-full h-0.5" style={{ backgroundColor: '#cfe7c1' }}></div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>{step.title}</h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Loved by Customers Worldwide
              </h2>
              <p className="text-xl" style={{ color: '#6b7280' }}>
                See what our community members are saying
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>{testimonial.name}</h4>
                      <p className="text-sm" style={{ color: '#6b7280' }}>{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#f6af0d' }} />
                    ))}
                  </div>
                  <p className="italic" style={{ color: '#6b7280' }}>"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="py-16" style={{ backgroundColor: '#fef9ef' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-leaf-green to-sun-gold rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Limited Time Offer</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Get 100 Bonus Points When You Sign Up Today!
                </h3>
                <p className="text-xl mb-8 text-white/90">
                  That's ₪10 off your first purchase. Join now and start saving!
                </p>
                
                <Link href="/customer/dashboard">
                  <button className="px-8 py-4 bg-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-leaf-green">
                    <i className="fas fa-gift mr-2"></i>
                    Claim Your Bonus Points
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Common Questions
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                    Is it free to join KFAR Marketplace?
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    Yes! Creating an account is completely free. You only pay for the products you purchase, and you'll earn rewards points with every order.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                    Do you ship internationally?
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    Yes, we ship worldwide! Shipping costs and delivery times vary by location. You can see exact shipping options at checkout.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                    How do rewards points work?
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    You earn points on every purchase (1 point = ₪1 spent). Points can be redeemed for discounts on future orders. Plus, get bonus points for reviews and referrals!
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link href="/support#faq" className="text-leaf-green hover:text-leaf-green-dark font-semibold">
                  View All FAQs →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #478c0b 0%, #f6af0d 100%)' }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join the Village?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Start shopping authentic products from the Village of Peace today. 
              Your journey to better shopping begins here!
            </p>
            
            {/* Village of Peace Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <i className="fas fa-leaf text-lg" style={{ color: '#478c0b' }}></i>
                </div>
                <div className="text-left">
                  <p className="font-bold">Village of Peace</p>
                  <p className="text-xs opacity-90">Est. 1967</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/customer/dashboard">
                <button className="px-8 py-4 bg-white font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2" style={{ color: '#478c0b' }}>
                  <i className="fas fa-user-plus"></i>
                  Create Your Account
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  Browse Products First
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}