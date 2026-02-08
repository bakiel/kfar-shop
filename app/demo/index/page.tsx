'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';

export default function DemoIndexPage() {
  const demos = [
    {
      title: 'AI Chat Assistant',
      description: 'Interactive voice and text chat with community knowledge',
      icon: '🤖',
      href: '/demo',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Customer Journey',
      description: 'AI-powered profiles with QR code integration',
      icon: '👤',
      href: '/demo/customer-journey',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'QR/NFC Technology',
      description: 'Smart product tracking and instant checkout',
      icon: '📱',
      href: '/demo/qr-nfc',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Voice Commerce',
      description: 'Shop hands-free with voice commands',
      icon: '🎙️',
      href: '/voice-system-review',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Vendor Management',
      description: 'Complete vendor dashboard and tools',
      icon: '🏪',
      href: '/vendor/dashboard',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Admin Dashboard',
      description: 'Marketplace management and analytics',
      icon: '📊',
      href: '/admin/dashboard',
      color: 'from-red-500 to-red-600'
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              KFAR Marketplace Demos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the innovative features that make KFAR the future of community-driven commerce
            </p>
          </motion.div>

          {/* Demo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {demos.map((demo, index) => (
              <motion.div
                key={demo.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={demo.href}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                    <div className={`h-2 bg-gradient-to-r ${demo.color}`} />
                    <div className="p-6">
                      <div className="text-4xl mb-4">{demo.icon}</div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                        {demo.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {demo.description}
                      </p>
                      <div className="mt-4 flex items-center text-green-600 font-semibold">
                        <span>Try Demo</span>
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
              Key Innovation Highlights
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-brain text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">AI Vision Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Customer avatars analyzed for personalized experiences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-qrcode text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Smart QR Integration</h4>
                    <p className="text-sm text-gray-600">
                      Instant profile access and benefit application
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-microphone text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Voice-First Shopping</h4>
                    <p className="text-sm text-gray-600">
                      ElevenLabs v3 conversational AI technology
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-chart-line text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Real-Time Analytics</h4>
                    <p className="text-sm text-gray-600">
                      Track customer behavior and preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-shield-alt text-red-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Secure & Private</h4>
                    <p className="text-sm text-gray-600">
                      End-to-end encryption for all customer data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-users text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Community Driven</h4>
                    <p className="text-sm text-gray-600">
                      Built by and for the Village of Peace
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-4">
              Ready to see KFAR in action? Start with our AI Chat Assistant demo.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <i className="fas fa-play" />
              Start Main Demo
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}