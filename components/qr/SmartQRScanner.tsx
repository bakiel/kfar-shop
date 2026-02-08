'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { AI } from '@/lib/services/ai';
import { FaCamera, FaUpload, FaTimes, FaQrcode } from 'react-icons/fa';

interface SmartQRScannerProps {
  onScan: (data: any) => void;
  onClose?: () => void;
  acceptedTypes?: string[];
  showUpload?: boolean;
}

export const SmartQRScanner: React.FC<SmartQRScannerProps> = ({
  onScan,
  onClose,
  acceptedTypes = ['product', 'vendor', 'order', 'collection', 'p2p'],
  showUpload = true
}) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    checkCameraPermission();
    if (scanning && cameraPermission === 'granted') {
      startScanning();
    }
    
    return () => {
      stopScanning();
    };
  }, [scanning, cameraPermission]);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (err) {
      console.error('Permission check failed:', err);
    }
  };

  const startScanning = async () => {
    try {
      if (!videoRef.current) return;
      
      readerRef.current = new BrowserQRCodeReader();
      const devices = await readerRef.current.listVideoInputDevices();
      
      if (devices.length === 0) {
        setError('No camera found');
        return;
      }

      // Prefer back camera on mobile
      const selectedDevice = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || devices[0];

      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        async (result, error) => {
          if (result) {
            await handleQRCode(result.getText());
          }
          if (error && error.message !== 'NotFoundException') {
            console.error('Scan error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError('Failed to access camera');
      setCameraPermission('denied');
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
  };

  const handleQRCode = async (qrData: string) => {
    try {
      setProcessing(true);
      stopScanning();
      
      // Parse QR data
      let parsedData: any;
      
      // Check if it's a KFAR QR URL
      if (qrData.includes('kfar.market/qr/')) {
        const urlParts = qrData.split('/');
        const type = urlParts[urlParts.length - 2];
        const signature = urlParts[urlParts.length - 1];
        
        // Verify QR code with backend
        const response = await fetch('/api/qr/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature, type })
        });
        
        if (!response.ok) {
          throw new Error('Invalid or expired QR code');
        }
        
        parsedData = await response.json();
      } else {
        // Try to parse as JSON
        try {
          parsedData = JSON.parse(qrData);
        } catch {
          // Not JSON, treat as plain text
          parsedData = { type: 'unknown', data: qrData };
        }
      }

      // Validate QR type
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(parsedData.type)) {
        throw new Error(`Invalid QR type. Expected: ${acceptedTypes.join(', ')}`);
      }

      setScanResult(parsedData);
      
      // Process with AI for enhanced information
      if (parsedData.type === 'product' && parsedData.productId) {
        const recommendations = await AI.recommend(
          'current-user', 
          { scannedProduct: parsedData.productId }
        );
        parsedData.aiRecommendations = recommendations;
      }

      onScan(parsedData);
      
    } catch (err) {
      console.error('QR processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      setScanning(true); // Resume scanning
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setError('');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        // Use Gemini to read QR from image
        const result = await AI.generateQR('scan', { imageData });
        
        if (result && result.payload) {
          await handleQRCode(JSON.stringify(result.payload));
        } else {
          setError('No QR code found in image');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setScanning(true);
    } catch (err) {
      setCameraPermission('denied');
      setError('Camera permission denied');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#3a3a1d' }}>
            <FaQrcode className="text-green-600" />
            Smart QR Scanner
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Scanner Area */}
        <div className="relative bg-black" style={{ height: '400px' }}>
          {cameraPermission === 'denied' ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center">
              <div>
                <FaCamera className="text-6xl mb-4 mx-auto opacity-50" />
                <p className="mb-4">Camera access is required to scan QR codes</p>
                <button
                  onClick={requestCameraPermission}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Enable Camera
                </button>
              </div>
            </div>
          ) : scanning ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning Frame */}
                  <div className="w-64 h-64 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br"></div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute inset-x-0 h-1 bg-green-500 opacity-75 animate-scan"></div>
                  </div>
                  
                  <p className="text-white text-center mt-4 text-sm">
                    Position QR code within frame
                  </p>
                </div>
              </div>
            </>
          ) : processing ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Processing QR code...</p>
              </div>
            </div>
          ) : scanResult ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-3xl"></i>
                </div>
                <p className="text-lg font-medium mb-2">QR Code Scanned!</p>
                <p className="text-sm opacity-75">Type: {scanResult.type}</p>
              </div>
            </div>
          ) : null}

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50">
          {showUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaUpload />
                Upload QR Image
              </button>
            </>
          )}

          {/* Accepted Types */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Scanning for: {acceptedTypes.join(', ')}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};