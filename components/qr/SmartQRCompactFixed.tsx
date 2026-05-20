'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { AI } from '@/lib/services/ai';
import { SmartQRContent } from '@/lib/services/ai/types';
import { MockAIService } from '@/lib/services/ai/mock-ai-service';
import QRTrackingService from '@/lib/services/qr-tracking-mock';
import { Package, Store, ShoppingCart, MapPin, Handshake, QrCode, AlertCircle, Download, Copy, Share2 } from 'lucide-react';

interface SmartQRCompactFixedProps {
  type: SmartQRContent['type'];
  data: any;
  size?: number;
  hideActions?: boolean;
  onGenerated?: (qrContent: SmartQRContent) => void;
}

export const SmartQRCompactFixed: React.FC<SmartQRCompactFixedProps> = ({
  type,
  data,
  size = 250,
  hideActions = false,
  onGenerated
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrContent, setQrContent] = useState<SmartQRContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    generateQR();
    
    return () => {
      mountedRef.current = false;
    };
  }, [type, data]);

  const generateQR = async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError('');

      // Generate QR content
      let smartContent: SmartQRContent;
      try {
        smartContent = await AI.generateQR(type, data);
      } catch (aiError) {
        smartContent = await MockAIService.generateQR(type, data);
      }
      
      if (!mountedRef.current) return;
      
      setQrContent(smartContent);

      // Generate QR code
      const qrOptions: any = {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      };

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
      const qrUrl = `${baseUrl}/qr/${type}/${smartContent.metadata.security.signature.substring(0, 16)}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, qrOptions) as unknown as string;
      
      if (!mountedRef.current) return;
      
      setQrDataUrl(dataUrl);

      if (onGenerated) {
        onGenerated(smartContent);
      }
      
      // Track QR generation
      QRTrackingService.trackScan({
        type,
        code: qrUrl,
        metadata: {
          ...data,
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

  const downloadQR = () => {
    if (typeof window === 'undefined' || !qrDataUrl) return;
    
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

  const getTypeInfo = () => {
    const typeInfo: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      product: { icon: <Package className="w-3 h-3 stroke-[1.5]" />, color: '#478c0b', label: 'Product QR' },
      vendor: { icon: <Store className="w-3 h-3 stroke-[1.5]" />, color: '#f6af0d', label: 'Vendor QR' },
      order: { icon: <ShoppingCart className="w-3 h-3 stroke-[1.5]" />, color: '#c23c09', label: 'Order QR' },
      collection: { icon: <MapPin className="w-3 h-3 stroke-[1.5]" />, color: '#5C6BC0', label: 'Collection QR' },
      p2p: { icon: <Handshake className="w-3 h-3 stroke-[1.5]" />, color: '#00897B', label: 'P2P Exchange QR' }
    };
    return typeInfo[type] || { icon: <QrCode className="w-3 h-3 stroke-[1.5]" />, color: '#000000', label: 'QR Code' };
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="inline-block">
      <div className="bg-white rounded-lg shadow-md p-4 relative">
        {/* QR Code Container */}
        <div className="relative" style={{ width: size, height: size }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded">
              <AlertCircle className="w-6 h-6 stroke-[1.5] text-red-500" />
            </div>
          ) : qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt={`${typeInfo.label} - Scan this QR code`}
              className="w-full h-full"
            />
          ) : null}
        </div>

        {/* Type Badge - Bottom Center */}
        <div 
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
          style={{ backgroundColor: typeInfo.color }}
        >
          <span className="mr-1">{typeInfo.icon}</span>
          {typeInfo.label}
        </div>
      </div>

      {/* Action Buttons - Below QR Container */}
      {!hideActions && !loading && !error && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={downloadQR}
            aria-label={`Download ${typeInfo.label}`}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 stroke-[1.5] text-gray-700" />
          </button>
          
          <button
            type="button"
            onClick={copyQRLink}
            aria-label={`Copy ${typeInfo.label} link`}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors relative"
            title="Copy Link"
          >
            <Copy className="w-4 h-4 stroke-[1.5] text-gray-700" />
            {showTooltip === 'copied' && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
          
          {typeof window !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={shareQR}
              aria-label={`Share ${typeInfo.label}`}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 stroke-[1.5] text-gray-700" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
