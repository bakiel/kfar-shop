'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComingSoonHome() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Launch date - 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  // Interactive vendor preview data
  const vendors = [
    {
      name: 'Teva Deli',
      description: 'Premium plant-based Israeli cuisine',
      preview: '/api/placeholder/400/300',
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: "People's Store",
      description: 'Organic bulk foods & fermented goods',
      preview: '/api/placeholder/400/300',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Village of Peace Shop',
      description: 'Community wellness & heritage products',
      preview: '/api/placeholder/400/300',
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: "Queen's Cuisine",
      description: 'Gourmet vegan meat alternatives',
      preview: '/api/placeholder/400/300',
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  // Auto-rotate vendors
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedVendor((prev) => (prev + 1) % vendors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vendors.length]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'coming-soon' })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600">
            KFAR
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">Marketplace of Dimona</p>
        </motion.header>

        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          {/* Countdown timer */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto"
          >
            {Object.entries(countdown).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <span className="text-3xl md:text-5xl font-bold">{value}</span>
                  <p className="text-sm uppercase mt-1">{unit}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Interactive message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Something Amazing is Coming
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              The future of community-driven marketplace in Dimona
            </p>
          </motion.div>

          {/* Interactive vendor preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-semibold text-center mb-6">Preview Our Vendors</h3>
            
            {/* Vendor cards */}
            <div className="relative h-80 mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVendor}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="absolute inset-0"
                >
                  <div className={`bg-gradient-to-r ${vendors[selectedVendor].color} rounded-2xl p-1 h-full`}>
                    <div className="bg-gray-900 rounded-xl p-8 h-full flex flex-col justify-center items-center text-center">
                      <div className="w-32 h-32 bg-white/10 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-4xl">🛍️</span>
                      </div>
                      <h4 className="text-2xl font-bold mb-2">{vendors[selectedVendor].name}</h4>
                      <p className="text-gray-300">{vendors[selectedVendor].description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Vendor selector dots */}
            <div className="flex justify-center gap-2">
              {vendors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVendor(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === selectedVendor ? 'bg-white w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Email subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-md mx-auto"
          >
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access"
                  required
                  className="w-full px-6 py-4 pr-32 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-yellow-400 to-orange-600 text-gray-900 font-semibold rounded-full hover:from-yellow-500 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Joining...' : 'Notify Me'}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-6 py-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">You're on the list! We'll notify you when we launch.</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Features preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: '🌱', title: 'Local Vendors', desc: 'Supporting Dimona businesses' },
              { icon: '📱', title: 'WhatsApp Orders', desc: 'Easy ordering via WhatsApp' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day local delivery' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16 text-gray-400"
        >
          <p>&copy; 2025 KFAR Marketplace. Building the future of Dimona.</p>
        </motion.footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
