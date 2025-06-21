'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Sparkles, TrendingUp, Users, ChevronRight } from 'lucide-react';

export default function VendorCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-base via-white to-cream-base" />
      <div className="absolute inset-0 bg-gradient-to-r from-leaf-green/5 via-transparent to-sun-gold/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Main CTA Card */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sun-gold via-earth-flame to-sun-gold rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-2 bg-gradient-to-r from-leaf-green via-sun-gold to-earth-flame" />
              
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left content */}
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                        Join Our Restoration Model
                      </h2>
                      <p className="text-xl mb-6 text-gray-700">
                        Self-Sustaining • 100% Vegan • Community First
                      </p>
                      <p className="text-lg mb-8 text-gray-600">
                        Be part of our 50+ year success story. Support the Village of Peace economy while mastering the art of living through clean commerce.
                      </p>
                      
                      {/* CTA Button - High contrast */}
                      <Link
                        href="/become-a-vendor"
                        className="inline-flex items-center gap-3 px-8 py-4 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group/btn"
                        style={{ backgroundColor: '#c23c09' }}
                      >
                        Become a Vendor
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </div>
                  
                  {/* Right content - Feature highlights */}
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      {/* Feature 1 */}
                      <div className="bg-gradient-to-br from-leaf-green/10 to-leaf-green/5 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: '#478c0b' }}
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: '#478c0b' }}>
                          AI Assistant
                        </h3>
                        <p className="text-sm text-gray-600">
                          Auto-generate product descriptions
                        </p>
                      </div>
                      
                      {/* Feature 2 */}
                      <div className="bg-gradient-to-br from-sun-gold/10 to-sun-gold/5 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: '#f6af0d' }}
                        >
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: '#f6af0d' }}>
                          40% Growth
                        </h3>
                        <p className="text-sm text-gray-600">
                          Average revenue increase
                        </p>
                      </div>
                      
                      {/* Feature 3 */}
                      <div className="bg-gradient-to-br from-earth-flame/10 to-earth-flame/5 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: '#c23c09' }}
                        >
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: '#c23c09' }}>
                          30 Minutes
                        </h3>
                        <p className="text-sm text-gray-600">
                          To launch your store
                        </p>
                      </div>
                      
                      {/* Feature 4 */}
                      <div className="bg-gradient-to-br from-herbal-mint/20 to-herbal-mint/10 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: '#478c0b' }}
                        >
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: '#478c0b' }}>
                          Community
                        </h3>
                        <p className="text-sm text-gray-600">
                          Join successful vendors
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Bottom banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 pt-8 border-t border-gray-200"
                >
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#478c0b' }} />
                      Free to start
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f6af0d' }} />
                      No credit card required
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c23c09' }} />
                      AI-powered tools included
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#478c0b' }} />
                      24/7 support
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Floating elements for visual interest */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-10 -right-10 w-32 h-32 opacity-10"
          >
            <Store className="w-full h-full" style={{ color: '#f6af0d' }} />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, 10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-10 -left-10 w-40 h-40 opacity-10"
          >
            <Sparkles className="w-full h-full" style={{ color: '#478c0b' }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}