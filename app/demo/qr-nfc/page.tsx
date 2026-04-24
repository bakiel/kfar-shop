'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use window
const Layout = dynamic(() => import('@/components/layout/Layout'), { ssr: false });
const SmartQRGenerator = dynamic(() => import('@/components/qr/SmartQRGenerator').then(mod => ({ default: mod.SmartQRGenerator })), { ssr: false });
const SmartQRScanner = dynamic(() => import('@/components/qr/SmartQRScanner').then(mod => ({ default: mod.SmartQRScanner })), { ssr: false });
const NFCReader = dynamic(() => import('@/components/nfc/NFCReader').then(mod => ({ default: mod.NFCReader })), { ssr: false });
const CollectionPointPicker = dynamic(() => import('@/components/collection/CollectionPointPicker').then(mod => ({ default: mod.CollectionPointPicker })), { ssr: false });
const P2POrderTracker = dynamic(() => import('@/components/p2p/P2POrderTracker').then(mod => ({ default: mod.P2POrderTracker })), { ssr: false });

export default function QRNFCDemoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">QR & NFC Demo</h1>
        <p className="text-gray-600 mb-8">Experience our smart shopping features</p>
        
        <div className="grid gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Features</h2>
            <p className="text-gray-600">Generate and scan QR codes for products and orders</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">NFC Features</h2>
            <p className="text-gray-600">Tap to pay and instant product information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
