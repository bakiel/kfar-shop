'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface SimpleQRProps {
  data: string;
  size?: number;
  className?: string;
}

export default function SimpleQR({ data, size = 256, className = '' }: SimpleQRProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#478c0b',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        if (mounted) {
          setQrUrl(url);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to generate QR code');
          console.error('QR generation error:', err);
        }
      }
    };

    generateQR();

    return () => {
      mounted = false;
    };
  }, [data, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`} style={{ width: size, height: size }}>
        <div className="text-center p-4">
          <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
          <p className="text-sm text-gray-600">QR Error</p>
        </div>
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded animate-pulse ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <img 
      src={qrUrl} 
      alt="QR Code"
      width={size}
      height={size}
      className={className}
    />
  );
}