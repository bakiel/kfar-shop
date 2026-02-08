'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useToast } from '@/components/ui/use-toast';
import { QrCode, Camera, AlertTriangle, X } from 'lucide-react';

interface CustomerData {
  type: string;
  id: string;
  name: string;
  tier: string;
  points: number;
  preferences: {
    dietary: string[];
    allergies: string[];
    favoriteCategories: string[];
  };
}

interface ScanResult {
  customer: CustomerData;
  timestamp: string;
  transactionId: string;
}

export default function CustomerQRScanner({ 
  onScanSuccess,
  vendorId 
}: { 
  onScanSuccess?: (result: ScanResult) => void;
  vendorId: string;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualCustomerId, setManualCustomerId] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);

    scannerRef.current.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Silently handle scan errors
      }
    );
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // Parse QR data
      const customerData = JSON.parse(decodedText) as CustomerData;
      
      // Validate it's a customer QR
      if (customerData.type !== 'customer') {
        throw new Error('Invalid QR code type');
      }

      // Stop scanning
      stopScanning();

      // Create scan result
      const result: ScanResult = {
        customer: customerData,
        timestamp: new Date().toISOString(),
        transactionId: `trans_${Date.now()}`
      };

      setScanResult(result);

      // Log the scan
      await logCustomerScan(customerData.id);

      // Callback
      if (onScanSuccess) {
        onScanSuccess(result);
      }

      toast({
        title: "Customer Identified",
        description: `${customerData.name} - ${customerData.tier} member`,
      });
    } catch (error) {
      console.error('QR parse error:', error);
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid customer QR code",
      });
    }
  };

  const logCustomerScan = async (customerId: string) => {
    try {
      await fetch('/api/customer/scan-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          vendorId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log scan:', error);
    }
  };

  const handleManualEntry = async () => {
    if (!manualCustomerId.trim()) return;

    try {
      // Fetch customer data by ID
      const response = await fetch(`/api/customer/${manualCustomerId}`);
      if (!response.ok) throw new Error('Customer not found');
      
      const customerData = await response.json();
      
      const result: ScanResult = {
        customer: customerData,
        timestamp: new Date().toISOString(),
        transactionId: `trans_${Date.now()}`
      };

      setScanResult(result);
      setManualCustomerId('');

      if (onScanSuccess) {
        onScanSuccess(result);
      }

      toast({
        title: "Customer Found",
        description: `${customerData.name} - ${customerData.tier} member`,
      });
    } catch (error) {
      toast({
        title: "Customer Not Found",
        description: "Please check the ID and try again",
      });
    }
  };

  const renderCustomerInfo = () => {
    if (!scanResult) return null;

    const { customer } = scanResult;
    const tierColors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0', 
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
      >
        {/* Customer Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: tierColors[customer.tier as keyof typeof tierColors] }}
            >
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
              <p className="text-sm text-gray-600">ID: {customer.id}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: tierColors[customer.tier as keyof typeof tierColors] }}>
              {customer.points}
            </p>
            <p className="text-xs text-gray-600">Points</p>
          </div>
        </div>

        {/* Tier Badge */}
        <div 
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: `${tierColors[customer.tier as keyof typeof tierColors]}20` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold capitalize">{customer.tier} Member</span>
            <span className="text-sm">
              {customer.tier === 'bronze' && '5% off'}
              {customer.tier === 'silver' && '10% off'}
              {customer.tier === 'gold' && '15% off'}
              {customer.tier === 'platinum' && '20% off'}
            </span>
          </div>
        </div>

        {/* Preferences & Alerts */}
        {(customer.preferences.dietary.length > 0 || customer.preferences.allergies.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              <AlertTriangle className="w-5 h-5 stroke-[1.5] flex-shrink-0" />
              Customer Preferences
            </h4>
            {customer.preferences.dietary.length > 0 && (
              <p className="text-sm text-gray-700 mb-1">
                <strong>Dietary:</strong> {customer.preferences.dietary.join(', ')}
              </p>
            )}
            {customer.preferences.allergies.length > 0 && (
              <p className="text-sm text-red-700">
                <strong>Allergies:</strong> {customer.preferences.allergies.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Favorite Categories */}
        {customer.preferences.favoriteCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Favorite Categories:</p>
            <div className="flex flex-wrap gap-2">
              {customer.preferences.favoriteCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setScanResult(null);
              setIsScanning(false);
            }}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
          <button
            onClick={() => {
              // In production, this would open POS with customer applied
              window.location.href = `/vendor/pos?customer=${customer.id}`;
            }}
            className="flex-1 py-3 text-white rounded-lg font-semibold transition-all"
            style={{ backgroundColor: '#478c0b' }}
          >
            Continue to Checkout
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isScanning && !scanResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <QrCode className="w-16 h-16 stroke-[1.5] mb-4 mx-auto" style={{ color: '#478c0b' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
                Scan Customer QR
              </h2>
              <p className="text-gray-600 mb-6">
                Scan a customer's member QR to apply their benefits and track their purchase
              </p>
              
              <button
                onClick={startScanning}
                className="w-full py-4 text-white rounded-xl font-semibold mb-4 hover:shadow-lg transition-all"
                style={{ backgroundColor: '#478c0b' }}
              >
                <Camera className="w-5 h-5 stroke-[1.5] inline mr-2" />
                Start Scanning
              </button>

              {/* Manual Entry */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Enter Customer ID Manually:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCustomerId}
                    onChange={(e) => setManualCustomerId(e.target.value)}
                    placeholder="e.g., cust_123456"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleManualEntry}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Customers */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Recent Customers
              </h3>
              <div className="space-y-3">
                {['Sarah Cohen', 'David Levi', 'Rachel Green'].map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-gray-600">Last visit: 2 days ago</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">Gold</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Scanning...</h3>
              <button
                onClick={stopScanning}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
            
            <div id="qr-reader" className="w-full" />
            
            <p className="text-sm text-gray-600 text-center mt-4">
              Position the QR code within the frame
            </p>
          </motion.div>
        )}

        {scanResult && renderCustomerInfo()}
      </AnimatePresence>
    </div>
  );
}