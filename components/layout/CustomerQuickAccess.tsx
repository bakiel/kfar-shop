'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CustomerQuickAccess = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'vendor'>('customer');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if customer is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('customerToken');
      const name = localStorage.getItem('customerName');
      const role = localStorage.getItem('userRole') as 'customer' | 'admin' | 'vendor' || 'customer';
      
      if (token) {
        setIsLoggedIn(true);
        setCustomerName(name || 'Customer');
        setUserRole(role);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerId');
    setIsLoggedIn(false);
    setIsOpen(false);
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <Link
        href="/customer/login"
        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-leaf-green text-white hover:bg-opacity-90 transition-all"
      >
        <i className="fas fa-user"></i>
        <span className="font-medium">Login</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-herbal-mint/20 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-leaf-green text-white flex items-center justify-center">
          <i className="fas fa-user text-sm"></i>
        </div>
        <span className="hidden sm:block text-sm font-medium text-soil-brown">
          {customerName}
        </span>
        <i className={`fas fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-leaf-green/20 overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 bg-herbal-mint/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-leaf-green text-white flex items-center justify-center">
                <i className="fas fa-user text-lg"></i>
              </div>
              <div>
                <p className="font-semibold text-soil-brown">{customerName}</p>
                <p className="text-xs text-gray-600">
                  {userRole === 'admin' ? 'Administrator' : userRole === 'vendor' ? 'Vendor' : 'KFAR Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-2">
            <Link
              href="/customer/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-tachometer-alt text-leaf-green"></i>
              <span className="text-soil-brown">My Dashboard</span>
            </Link>
            
            <Link
              href="/customer/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-shopping-bag text-sun-gold"></i>
              <span className="text-soil-brown">My Orders</span>
            </Link>
            
            <Link
              href="/customer/qr-code"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-qrcode text-terra-cotta"></i>
              <span className="text-soil-brown">My QR Code</span>
            </Link>
            
            <Link
              href="/customer/rewards"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-star text-sun-gold"></i>
              <span className="text-soil-brown">Rewards</span>
              <span className="ml-auto bg-sun-gold text-white text-xs px-2 py-1 rounded-full">
                1,250 pts
              </span>
            </Link>
            
            <Link
              href="/customer/preferences"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-cog text-gray-600"></i>
              <span className="text-soil-brown">Preferences</span>
            </Link>
          </div>

          {/* Admin Access - Show only for admin users */}
          {userRole === 'admin' && (
            <>
              <div className="border-t my-2"></div>
              <div className="p-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-shield-alt text-red-600"></i>
                  <span className="text-red-600 font-medium">Admin Dashboard</span>
                </Link>
                <Link
                  href="/admin/vendors"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-store text-red-600"></i>
                  <span className="text-red-600">Manage Vendors</span>
                </Link>
                <Link
                  href="/admin/revenue-feed"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-chart-line text-red-600"></i>
                  <span className="text-red-600">Revenue Analytics</span>
                </Link>
              </div>
            </>
          )}

          {/* Vendor Access - Show only for vendor users */}
          {userRole === 'vendor' && (
            <>
              <div className="border-t my-2"></div>
              <div className="p-2">
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sun-gold/20 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-store text-sun-gold"></i>
                  <span className="text-sun-gold font-medium">Vendor Dashboard</span>
                </Link>
                <Link
                  href="/vendor/products"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sun-gold/20 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-box text-sun-gold"></i>
                  <span className="text-sun-gold">My Products</span>
                </Link>
                <Link
                  href="/vendor/analytics"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sun-gold/20 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-chart-bar text-sun-gold"></i>
                  <span className="text-sun-gold">Analytics</span>
                </Link>
              </div>
            </>
          )}

          {/* Logout */}
          <div className="border-t p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all text-left"
            >
              <i className="fas fa-sign-out-alt text-red-600"></i>
              <span className="text-red-600">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerQuickAccess;