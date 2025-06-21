'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamic import to prevent SSR issues
const SimpleQR = dynamic(() => import('./SimpleQR'), {
  ssr: false,
  loading: () => (
    <div className="inline-block bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center justify-center bg-gray-100 rounded animate-pulse" style={{ width: 250, height: 250 }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading QR...</p>
        </div>
      </div>
    </div>
  )
});

interface SafeQRProps {
  type: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  data: any;
  size?: number;
  compact?: boolean;
  onGenerated?: (qrContent: any) => void;
}

export default function SafeQR({ type, data, size = 250, compact = true, onGenerated }: SafeQRProps) {
  // Convert data to a simple string for QR code
  const qrData = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market';
    const id = data.id || `${type}-${Date.now()}`;
    
    // Create a simple URL that contains the essential data
    const qrObject = {
      type,
      id,
      amount: data.amount || data.total,
      timestamp: data.timestamp || Date.now()
    };
    
    // Encode data as base64 to avoid URL encoding issues
    const encoded = btoa(JSON.stringify(qrObject));
    return `${baseUrl}/qr/${type}/${id}?data=${encoded}`;
  }, [type, data]);

  const displaySize = compact ? size * 0.8 : size;

  return (
    <div className="inline-block">
      <div className={`bg-white rounded-lg shadow-md ${compact ? 'p-3' : 'p-6'}`}>
        <SimpleQR data={qrData} size={displaySize} />
        
        {!compact && (
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {type === 'order' ? 'Order QR' : 
               type === 'product' ? 'Product QR' :
               type === 'vendor' ? 'Vendor QR' : 'QR Code'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Scan to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}