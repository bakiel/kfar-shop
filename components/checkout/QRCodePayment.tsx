'use client';

import { useState, useEffect, useMemo } from 'react';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';

interface QRCodePaymentProps {
  amount: number;
  currency: string;
  onComplete: () => void;
}

export default function QRCodePayment({ amount, currency, onComplete }: QRCodePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const simulatePayment = () => {
    if (isProcessing) return; // Prevent double clicks
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
      
      // Auto complete after showing confirmation with fade effect
      setTimeout(() => {
        // Add a fade-out class before completing
        const container = document.querySelector('.qr-payment-container');
        if (container) {
          container.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        }
        
        // Complete after fade
        setTimeout(() => {
          onComplete();
        }, 300);
      }, 1200);
    }, 2000);
  };

  // Generate QR code data only once to prevent regeneration on each render
  const qrCodeData = useMemo(() => {
    const timestamp = Date.now();
    return {
      merchant: 'KiFar Marketplace',
      amount: amount,
      currency: currency,
      reference: `KFAR-${timestamp}`,
      expiry: new Date(timestamp + 5 * 60 * 1000).toISOString(),
      timestamp: timestamp // Fixed timestamp
    };
  }, [amount, currency]); // Only regenerate if amount or currency changes
  
  // Memoize the QR component data to prevent re-renders
  const qrComponentData = useMemo(() => ({
    id: qrCodeData.reference,
    amount: amount,
    currency: currency,
    merchant: qrCodeData.merchant,
    expiry: qrCodeData.expiry,
    paymentMethod: 'qr',
    timestamp: qrCodeData.timestamp
  }), [qrCodeData, amount, currency]);

  return (
    <div className="mt-6 max-w-full overflow-hidden">
      <div className="bg-white border-2 border-[#478c0b] rounded-2xl p-3 sm:p-6 md:p-8 text-center max-w-full">
        {!showConfirmation ? (
          <>
            {/* QR Code Display */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                {/* QR with fixed layout */}
                <SmartQRCompactFixed
                  type="order"
                  data={qrComponentData}
                  size={250}
                  hideActions={true}
                />
                
                {/* Timer Badge - positioned on QR container */}
                <div className="absolute top-2 right-2 bg-[#c23c09] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 z-20">
                  <i className="fas fa-clock text-xs"></i>
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              {/* Action buttons below QR */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `payment-qr-${Date.now()}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                >
                  <i className="fas fa-download"></i>
                  Save QR
                </button>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                Scan to Pay
              </h3>
              
              <div className="bg-[#fef9ef] rounded-lg p-4">
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  {currencySymbols[currency]}{amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Reference: {qrCodeData.reference}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>1. Open your mobile banking app</p>
                <p>2. Select "Scan QR Code" or "Pay"</p>
                <p>3. Scan the code above</p>
                <p>4. Confirm the payment</p>
              </div>
            </div>

            {/* Supported Banks */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Supported by:</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">Bank Hapoalim</span>
                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">Bank Leumi</span>
                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">Mizrahi Tefahot</span>
                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">Discount Bank</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={simulatePayment}
              disabled={isProcessing}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#478c0b] text-white hover:bg-[#3a6d08] hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing Payment...
                </span>
              ) : (
                "I've completed the payment"
              )}
            </button>

            {/* Alternative Payment */}
            <div className="mt-4">
              <button className="text-sm text-gray-500 underline hover:text-gray-700">
                Having trouble? Try another payment method
              </button>
            </div>
          </>
        ) : (
          /* Payment Confirmation Animation */
          <div className="py-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fas fa-check text-white text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Payment Received!
            </h3>
            <p className="text-gray-600">
              Processing your order...
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <i className="fas fa-lock"></i>
        <span>Secure payment powered by KFAR Pay</span>
      </div>
    </div>
  );
}