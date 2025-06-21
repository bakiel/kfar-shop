'use client';

import { useEffect, useState } from 'react';
import { SmartQRCompactFixed } from './SmartQRCompactFixed';
import QRErrorBoundary from './QRErrorBoundary';

interface ClientOnlyQRProps {
  type: 'product' | 'vendor' | 'order' | 'collection' | 'p2p';
  data: any;
  size?: number;
  hideActions?: boolean;
  onGenerated?: (qrContent: any) => void;
}

export default function ClientOnlyQR(props: ClientOnlyQRProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Server-side and initial client render - show loading state
    return (
      <div className="relative inline-block">
        <div className="bg-white rounded-lg shadow-md p-3">
          <div 
            className="flex items-center justify-center bg-gray-100 rounded animate-pulse"
            style={{ 
              width: props.size || 250, 
              height: props.size || 250 
            }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Generating QR...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side only - render the actual QR component
  return (
    <QRErrorBoundary>
      <SmartQRCompactFixed {...props} />
    </QRErrorBoundary>
  );
}