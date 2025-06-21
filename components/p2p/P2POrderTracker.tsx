'use client';

import React, { useState, useEffect } from 'react';
import { CollectionPoints } from '@/lib/services/collection-point-service';
import { P2POrderTracking } from '@/lib/services/ai/types';
import { SmartQRGenerator } from '../qr/SmartQRGenerator';
import { NFCReader } from '../nfc/NFCReader';
import { FaHandshake, FaMapMarkerAlt, FaClock, FaCheckCircle, FaQrcode } from 'react-icons/fa';

interface P2POrderTrackerProps {
  orderId: string;
  userRole: 'buyer' | 'seller';
  onComplete?: () => void;
}

export const P2POrderTracker: React.FC<P2POrderTrackerProps> = ({
  orderId,
  userRole,
  onComplete
}) => {
  const [tracking, setTracking] = useState<P2POrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'qr' | 'nfc' | 'code'>('qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTracking();
    // Set up real-time updates
    const interval = setInterval(loadTracking, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTracking = async () => {
    try {
      // In real implementation, this would fetch from API
      // For demo, we'll use the collection service
      const mockTracking: P2POrderTracking = {
        orderId,
        status: 'ready',
        participants: {
          buyer: 'buyer-123',
          seller: 'seller-456'
        },
        timeline: [
          {
            event: 'Order created',
            timestamp: new Date(Date.now() - 3600000),
            verified: true
          },
          {
            event: 'Exchange point selected',
            timestamp: new Date(Date.now() - 1800000),
            location: 'Community Plaza P2P Exchange',
            verified: true
          }
        ],
        verification: {
          method: 'qr',
          code: 'EXCH-' + orderId.substring(0, 6).toUpperCase(),
          expiresAt: new Date(Date.now() + 86400000) // 24 hours
        }
      };

      // Get collection point details
      const point = await CollectionPoints.getById('cp-003');
      if (point) {
        mockTracking.location = point;
      }

      setTracking(mockTracking);
    } catch (err) {
      console.error('Failed to load tracking:', err);
      setError('Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!tracking) return;

    try {
      setError('');
      
      // Update status based on user role
      const newStatus = userRole === 'seller' ? 'ready' : 'collected';
      const updated = await CollectionPoints.updateP2P(orderId, newStatus, userRole);
      
      if (updated) {
        setTracking(updated);
        
        // Check if both parties have verified
        if (updated.status === 'completed') {
          if (onComplete) onComplete();
        }
      }
      
      setShowVerification(false);
    } catch (err) {
      setError('Verification failed. Please try again.');
    }
  };

  const handleQRScan = (data: any) => {
    if (data.orderId === orderId) {
      handleVerification();
    } else {
      setError('Invalid QR code for this order');
    }
  };

  const handleNFCRead = (data: any) => {
    if (data.orderId === orderId) {
      handleVerification();
    } else {
      setError('Invalid NFC tag for this order');
    }
  };

  const handleCodeVerification = () => {
    if (verificationCode === tracking?.verification.code) {
      handleVerification();
    } else {
      setError('Invalid verification code');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'ready':
        return <FaHandshake className="text-blue-500" />;
      case 'collected':
        return <FaCheckCircle className="text-green-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (!tracking) return '';
    
    switch (tracking.status) {
      case 'pending':
        return userRole === 'seller' 
          ? 'Waiting for you to confirm item is ready'
          : 'Waiting for seller to prepare item';
      case 'ready':
        return userRole === 'buyer'
          ? 'Item is ready for pickup'
          : 'Waiting for buyer to collect';
      case 'collected':
        return userRole === 'seller'
          ? 'Buyer has collected. Please confirm handoff'
          : 'Please confirm you received the item';
      case 'completed':
        return 'Exchange completed successfully!';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order tracking...</p>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="text-center py-8">
        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Order tracking not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
            P2P Exchange Tracking
          </h2>
          <div className="flex items-center gap-2">
            {getStatusIcon(tracking.status)}
            <span className="font-semibold capitalize">{tracking.status}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{getStatusMessage()}</p>

        {/* Exchange Details */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-semibold">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Role</p>
            <p className="font-semibold capitalize">{userRole}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verification Code</p>
            <p className="font-mono font-bold text-lg">{tracking.verification.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expires</p>
            <p className="font-semibold">
              {new Date(tracking.verification.expiresAt!).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Location Card */}
      {tracking.location && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" />
            Exchange Location
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{tracking.location.name}</p>
              <p className="text-gray-600">{tracking.location.location.address}</p>
            </div>

            {/* Map Preview */}
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map Preview</p>
            </div>

            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
              <FaMapMarkerAlt className="inline mr-2" />
              Get Directions
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Exchange Timeline</h3>
        
        <div className="space-y-4">
          {tracking.timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.verified ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {event.verified ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaClock className="text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{event.event}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-500">
                    <FaMapMarkerAlt className="inline mr-1" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code for Exchange */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Exchange QR Code</h3>
        <p className="text-gray-600 mb-4">
          Show this to the {userRole === 'buyer' ? 'seller' : 'buyer'} to verify the exchange
        </p>
        
        <SmartQRGenerator
          type="p2p"
          data={{
            orderId,
            role: userRole,
            code: tracking.verification.code
          }}
          size={250}
        />
      </div>

      {/* Action Buttons */}
      {tracking.status !== 'completed' && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowVerification(true)}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            {userRole === 'seller' && tracking.status === 'pending' && 'Mark as Ready'}
            {userRole === 'buyer' && tracking.status === 'ready' && 'Confirm Collection'}
            {tracking.status === 'collected' && 'Complete Exchange'}
          </button>
          
          <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
            Report Issue
          </button>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Verify Exchange</h3>
            
            {/* Verification Method Tabs */}
            <div className="flex gap-2 mb-6">
              {['qr', 'nfc', 'code'].map((method) => (
                <button
                  key={method}
                  onClick={() => setVerificationMethod(method as any)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    verificationMethod === method
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method === 'qr' && <FaQrcode className="inline mr-2" />}
                  {method === 'nfc' && <FaWifi className="inline mr-2" />}
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Verification Content */}
            {verificationMethod === 'qr' && (
              <div>
                <p className="text-gray-600 mb-4">
                  Scan the {userRole === 'buyer' ? "seller's" : "buyer's"} QR code
                </p>
                <SmartQRScanner
                  onScan={handleQRScan}
                  acceptedTypes={['p2p']}
                  showUpload={false}
                />
              </div>
            )}

            {verificationMethod === 'nfc' && (
              <NFCReader
                onRead={handleNFCRead}
                acceptedTypes={['p2p']}
                autoStart={true}
              />
            )}

            {verificationMethod === 'code' && (
              <div>
                <p className="text-gray-600 mb-4">
                  Enter the verification code shown by the {userRole === 'buyer' ? 'seller' : 'buyer'}
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="EXCH-XXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg text-center uppercase"
                  maxLength={12}
                />
                <button
                  onClick={handleCodeVerification}
                  className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Verify Code
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setShowVerification(false)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};