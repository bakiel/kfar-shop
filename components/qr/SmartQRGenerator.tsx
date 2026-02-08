'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { AI } from '@/lib/services/ai';
import { SmartQRContent } from '@/lib/services/ai/types';
import { FaQrcode, FaDownload, FaCopy, FaShare } from 'react-icons/fa';

interface SmartQRGeneratorProps {
  type: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  data: any;
  size?: number;
  logo?: string;
  color?: {
    dark: string;
    light: string;
  };
  onGenerated?: (qrContent: SmartQRContent) => void;
}

export const SmartQRGenerator: React.FC<SmartQRGeneratorProps> = ({
  type,
  data,
  size = 300,
  logo,
  color = { dark: '#000000', light: '#FFFFFF' },
  onGenerated
}) => {
  // Responsive size handling
  const [responsiveSize, setResponsiveSize] = useState(size);
  
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth - 64; // Account for padding
      if (maxWidth < size) {
        setResponsiveSize(Math.min(size, maxWidth, 256)); // Min 256px
      } else {
        setResponsiveSize(size);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrContent, setQrContent] = useState<SmartQRContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    generateSmartQR();
  }, [type, data]);

  const generateSmartQR = async () => {
    try {
      setLoading(true);
      setError('');

      // Generate AI-optimized QR content
      const smartContent = await AI.generateQR(type, data);
      setQrContent(smartContent);

      // Generate QR code image
      const qrOptions: any = {
        width: responsiveSize,
        margin: 2,
        color,
        errorCorrectionLevel: 'H' // High error correction for logo overlay
      };

      // Create compact URL for QR code
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
      const qrUrl = `${baseUrl}/qr/${type}/${smartContent.metadata.security.signature.substring(0, 16)}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, qrOptions);
      
      // Add logo if provided
      if (logo) {
        const finalDataUrl = await addLogoToQR(dataUrl, logo, responsiveSize);
        setQrDataUrl(finalDataUrl);
      } else {
        setQrDataUrl(dataUrl);
      }

      if (onGenerated) {
        onGenerated(smartContent);
      }
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const addLogoToQR = async (qrDataUrl: string, logoUrl: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      canvas.width = size;
      canvas.height = size;

      const qrImg = new Image();
      qrImg.alt = 'QR Code';
      const logoImg = new Image();
      logoImg.alt = 'Logo';

      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, size, size);

        logoImg.onload = () => {
          const logoSize = size * 0.2; // Logo takes 20% of QR code
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Add white background for logo
          ctx.fillStyle = 'white';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // Draw logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          resolve(canvas.toDataURL());
        };

        logoImg.src = logoUrl;
      };

      qrImg.src = qrDataUrl;
    });
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `kfar-${type}-${data.id || 'qr'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyQRLink = async () => {
    if (!qrContent) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
    const qrUrl = `${baseUrl}/qr/${type}/${qrContent.metadata.security.signature.substring(0, 16)}`;
    
    try {
      await navigator.clipboard.writeText(qrUrl);
      // Show success toast
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareQR = async () => {
    if (!navigator.share || !qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `kfar-qr-${type}.png`, { type: 'image/png' });

      await navigator.share({
        title: `KFAR ${type} QR Code`,
        text: `Scan this QR code to access ${type} information`,
        files: [file]
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const getQRTypeInfo = () => {
    const typeInfo = {
      product: { icon: 'fa-box', color: '#478c0b', label: 'Product QR' },
      vendor: { icon: 'fa-store', color: '#f6af0d', label: 'Vendor QR' },
      order: { icon: 'fa-shopping-cart', color: '#c23c09', label: 'Order QR' },
      collection: { icon: 'fa-map-marker-alt', color: '#5C6BC0', label: 'Collection QR' },
      p2p: { icon: 'fa-handshake', color: '#00897B', label: 'P2P Exchange QR' }
    };
    return typeInfo[type] || { icon: 'fa-qrcode', color: '#000000', label: 'QR Code' };
  };

  const typeInfo = getQRTypeInfo();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 qr-container max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: typeInfo.color }}
          >
            <i className={`fas ${typeInfo.icon} text-xl`}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#3a3a1d' }}>
              {typeInfo.label}
            </h3>
            {qrContent && (
              <p className="text-sm text-gray-500">
                v{qrContent.version} • AI Enhanced
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {/* QR Code Display */}
      <div className="text-center mb-6">
        <div 
          className="relative mx-auto qr-container-stable"
          style={{ 
            width: Math.min(responsiveSize + 32, window.innerWidth - 64), // Responsive width
            height: responsiveSize + 32,
            minHeight: responsiveSize + 32, // Prevent collapse
            maxWidth: '100%'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-gray-100 border-2 border-gray-200 rounded-lg">
                <div 
                  className="bg-gray-200 rounded flex items-center justify-center animate-pulse" 
                  style={{ width: size, height: size }}
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div 
                  className="flex flex-col items-center justify-center text-red-600" 
                  style={{ width: size, height: size }}
                >
                  <i className="fas fa-exclamation-circle text-3xl mb-2"></i>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg qr-image-wrapper">
                <img 
                  src={qrDataUrl} 
                  alt={typeInfo.label ? `${typeInfo.label} - Scan this QR code for ${type} information` : "Image"}
                  className="block qr-image"
                  style={{ width: size, height: size }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={downloadQR}
          disabled={loading || !!error}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <FaDownload className="inline mr-2" />
          Download
        </button>
        
        <button
          onClick={copyQRLink}
          disabled={loading || !!error}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <FaCopy className="inline mr-2" />
          Copy Link
        </button>
        
        {navigator.share && (
          <button
            onClick={shareQR}
            disabled={loading || !!error}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <FaShare className="inline mr-2" />
            Share
          </button>
        )}
      </div>

      {/* QR Details */}
      {showDetails && qrContent && (
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">
                {new Date(qrContent.metadata.created).toLocaleString()}
              </p>
            </div>
            
            {qrContent.metadata.expires && (
              <div>
                <span className="text-gray-500">Expires:</span>
                <p className="font-medium">
                  {new Date(qrContent.metadata.expires).toLocaleString()}
                </p>
              </div>
            )}
            
            <div>
              <span className="text-gray-500">Security:</span>
              <p className="font-medium text-green-600">
                <i className="fas fa-shield-alt mr-1"></i>
                Digitally Signed
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">AI Features:</span>
              <p className="font-medium text-blue-600">
                <i className="fas fa-brain mr-1"></i>
                Enhanced
              </p>
            </div>
          </div>

          {/* Payload Preview */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Embedded Data:
            </h4>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(qrContent.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};