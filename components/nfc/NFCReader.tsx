'use client';

import React, { useState, useEffect } from 'react';
import { NFC } from '@/lib/services/nfc-service';
import { FaMobileAlt, FaWifi, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { SmartQRScanner } from '../qr/SmartQRScanner';

interface NFCReaderProps {
  onRead: (data: any) => void;
  acceptedTypes?: string[];
  showFallback?: boolean;
  autoStart?: boolean;
}

export const NFCReader: React.FC<NFCReaderProps> = ({
  onRead,
  acceptedTypes = ['product', 'vendor', 'payment', 'collection'],
  showFallback = true,
  autoStart = false
}) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'reading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [readData, setReadData] = useState<any>(null);
  const [showQRFallback, setShowQRFallback] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    checkNFCSupport();
    
    // Listen for NFC fallback events
    const handleFallback = (event: any) => {
      if (event.detail.type === 'qr' && showFallback) {
        setShowQRFallback(true);
      }
    };
    
    window.addEventListener('nfc-fallback', handleFallback);
    return () => window.removeEventListener('nfc-fallback', handleFallback);
  }, [showFallback]);

  useEffect(() => {
    if (autoStart && nfcSupported && status === 'idle') {
      startReading();
    }
  }, [autoStart, nfcSupported, status]);

  useEffect(() => {
    // Animate the NFC waves
    if (status === 'reading') {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 3);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const checkNFCSupport = () => {
    setStatus('checking');
    const support = NFC.isSupported();
    setNfcSupported(support);
    
    if (!support) {
      setMessage('NFC not supported. Use QR code instead.');
      setStatus('error');
    } else {
      setStatus('idle');
    }
  };

  const startReading = async () => {
    if (!nfcSupported) {
      setShowQRFallback(true);
      return;
    }

    try {
      setStatus('reading');
      setMessage('Hold your device near the NFC tag...');
      setReadData(null);
      
      const result = await NFC.read({ timeout: 30000 });
      
      if (result.success && result.data) {
        // Validate tag type
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(result.type || 'unknown')) {
          throw new Error(`Invalid tag type. Expected: ${acceptedTypes.join(', ')}`);
        }
        
        setStatus('success');
        setMessage('NFC tag read successfully!');
        setReadData(result.data);
        
        // Notify parent component
        onRead(result.data);
        
        // Reset after delay
        setTimeout(() => {
          setStatus('idle');
          setReadData(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to read NFC tag');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'NFC read failed');
      
      // Auto-retry after delay
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  const stopReading = () => {
    NFC.stop();
    setStatus('idle');
    setMessage('');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>;
      case 'reading':
        return (
          <div className="relative">
            <FaMobileAlt className="text-6xl text-blue-500" />
            {/* Animated NFC waves */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`absolute rounded-full border-2 border-blue-400 ${
                    animationPhase === i ? 'animate-ping' : 'opacity-0'
                  }`}
                  style={{
                    width: `${80 + i * 30}px`,
                    height: `${80 + i * 30}px`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          </div>
        );
      case 'success':
        return <FaCheckCircle className="text-6xl text-green-500 animate-bounce" />;
      case 'error':
        return <FaExclamationTriangle className="text-6xl text-red-500" />;
      default:
        return <FaWifi className="text-6xl text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'reading': return 'blue';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icon Display */}
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h3 
          className={`text-xl font-semibold mb-2 text-${getStatusColor()}-600`}
        >
          {status === 'idle' && 'Ready to Read NFC'}
          {status === 'checking' && 'Checking NFC Support...'}
          {status === 'reading' && 'Reading NFC Tag...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h3>

        <p className="text-gray-600 mb-6">{message}</p>

        {/* Read Data Display */}
        {readData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-700 mb-2">Tag Data:</h4>
            <pre className="text-sm text-gray-600 overflow-x-auto">
              {JSON.stringify(readData, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {status === 'idle' || status === 'error' ? (
            <>
              <button
                onClick={startReading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaWifi />
                {nfcSupported ? 'Start Reading' : 'Use QR Instead'}
              </button>
              
              {showFallback && (
                <button
                  onClick={() => setShowQRFallback(true)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Scan QR Code
                </button>
              )}
            </>
          ) : status === 'reading' ? (
            <button
              onClick={stopReading}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          ) : null}
        </div>

        {/* Device Support Info */}
        {!nfcSupported && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <FaExclamationTriangle className="inline mr-2" />
              NFC requires Chrome on Android. Please use QR code scanning as an alternative.
            </p>
          </div>
        )}

        {/* Instructions */}
        {status === 'reading' && (
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <p>1. Make sure NFC is enabled on your device</p>
            <p>2. Hold the back of your device near the NFC tag</p>
            <p>3. Keep it steady until the tag is read</p>
          </div>
        )}
      </div>

      {/* QR Scanner Fallback */}
      {showQRFallback && (
        <SmartQRScanner
          onScan={(data) => {
            setShowQRFallback(false);
            onRead(data);
          }}
          onClose={() => setShowQRFallback(false)}
          acceptedTypes={acceptedTypes}
        />
      )}
    </>
  );
};