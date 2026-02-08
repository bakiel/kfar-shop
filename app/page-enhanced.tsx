'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComingSoonHome() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    interest: '',
    dietary: [] as string[],
    source: '',
    newsletter: true
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

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

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDietaryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(value)
        ? prev.dietary.filter(d => d !== value)
        : [...prev.dietary, value]
    }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          source: formData.source || 'coming-soon',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        // Send coming soon email
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email,
            name: formData.firstName
          })
        });
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

          {/* Enhanced Email subscription form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            {!isSubscribed ? (
              <>
                {!showFullForm ? (
                  <div className="text-center">
                    <button
                      onClick={() => setShowFullForm(true)}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-600 text-gray-900 font-bold text-lg rounded-full hover:from-yellow-500 hover:to-orange-700 transition-all transform hover:scale-105"
                    >
                      🌿 Join the Waitlist for Early Access 🌿
                    </button>
                    <p className="mt-4 text-gray-300">Be the first to know and get 20% off your first order!</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      🌿 Get Early Access to KFAR Marketplace 🌿
                    </h3>
                    
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      {/* Name fields */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-2">WhatsApp Number (for exclusive updates)</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+972-50-XXX-XXXX"
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Location */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Your city"
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Country</label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white focus:outline-none focus:border-white/40"
                          >
                            <option value="" className="bg-gray-800">Select country</option>
                            <option value="IL" className="bg-gray-800">Israel</option>
                            <option value="US" className="bg-gray-800">United States</option>
                            <option value="UK" className="bg-gray-800">United Kingdom</option>
                            <option value="CA" className="bg-gray-800">Canada</option>
                            <option value="AU" className="bg-gray-800">Australia</option>
                            <option value="ZA" className="bg-gray-800">South Africa</option>
                            <option value="other" className="bg-gray-800">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Interest */}
                      <div>
                        <label className="block text-sm font-medium mb-2">🌿 What interests you most? *</label>
                        <select
                          name="interest"
                          required
                          value={formData.interest}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white focus:outline-none focus:border-white/40"
                        >
                          <option value="" className="bg-gray-800">Select your main interest</option>
                          <option value="vegan-food" className="bg-gray-800">Vegan Food Products</option>
                          <option value="organic-produce" className="bg-gray-800">Fresh Organic Produce</option>
                          <option value="health-wellness" className="bg-gray-800">Health & Wellness Products</option>
                          <option value="prepared-meals" className="bg-gray-800">Prepared Meals & Catering</option>
                          <option value="community" className="bg-gray-800">Community Connection</option>
                          <option value="vendor" className="bg-gray-800">Becoming a Vendor</option>
                          <option value="wholesale" className="bg-gray-800">Wholesale/Bulk Orders</option>
                          <option value="delivery" className="bg-gray-800">Delivery Services</option>
                        </select>
                      </div>

                      {/* Dietary Preferences */}
                      <div>
                        <label className="block text-sm font-medium mb-2">🌿 Dietary Preferences (check all that apply)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['vegan', 'gluten-free', 'sugar-free', 'raw', 'organic', 'kosher'].map(diet => (
                            <label key={diet} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={formData.dietary.includes(diet)}
                                onChange={() => handleDietaryChange(diet)}
                                className="mr-2"
                              />
                              <span className="capitalize">{diet.replace('-', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* How did you hear */}
                      <div>
                        <label className="block text-sm font-medium mb-2">How did you hear about us?</label>
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white focus:outline-none focus:border-white/40"
                        >
                          <option value="" className="bg-gray-800">Please select</option>
                          <option value="friend" className="bg-gray-800">Friend or Family</option>
                          <option value="social" className="bg-gray-800">Social Media</option>
                          <option value="search" className="bg-gray-800">Search Engine</option>
                          <option value="community" className="bg-gray-800">Community Member</option>
                          <option value="vendor" className="bg-gray-800">From a Vendor</option>
                          <option value="other" className="bg-gray-800">Other</option>
                        </select>
                      </div>

                      {/* Newsletter */}
                      <div>
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.newsletter}
                            onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                            className="mt-1 mr-3"
                          />
                          <span className="text-sm">
                            🌿 Yes, I want to receive updates about new products, special offers, and community news from KFAR Marketplace
                          </span>
                        </label>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-600 text-gray-900 font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-orange-700 transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Joining...' : '🌿 Join the KFAR Family'}
                      </button>

                      <p className="text-center text-sm mt-4">
                        🌿 Early supporters get <strong>20% off</strong> their first order! 🌿
                      </p>
                    </form>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-6 py-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">Welcome to the KFAR family! Check your email for confirmation.</span>
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
          <p style={{ color: '#478c0b', fontWeight: 'bold', marginBottom: '10px' }}>
            Yah Khai! HalleluYah! 🌿
          </p>
          <p>&copy; 2025 KFAR Marketplace - Village of Peace, Dimona, Israel</p>
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