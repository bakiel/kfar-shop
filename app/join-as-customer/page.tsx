'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, QrCode, Mic, Bot, UserPlus, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useMobileDetect } from '@/hooks/useMobileDetect';

export default function JoinAsCustomerPage() {
  const { isMobile } = useMobileDetect();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const benefits = [
    {
      icon: QrCode,
      title: 'Personal QR Code',
      description: 'Get your unique QR code for seamless shopping and exclusive deals',
      color: '#478c0b'
    },
    {
      icon: Mic,
      title: 'Voice Shopping',
      description: 'Order with voice commands in multiple languages',
      color: '#f6af0d'
    },
    {
      icon: Star,
      title: 'Rewards Program',
      description: 'Earn points with every purchase and unlock special benefits',
      color: '#c23c09'
    },
    {
      icon: Bot,
      title: 'AI Personalization',
      description: 'Get recommendations tailored to your preferences',
      color: '#3a3a1d'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Quick registration with just basic information',
      icon: UserPlus
    },
    {
      number: '2',
      title: 'Personalize',
      description: 'Set your preferences and upload your photo',
      icon: SlidersHorizontal
    },
    {
      number: '3',
      title: 'Get QR Code',
      description: 'Receive your unique QR code instantly',
      icon: QrCode
    },
    {
      number: '4',
      title: 'Start Shopping',
      description: 'Enjoy exclusive benefits and rewards',
      icon: ShoppingCart
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Regular Customer',
      image: '/images/customers/customer-1.jpg',
      quote: 'The QR code makes shopping so convenient! I love getting personalized deals.',
      rating: 5
    },
    {
      name: 'David L.',
      role: 'VOP Resident',
      image: '/images/customers/customer-2.jpg',
      quote: 'Voice shopping in Hebrew is amazing. It saves me so much time!',
      rating: 5
    },
    {
      name: 'Rachel K.',
      role: 'New Member',
      image: '/images/customers/customer-3.jpg',
      quote: 'The rewards program is fantastic. I\'ve already saved so much!',
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Header Image */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <Image
          src="/images/banners/customer-journey-banner.svg"
          alt="Start Your KFAR Journey"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center">
          <div className="max-w-4xl px-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Start Your Journey
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
                Join the Village of Peace Community Today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-herbal-mint to-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sun-gold rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-leaf-green rounded-full filter blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Experience Shopping Reimagined
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-700">
              AI-powered personalization, exclusive rewards, and cutting-edge technology 
              await you in the KFAR marketplace
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer/register"
                className="px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ backgroundColor: '#478c0b' }}
              >
                Start Your Journey
              </Link>
              <Link
                href="/customer/login"
                className="px-8 py-4 rounded-full border-2 font-semibold text-lg hover:bg-gray-50 transition-all"
                style={{ borderColor: '#478c0b', color: '#478c0b' }}
              >
                Already a Member? Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Why Join KFAR?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock a world of benefits designed to make your shopping experience 
              extraordinary
            </p>
          </motion.div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-4"
                  style={{ backgroundColor: benefit.color }}
                >
                  <benefit.icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Join KFAR in 4 simple steps
            </p>
          </motion.div>

          <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-4 gap-8'} max-w-5xl mx-auto`}>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`text-center ${isMobile ? 'flex items-center gap-4' : ''}`}
              >
                <div className={`${isMobile ? 'flex-shrink-0' : 'mx-auto mb-4'} relative`}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <step.icon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  {!isMobile && index < steps.length - 1 && (
                    <div
                      className="absolute top-10 left-full w-full h-0.5"
                      style={{ backgroundColor: '#478c0b', opacity: 0.3 }}
                    />
                  )}
                </div>
                <div className={isMobile ? 'text-left' : ''}>
                  <h3 className="text-xl font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              What Our Members Say
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === activeTestimonial ? 1 : 0 }}
                  className={`${
                    index === activeTestimonial ? 'block' : 'hidden'
                  } bg-white rounded-xl shadow-lg p-8`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 stroke-[1.5] text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? 'w-8 bg-leaf-green'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-leaf-green to-sun-gold text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy customers enjoying exclusive benefits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer/register"
                className="px-8 py-4 bg-white text-leaf-green rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started Now
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-leaf-green transition-all"
              >
                Try Demo First
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Bottom CTA */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-30">
          <Link
            href="/customer/register"
            className="block w-full py-3 rounded-full text-white font-semibold text-center"
            style={{ backgroundColor: '#478c0b' }}
          >
            Join Now - It's Free!
          </Link>
        </div>
      )}
    </Layout>
  );
}