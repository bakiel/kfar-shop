'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { AI } from '@/lib/services/ai';
import { SmartQRContent } from '@/lib/services/ai/types';
import { MockAIService } from '@/lib/services/ai/mock-ai-service';
import { FaQrcode, FaDownload, FaCopy, FaShare, FaExpand, FaCompress } from 'react-icons/fa';
import QRTrackingService from '@/lib/services/qr-tracking-mock';

interface SmartQRGeneratorCompactProps {
  type: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  data: any;
  size?: number;
  logo?: string;
  color?: {
    dark: string;
    light: string;
  };
  onGenerated?: (qrContent: SmartQRContent) => void;
  compact?: boolean;
}

export const SmartQRGeneratorCompact: React.FC<SmartQRGeneratorCompactProps> = ({
  type,
  data,
  size = 300,
  logo,
  color = { dark: '#000000', light: '#FFFFFF' },
  onGenerated,
  compact = true
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrContent, setQrContent] = useState<SmartQRContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Responsive size handling
  const [responsiveSize, setResponsiveSize] = useState(size);
  
  // Use ref to track if component is mounted
  const mountedRef = useRef(true);

  useEffect(() => {
    setIsMounted(true);
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const handleResize = () => {
      if (!mountedRef.current) return;
      
      // Use default value during SSR
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const maxWidth = screenWidth - 48; // Less padding on mobile
      
      // More aggressive sizing for mobile
      let targetSize = size;
      if (screenWidth < 480) {
        // Mobile: Use more screen space
        targetSize = isExpanded ? Math.min(size, maxWidth * 0.85) : Math.min(size * 0.8, maxWidth * 0.7);
      } else if (screenWidth < 768) {
        // Tablet
        targetSize = isExpanded ? size : size * 0.75;
      } else {
        // Desktop
        targetSize = isExpanded ? size : size * 0.7;
      }
      
      setResponsiveSize(Math.min(targetSize, maxWidth));
    };
    
    handleResize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [size, isExpanded, isMounted]);

  useEffect(() => {
    if (isMounted) {
      generateSmartQR();
    }
  }, [type, data, isMounted]);

  const generateSmartQR = async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError('');

      // Generate AI-optimized QR content with fallback
      let smartContent: SmartQRContent;
      try {
        smartContent = await AI.generateQR(type, data);
      } catch (aiError) {
        console.warn('AI service failed, using mock service:', aiError);
        smartContent = await MockAIService.generateQR(type, data);
      }
      
      if (!mountedRef.current) return;
      
      setQrContent(smartContent);

      // Generate QR code image
      const qrOptions: any = {
        width: responsiveSize,
        margin: 2,
        color,
        errorCorrectionLevel: 'H'
      };

      // Create compact URL for QR code
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
      const qrUrl = `${baseUrl}/qr/${type}/${smartContent.metadata.security.signature.substring(0, 16)}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, qrOptions);
      
      if (!mountedRef.current) return;
      
      // Add logo if provided
      if (logo && typeof window !== 'undefined') {
        const finalDataUrl = await addLogoToQR(dataUrl, logo, responsiveSize);
        setQrDataUrl(finalDataUrl);
      } else {
        setQrDataUrl(dataUrl);
      }

      if (onGenerated) {
        onGenerated(smartContent);
      }
      
      // Track QR generation for analytics
      QRTrackingService.trackScan({
        type,
        code: qrUrl,
        metadata: {
          ...data,
          productName: data.name || data.title,
          vendorId: data.vendorId,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('QR generation error:', err);
      if (mountedRef.current) {
        setError('Failed to generate QR code');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addLogoToQR = async (qrDataUrl: string, logoUrl: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(qrDataUrl);
        return;
      }

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
          const logoSize = size * 0.2;
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
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('a');
    link.download = `kfar-${type}-${data.id || 'qr'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyQRLink = async () => {
    if (!qrContent || typeof window === 'undefined') return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
    const qrUrl = `${baseUrl}/qr/${type}/${qrContent.metadata.security.signature.substring(0, 16)}`;
    
    try {
      await navigator.clipboard.writeText(qrUrl);
      setShowTooltip('copied');
      setTimeout(() => setShowTooltip(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareQR = async () => {
    if (typeof window === 'undefined' || !navigator.share || !qrDataUrl) return;

    try {
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

  // Show loading state during initial mount to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative inline-block">
        <div className="bg-white rounded-lg shadow-md p-3 transition-all duration-300">
          <div 
            className="flex items-center justify-center bg-gray-100 rounded animate-pulse"
            style={{ width: size * 0.7, height: size * 0.7 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Compact view with floating buttons
  if (isExpanded === false) {
    return (
      <div className="relative inline-block qr-compact-container">
        {/* Compact QR Container */}
        <div className="bg-white rounded-lg shadow-md p-3 transition-all duration-300 hover:shadow-lg overflow-hidden">
          <div className="relative">
            {/* QR Code */}
            <div className={`relative mx-auto flex items-center justify-center transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                 style={{ width: responsiveSize, height: responsiveSize }}>
              {!loading && !error && qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt={typeInfo.label ? `${typeInfo.label} - Scan this QR code for ${type} information` : "Image"}
                  className="block w-full h-full object-contain"
                />
              )}
            </div>
            
            {/* Loading State */}
            {loading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded"
                style={{ width: responsiveSize, height: responsiveSize }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-red-50 rounded"
                style={{ width: responsiveSize, height: responsiveSize }}
              >
                <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
              </div>
            )}
            
            {/* Floating Action Buttons */}
            <div className="absolute -right-2 top-0 flex flex-col gap-1">
              <button
                onClick={() => setIsExpanded(true)}
                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all group relative"
                title="Expand"
              >
                <FaExpand className="text-xs text-gray-600 group-hover:text-gray-800" />
                {showTooltip === 'expand' && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Expand View
                  </span>
                )}
              </button>
              
              <button
                onClick={downloadQR}
                disabled={loading || !!error}
                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all group relative disabled:opacity-50"
                title="Download"
                onMouseEnter={() => setShowTooltip('download')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <FaDownload className="text-xs text-gray-600 group-hover:text-gray-800" />
                {showTooltip === 'download' && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Download QR
                  </span>
                )}
              </button>
              
              <button
                onClick={copyQRLink}
                disabled={loading || !!error}
                className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all group relative disabled:opacity-50"
                title="Copy Link"
                onMouseEnter={() => setShowTooltip('copy')}
                onMouseLeave={() => showTooltip !== 'copied' ? setShowTooltip(null) : null}
              >
                <FaCopy className="text-xs text-gray-600 group-hover:text-gray-800" />
                {showTooltip === 'copy' && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Copy Link
                  </span>
                )}
                {showTooltip === 'copied' && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
              
              {typeof window !== 'undefined' && navigator.share && (
                <button
                  onClick={shareQR}
                  disabled={loading || !!error}
                  className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all group relative disabled:opacity-50"
                  title="Share"
                  onMouseEnter={() => setShowTooltip('share')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <FaShare className="text-xs text-gray-600 group-hover:text-gray-800" />
                  {showTooltip === 'share' && (
                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                      Share QR
                    </span>
                  )}
                </button>
              )}
            </div>
            
            {/* Type Badge */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
              style={{ backgroundColor: typeInfo.color }}
            >
              <i className={`fas ${typeInfo.icon} mr-1`}></i>
              {typeInfo.label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view (original design)
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 qr-container max-w-full overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: typeInfo.color }}
          >
            <i className={`fas ${typeInfo.icon} text-lg sm:text-xl`}></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#3a3a1d' }}>
              {typeInfo.label}
            </h3>
            {qrContent && (
              <p className="text-xs sm:text-sm text-gray-500">
                v{qrContent.version} • AI Enhanced
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Compact View"
          >
            <FaCompress />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="text-center mb-3 sm:mb-4 md:mb-6">
        <div 
          className="relative mx-auto qr-container-stable flex items-center justify-center"
          style={{ 
            width: Math.min(responsiveSize + 16, typeof window !== 'undefined' ? window.innerWidth - 32 : responsiveSize + 16),
            height: responsiveSize + 16,
            minHeight: responsiveSize + 16,
            maxWidth: '100%',
            aspectRatio: '1 / 1'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-gray-100 border-2 border-gray-200 rounded-lg">
                <div 
                  className="bg-gray-200 rounded flex items-center justify-center animate-pulse" 
                  style={{ width: responsiveSize, height: responsiveSize }}
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
                  style={{ width: responsiveSize, height: responsiveSize }}
                >
                  <i className="fas fa-exclamation-circle text-3xl mb-2"></i>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : qrDataUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg qr-image-wrapper">
                <img 
                  src={qrDataUrl} 
                  alt={typeInfo.label ? `${typeInfo.label} - Scan this QR code for ${type} information` : "Image"}
                  className="block qr-image"
                  style={{ width: responsiveSize, height: responsiveSize }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons - Mobile optimized */}
      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <button
          onClick={downloadQR}
          disabled={loading || !!error}
          className="flex flex-col items-center justify-center py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <FaDownload className="text-lg sm:text-xl mb-1 text-gray-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Download</span>
        </button>
        
        <button
          onClick={copyQRLink}
          disabled={loading || !!error}
          className="flex flex-col items-center justify-center py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 relative"
        >
          <FaCopy className="text-lg sm:text-xl mb-1 text-gray-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Copy Link</span>
          {showTooltip === 'copied' && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
        
        {typeof window !== 'undefined' && navigator.share ? (
          <button
            onClick={shareQR}
            disabled={loading || !!error}
            className="flex flex-col items-center justify-center py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaShare className="text-lg sm:text-xl mb-1 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Share</span>
          </button>
        ) : (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex flex-col items-center justify-center py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className={`fas fa-info-circle text-lg sm:text-xl mb-1 text-gray-600`}></i>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Details</span>
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
        </div>
      )}
    </div>
  );
};