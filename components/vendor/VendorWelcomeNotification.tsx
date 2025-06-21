'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, MessageSquare, X } from 'lucide-react';

interface VendorWelcomeNotificationProps {
  vendorId: string;
  vendorData: any;
  onClose?: () => void;
}

export default function VendorWelcomeNotification({ 
  vendorId, 
  vendorData, 
  onClose 
}: VendorWelcomeNotificationProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-send welcome package when component mounts
    sendWelcomePackage();
  }, []);

  const sendWelcomePackage = async () => {
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/vendor/welcome-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          vendorData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send welcome package');
      }

      const result = await response.json();
      setSent(true);

      // Auto-close after 5 seconds if successful
      if (onClose) {
        setTimeout(onClose, 5000);
      }
    } catch (err) {
      console.error('Error sending welcome package:', err);
      setError('Failed to send welcome package. Please contact support.');
    } finally {
      setSending(false);
    }
  };

  if (!sending && !sent && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-leaf-green">
        {/* Header */}
        <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sending && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {sent && <CheckCircle className="w-5 h-5 text-white" />}
              {error && <X className="w-5 h-5 text-white" />}
              <h3 className="text-white font-semibold">
                {sending && 'Sending Welcome Package...'}
                {sent && 'Welcome Package Sent!'}
                {error && 'Oops, Something Went Wrong'}
              </h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {sending && (
            <p className="text-gray-600">
              We're preparing your QR codes and marketing materials...
            </p>
          )}

          {sent && (
            <div className="space-y-3">
              <p className="text-gray-700">
                We've sent your welcome package to:
              </p>
              
              <div className="space-y-2">
                {vendorData.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">WhatsApp: {vendorData.phone}</span>
                  </div>
                )}
                {vendorData.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Email: {vendorData.email}</span>
                  </div>
                )}
              </div>

              <div className="bg-leaf-green/10 rounded-lg p-3 text-sm">
                <p className="text-leaf-green-dark font-medium mb-1">
                  📦 Your package includes:
                </p>
                <ul className="text-gray-700 space-y-1">
                  <li>• QR codes for your store</li>
                  <li>• Marketing materials</li>
                  <li>• Dashboard access link</li>
                  <li>• Getting started guide</li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div>
              <p className="text-red-600 mb-3">{error}</p>
              <button
                onClick={sendWelcomePackage}
                className="text-leaf-green hover:text-leaf-green-dark font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}