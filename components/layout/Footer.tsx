'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="relative">
      {/* Newsletter Section */}
      <section className="py-12 relative overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-leaf-green/5 via-transparent to-sun-gold/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Join Our Community
            </h3>
            <p className="text-gray-600 mb-8">
              Get exclusive updates on new vendors, special offers, and community events
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-leaf-green transition-all"
                style={{ 
                  borderColor: '#478c0b'
                }}
                required
              />
              <button
                type="submit"
                className="px-8 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: '#478c0b' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section - Wider */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Image
                  src="/images/logos/kfar_logo_africa_heritage.png" 
                  alt="KiFar Marketplace" 
                  width={160} 
                  height={60}
                  className="h-16 w-auto"
                />
              </div>
              <h4 className="text-xl font-bold mb-3">KiFar Marketplace</h4>
              <p className="text-gray-300 text-sm mb-6">
                Serving the Village of Peace community in Dimona, Israel with authentic vegan products and services since 1969.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <i className="fab fa-facebook-f text-white"></i>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: '#f6af0d' }}
                >
                  <i className="fab fa-instagram text-white"></i>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: '#c23c09' }}
                >
                  <i className="fab fa-youtube text-white"></i>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-shopping-bag" style={{ color: '#f6af0d' }}></i>
                Shop
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/categories" className="text-gray-300 hover:text-sun-gold transition-colors">All Categories</Link></li>
                <li><Link href="/store/featured" className="text-gray-300 hover:text-sun-gold transition-colors">Featured Products</Link></li>
                <li><Link href="/store/new" className="text-gray-300 hover:text-sun-gold transition-colors">New Arrivals</Link></li>
                <li><Link href="/store/deals" className="text-gray-300 hover:text-sun-gold transition-colors">Special Offers</Link></li>
                <li><Link href="/vendors" className="text-gray-300 hover:text-sun-gold transition-colors">Our Vendors</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-headset" style={{ color: '#478c0b' }}></i>
                Support
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-300 hover:text-leaf-green transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-leaf-green transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-leaf-green transition-colors">Contact Us</Link></li>
                <li><Link href="/info/qr-nfc" className="text-gray-300 hover:text-leaf-green transition-colors">QR & NFC Guide</Link></li>
                <li><Link href="/shipping" className="text-gray-300 hover:text-leaf-green transition-colors">Shipping Info</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-shield-alt" style={{ color: '#c23c09' }}></i>
                Policies
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/policies/privacy" className="text-gray-300 hover:text-earth-flame transition-colors">Privacy Policy</Link></li>
                <li><Link href="/policies/terms" className="text-gray-300 hover:text-earth-flame transition-colors">Terms of Service</Link></li>
                <li><Link href="/policies/returns" className="text-gray-300 hover:text-earth-flame transition-colors">Return Policy</Link></li>
                <li><Link href="/policies/shipping" className="text-gray-300 hover:text-earth-flame transition-colors">Shipping Policy</Link></li>
                <li><Link href="/policies/cookies" className="text-gray-300 hover:text-earth-flame transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* For Vendors */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-store" style={{ color: '#f6af0d' }}></i>
                Vendors
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/vendor/join" className="text-gray-300 hover:text-sun-gold transition-colors">Become a Vendor</Link></li>
                <li><Link href="/vendor/dashboard" className="text-gray-300 hover:text-sun-gold transition-colors">Vendor Dashboard</Link></li>
                <li><Link href="/vendor/resources" className="text-gray-300 hover:text-sun-gold transition-colors">Resources</Link></li>
                <li><Link href="/vendor/commission" className="text-gray-300 hover:text-sun-gold transition-colors">Commission Rates</Link></li>
                <li><Link href="/vendor/success" className="text-gray-300 hover:text-sun-gold transition-colors">Success Stories</Link></li>
              </ul>
            </div>
          </div>

          {/* Trust Badges & Payment Methods */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Trust Badges */}
              <div>
                <h6 className="font-semibold mb-4 text-sm text-gray-400">CERTIFIED & SECURE</h6>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                    <i className="fas fa-leaf text-green-400"></i>
                    <span className="text-sm">100% Vegan</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                    <i className="fas fa-lock text-yellow-400"></i>
                    <span className="text-sm">Secure Shopping</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                    <i className="fas fa-star text-orange-400"></i>
                    <span className="text-sm">Trusted Since 1969</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="md:text-right">
                <h6 className="font-semibold mb-4 text-sm text-gray-400">PAYMENT METHODS</h6>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <i className="fab fa-cc-visa text-2xl"></i>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <i className="fab fa-cc-mastercard text-2xl"></i>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <i className="fab fa-cc-paypal text-2xl"></i>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <i className="fab fa-apple-pay text-2xl"></i>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <i className="fab fa-google-pay text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  &copy; 2024 KiFar Marketplace. All rights reserved. | 
                  <span className="ml-2">
                    <Link href="/policies/accessibility" className="text-gray-400 hover:text-white transition-colors">
                      Accessibility
                    </Link>
                  </span> | 
                  <span className="ml-2">
                    <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                      Sitemap
                    </Link>
                  </span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Made with</span>
                <i className="fas fa-sun" style={{ color: '#f6af0d' }}></i>
                <span>in Dimona, Israel</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </footer>
  );
};

export default Footer;