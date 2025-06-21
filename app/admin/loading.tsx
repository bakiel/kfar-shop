'use client';

import React from 'react';
import '@/styles/kfar-style-system.css';

export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center kfar-bg-cream">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 kfar-border-leaf-green border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 kfar-border-sun-gold border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <p className="kfar-text-gray-600 text-body">Loading admin panel...</p>
      </div>
    </div>
  );
}
