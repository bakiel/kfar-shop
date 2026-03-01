'use client';

import React, { useState } from 'react';
import { 
  User, 
  QrCode, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Heart, 
  Gift, 
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SafeQR from '@/components/qr/SafeQR';

interface CustomerQuickAccessProps {
  isCompact?: boolean;
}

export default function CustomerQuickAccess({ isCompact = false }: CustomerQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: 'Guest',
    points: 0,
    tier: 'Bronze',
    qrCode: ''
  });
  const router = useRouter();

  const handleQuickLogin = async (method: 'phone' | 'qr', data: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'phone' ? { phone: data } : { qrCode: data }),
      });
      if (res.ok) {
        const body = await res.json();
        setIsLoggedIn(true);
        setCustomerData({
          name: body.user?.displayName || body.user?.email?.split('@')[0] || 'Customer',
          points: body.user?.loyaltyPoints || 0,
          tier: body.user?.tier || 'Bronze',
          qrCode: `KFAR-CUST-${body.user?.id || Date.now()}`
        });
      }
    } catch {
      console.error('Login failed');
    }
    setIsOpen(false);
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      handleQuickLogin('phone', phoneNumber);
    }
  };

  const handleQRScanned = (data: string) => {
    handleQuickLogin('qr', data);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCustomerData({
      name: 'Guest',
      points: 0,
      tier: 'Bronze',
      qrCode: ''
    });
  };

  if (isCompact) {
    // Mobile/compact version
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: '#3a3a1d' }}
        >
          <User className="h-5 w-5" />
          {isLoggedIn && (
            <span className="text-sm font-medium">{customerData.points} pts</span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
            {isLoggedIn ? (
              <CustomerMenu customerData={customerData} onLogout={handleLogout} />
            ) : (
              <LoginOptions 
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                onPhoneLogin={handlePhoneLogin}
                showQRLogin={showQRLogin}
                setShowQRLogin={setShowQRLogin}
                onQRScanned={handleQRScanned}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: '#3a3a1d' }}
      >
        <User className="h-5 w-5" />
        <span className="font-medium">
          {isLoggedIn ? customerData.name : 'Customer Access'}
        </span>
        {isLoggedIn && (
          <span className="ml-2 px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: customerData.tier === 'Gold' ? '#f6af0d' : '#478c0b',
              color: 'white'
            }}
          >
            {customerData.tier} • {customerData.points} pts
          </span>
        )}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          {isLoggedIn ? (
            <CustomerMenu customerData={customerData} onLogout={handleLogout} />
          ) : (
            <LoginOptions 
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onPhoneLogin={handlePhoneLogin}
              showQRLogin={showQRLogin}
              setShowQRLogin={setShowQRLogin}
              onQRScanned={handleQRScanned}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Login Options Component
function LoginOptions({ 
  phoneNumber, 
  setPhoneNumber, 
  onPhoneLogin, 
  showQRLogin, 
  setShowQRLogin,
  onQRScanned 
}: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
        Quick Access
      </h3>
      
      {!showQRLogin ? (
        <>
          {/* Phone Number Login */}
          <form onSubmit={onPhoneLogin} className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="054-123-4567"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#478c0b', color: 'white' }}
              >
                Login
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* QR Code Option */}
          <button
            onClick={() => setShowQRLogin(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#e5e7eb' }}
          >
            <QrCode className="h-5 w-5" style={{ color: '#478c0b' }} />
            <span>Use QR Code</span>
          </button>

          {/* New Customer Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              New to KFAR?{' '}
              <Link href="/join-kfar" className="font-medium" style={{ color: '#478c0b' }}>
                Join now
              </Link>
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            Show your QR code to the camera
          </p>
          <div className="mb-4">
            {/* QR Scanner would go here */}
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setShowQRLogin(false)}
            className="text-sm" style={{ color: '#478c0b' }}
          >
            ← Back to phone login
          </button>
        </div>
      )}
    </div>
  );
}

// Customer Menu Component
function CustomerMenu({ customerData, onLogout }: any) {
  return (
    <div className="p-6">
      {/* Customer Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#3a3a1d' }}>
            {customerData.name}
          </h3>
          <p className="text-sm text-gray-600">
            {customerData.tier} Member • {customerData.points} points
          </p>
        </div>
        <div className="w-16 h-16">
          <SafeQR 
            value={customerData.qrCode}
            size={64}
          />
        </div>
      </div>

      {/* Quick Links */}
      <nav className="space-y-2">
        <Link 
          href="/customer/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <User className="h-4 w-4" style={{ color: '#478c0b' }} />
          <span>My Dashboard</span>
        </Link>

        <Link 
          href="/customer/orders"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="h-4 w-4" style={{ color: '#478c0b' }} />
          <span>My Orders</span>
        </Link>

        <Link 
          href="/customer/rewards"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Gift className="h-4 w-4" style={{ color: '#478c0b' }} />
          <span>Rewards & Points</span>
        </Link>

        <Link 
          href="/customer/wishlist"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Heart className="h-4 w-4" style={{ color: '#478c0b' }} />
          <span>Wishlist</span>
        </Link>

        <Link 
          href="/customer/preferences"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" style={{ color: '#478c0b' }} />
          <span>Preferences</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="mt-6 pt-6 border-t">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
