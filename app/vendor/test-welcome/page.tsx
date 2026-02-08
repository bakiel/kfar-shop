'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle } from 'lucide-react';

export default function TestWelcomePage() {
  const [showNotification, setShowNotification] = useState(false);
  const [vendorData, setVendorData] = useState({
    businessName: 'Demo Vegan Store',
    ownerName: 'John Doe',
    email: 'demo@example.com',
    phone: '+972501234567',
    businessType: 'restaurant',
    category: 'Food & Dining'
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSendWelcomePackage = async () => {
    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/vendor/welcome-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: 'demo-vendor-' + Date.now(),
          vendorData
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to send welcome package' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Test Welcome Package</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Vendor Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={vendorData.businessName}
                onChange={(e) => setVendorData({ ...vendorData, businessName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={vendorData.email}
                onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={vendorData.phone}
                onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleSendWelcomePackage}
            disabled={sending}
            className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {sending ? 'Sending...' : 'Send Welcome Package'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}