'use client';

import React from 'react';
import Link from 'next/link';
import { FaQrcode, FaWifi, FaShieldAlt, FaBolt } from 'react-icons/fa';

export default function TechFeatures() {
  return (
    <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(71,140,11,0.1) 10px, rgba(71,140,11,0.1) 20px)`
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4" style={{ color: '#3a3a1d' }}>
                Smart Shopping Technology
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Experience the future of marketplace shopping with our integrated QR & NFC systems
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {/* QR Payments */}
            <div className="group">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4"
                     style={{ backgroundColor: '#478c0b' }}>
                  <FaQrcode className="text-lg md:text-2xl text-white" />
                </div>
                <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base" style={{ color: '#3a3a1d' }}>QR Payments</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Scan to pay instantly with any banking app. Secure, fast, and contactless.
                </p>
              </div>
            </div>

            {/* NFC Tap */}
            <div className="group">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4"
                     style={{ backgroundColor: '#f6af0d' }}>
                  <FaWifi className="text-lg md:text-2xl text-white" />
                </div>
                <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base" style={{ color: '#3a3a1d' }}>Tap & Go</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  NFC technology for instant product info and express checkout.
                </p>
              </div>
            </div>

            {/* Secure */}
            <div className="group">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4"
                     style={{ backgroundColor: '#c23c09' }}>
                  <FaShieldAlt className="text-lg md:text-2xl text-white" />
                </div>
                <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base" style={{ color: '#3a3a1d' }}>100% Secure</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Encrypted transactions with digital signatures and fraud protection.
                </p>
              </div>
            </div>

            {/* Fast */}
            <div className="group">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4"
                     style={{ backgroundColor: '#478c0b' }}>
                  <FaBolt className="text-lg md:text-2xl text-white" />
                </div>
                <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base" style={{ color: '#3a3a1d' }}>Lightning Fast</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Complete checkout in seconds with smart order tracking.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link 
              href="/info/qr-nfc"
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#478c0b' }}
            >
              <FaQrcode className="text-sm md:text-base" />
              <span>Learn About Smart Shopping</span>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 ml-1 md:ml-2">New</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}