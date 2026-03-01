'use client';

import React, { useState, useEffect } from 'react';
import { SmartQRGenerator } from '../qr/SmartQRGenerator';
import { Handshake, MapPin, Clock, CheckCircle, QrCode, AlertTriangle, Wifi, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface P2POrderTrackerProps {
  orderId: string;
  userRole: 'buyer' | 'seller';
  onComplete?: () => void;
}

interface TrackingTimeline {
  event: string;
  timestamp: string;
  location?: string;
  verified: boolean;
}

interface TrackingData {
  orderId: string;
  orderNumber?: string;
  status: string;
  timeline: TrackingTimeline[];
  verification: {
    method: string;
    code: string;
    expiresAt?: string;
  };
  location?: {
    name: string;
    address: string;
  };
}

export const P2POrderTracker: React.FC<P2POrderTrackerProps> = ({
  orderId,
  userRole,
  onComplete
}) => {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'qr' | 'code'>('code');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    loadTracking();
    // Set up real-time updates
    const interval = setInterval(loadTracking, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTracking = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setNoData(true);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch order');
      }

      const data = await res.json();

      if (!data.success || !data.order) {
        setNoData(true);
        setLoading(false);
        return;
      }

      const order = data.order;

      // Build timeline from order data
      const timeline: TrackingTimeline[] = [];

      if (order.created_at) {
        timeline.push({
          event: 'Order created',
          timestamp: order.created_at,
          verified: true,
        });
      }

      if (order.status === 'processing' || order.status === 'ready' || order.status === 'completed') {
        timeline.push({
          event: 'Order confirmed',
          timestamp: order.updated_at || order.created_at,
          verified: true,
        });
      }

      if (order.status === 'ready' || order.status === 'completed') {
        timeline.push({
          event: 'Ready for pickup',
          timestamp: order.updated_at || order.created_at,
          verified: true,
        });
      }

      if (order.status === 'completed') {
        timeline.push({
          event: 'Exchange completed',
          timestamp: order.updated_at || order.created_at,
          verified: true,
        });
      }

      // Generate verification code from order ID
      const verCode = 'EXCH-' + (order.order_number || orderId).substring(0, 6).toUpperCase();

      const trackingData: TrackingData = {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status || 'pending',
        timeline,
        verification: {
          method: 'code',
          code: verCode,
          expiresAt: order.updated_at ? new Date(new Date(order.updated_at).getTime() + 86400000).toISOString() : undefined,
        },
        location: order.delivery_address ? {
          name: 'Delivery Location',
          address: typeof order.delivery_address === 'string' ? order.delivery_address : (order.delivery_address.address || 'Village of Peace, Dimona'),
        } : undefined,
      };

      setTracking(trackingData);
      setNoData(false);
    } catch (err) {
      console.error('Failed to load tracking:', err);
      setError('Failed to load order tracking');
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!tracking) return;

    try {
      setError('');

      // Update order status via API
      const newStatus = userRole === 'seller' ? 'ready' : 'completed';
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Reload tracking data
        await loadTracking();

        if (newStatus === 'completed' && onComplete) {
          onComplete();
        }
      } else {
        setError('Failed to update status. Please try again.');
      }

      setShowVerification(false);
    } catch (err) {
      setError('Verification failed. Please try again.');
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
        return <Clock className="w-5 h-5 stroke-[1.5] text-yellow-500" />;
      case 'processing':
      case 'ready':
        return <Handshake className="w-5 h-5 stroke-[1.5] text-blue-500" />;
      case 'collected':
        return <CheckCircle className="w-5 h-5 stroke-[1.5] text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 stroke-[1.5] text-green-600" />;
      default:
        return <Clock className="w-5 h-5 stroke-[1.5] text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (!tracking) return '';

    switch (tracking.status) {
      case 'pending':
        return userRole === 'seller'
          ? 'Waiting for you to confirm item is ready'
          : 'Waiting for seller to prepare item';
      case 'processing':
        return 'Order is being processed';
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
        return 'Status: ' + tracking.status;
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

  // Empty state -- no tracking data available
  if (noData || !tracking) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Package className="w-12 h-12 stroke-[1.5] text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500">
            No tracking information available
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            {error || 'This order does not have tracking information yet. Check back later for updates.'}
          </p>
          <Link
            href="/customer/orders"
            className="mt-2 inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full transition-all hover:shadow-md"
            style={{ backgroundColor: '#478c0b', color: 'white' }}
          >
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>
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
            <p className="font-semibold">{tracking.orderNumber || orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Role</p>
            <p className="font-semibold capitalize">{userRole}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verification Code</p>
            <p className="font-mono font-bold text-lg">{tracking.verification.code}</p>
          </div>
          {tracking.verification.expiresAt && (
            <div>
              <p className="text-sm text-gray-500">Expires</p>
              <p className="font-semibold">
                {new Date(tracking.verification.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Location Card */}
      {tracking.location && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 stroke-[1.5] text-red-500" />
            Exchange Location
          </h3>

          <div className="space-y-3">
            <div>
              <p className="font-semibold">{tracking.location.name}</p>
              <p className="text-gray-600">{tracking.location.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {tracking.timeline.length > 0 && (
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
                      <CheckCircle className="w-5 h-5 stroke-[1.5] text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 stroke-[1.5] text-gray-400" />
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
                      <MapPin className="inline w-3.5 h-3.5 stroke-[1.5] mr-1" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            {userRole === 'seller' && tracking.status === 'pending' && 'Mark as Ready'}
            {userRole === 'buyer' && (tracking.status === 'ready' || tracking.status === 'processing') && 'Confirm Collection'}
            {tracking.status === 'collected' && 'Complete Exchange'}
            {!(
              (userRole === 'seller' && tracking.status === 'pending') ||
              (userRole === 'buyer' && (tracking.status === 'ready' || tracking.status === 'processing')) ||
              tracking.status === 'collected'
            ) && 'Update Status'}
          </button>

          <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer">
            Report Issue
          </button>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Verify Exchange</h3>

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
                className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Verify Code
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setShowVerification(false)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
