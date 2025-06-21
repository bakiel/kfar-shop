'use client';

import React from 'react';
import Link from 'next/link';
import QRNFCAnimation from './QRNFCAnimation';
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa';

export default function TechDemoSection() {
  return (
    <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#f0f9ff' }}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/40 via-transparent to-emerald-50/40 opacity-70" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full filter blur-3xl opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4" style={{ color: '#3a3a1d' }}>
              Experience Smart Shopping in Action
            </h2>
            <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto px-4">
              Watch how QR codes and NFC technology make your shopping experience faster, 
              safer, and more convenient at KiFar Marketplace
            </p>
          </div>
          
          {/* Animation Component */}
          <QRNFCAnimation />
          
          {/* Additional Info */}
          <div className="mt-8 md:mt-12">
            {/* Info Points */}
            <div className="text-center mb-8">
              <div className="inline-flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm md:text-base">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Works on all smartphones</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">No app download needed</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Secure & encrypted</span>
                </div>
              </div>
            </div>
            
            {/* CTA Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/info/qr-nfc"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#478c0b' }}
              >
                <FaInfoCircle className="text-lg" />
                Learn More About QR & NFC
                <FaArrowRight className="text-sm" />
              </Link>
              
              <Link 
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-2"
                style={{ 
                  borderColor: '#f6af0d',
                  color: '#3a3a1d',
                  backgroundColor: 'white'
                }}
              >
                Try It In The Marketplace
                <FaArrowRight className="text-sm" style={{ color: '#f6af0d' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}