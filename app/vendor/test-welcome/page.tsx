'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import VendorWelcomeNotification from '@/components/vendor/VendorWelcomeNotification';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/vendor/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Test Welcome Package</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Welcome Package Test
            </h2>
            <p className="text-blue-800">
              This page allows you to test the vendor welcome package functionality. 
              The package includes WhatsApp messages, emails with QR codes, and marketing materials.
            </p>
          </div>

          {/* Test Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Vendor Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={vendorData.businessName}
                  onChange={(e) => setVendorData({ ...vendorData, businessName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={vendorData.ownerName}
                  onChange={(e) => setVendorData({ ...vendorData, ownerName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="tel"
                  value={vendorData.phone}
                  onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                  placeholder="+972501234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={vendorData.businessType}
                  onChange={(e) => setVendorData({ ...vendorData, businessType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="store">Store</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSendWelcomePackage}
              disabled={sending}
              className="mt-6 w-full py-3 bg-leaf-green text-white rounded-lg font-semibold hover:bg-leaf-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Welcome Package
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`mt-6 rounded-xl p-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Success!' : 'Error'}
              </h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Twilio Configuration Info */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Current Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">WhatsApp: Using Twilio Sandbox (+14155238886)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Email: SendGrid (if configured)</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Note: For WhatsApp sandbox, recipients must first join by sending "join <sandbox-keyword>" to the sandbox number.
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Notification */}
      {showNotification && (
        <VendorWelcomeNotification
          vendorId={`demo-vendor-${Date.now()}`}
          vendorData={vendorData}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}