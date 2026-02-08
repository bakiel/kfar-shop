'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import OnboardingFlow from '@/components/customer/OnboardingFlow';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleOnboardingComplete = (customerProfile: any) => {
    // Store customer data in localStorage for demo
    localStorage.setItem('customerProfile', JSON.stringify(customerProfile));
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/customer/dashboard');
    }, 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Join the KFAR Community
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create your profile and start earning rewards while shopping
              for authentic vegan products from the Village of Peace
            </p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
                Why Join KFAR?
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <h4 className="font-semibold mb-1">Welcome Bonus</h4>
                  <p className="text-sm text-gray-600">Get 100 points instantly</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <h4 className="font-semibold mb-1">Loyalty Rewards</h4>
                  <p className="text-sm text-gray-600">Earn points on every purchase</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold mb-1">Personalized</h4>
                  <p className="text-sm text-gray-600">Get tailored recommendations</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="font-semibold mb-1">QR Access</h4>
                  <p className="text-sm text-gray-600">Quick checkout & rewards</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Onboarding Flow Component */}
          <OnboardingFlow onComplete={handleOnboardingComplete} />

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-8 text-center"
          >
            <div className="bg-gray-100 rounded-lg p-4 inline-flex items-center gap-2">
              <Lock className="w-5 h-5 stroke-[1.5] text-gray-600" />
              <span className="text-sm text-gray-600">
                Your data is secure and will only be used to enhance your shopping experience
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}