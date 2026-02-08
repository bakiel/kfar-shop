'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Gauge, ShoppingBag, ClipboardList, LogOut, ArrowRight, ShieldCheck, Store, ShoppingCart, Package } from 'lucide-react';

export default function UserAccountDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('customerToken');
    const name = localStorage.getItem('customerName');
    const role = localStorage.getItem('userRole');

    setIsLoggedIn(!!token);
    setUserName(name || '');
    setUserRole(role || 'customer');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerId');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    setIsOpen(false);
    router.push('/');
    window.location.reload();
  };

  const getDashboardLink = () => {
    switch(userRole) {
      case 'admin': return '/admin/dashboard';
      case 'vendor': return '/vendor/dashboard';
      default: return '/customer/dashboard';
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'admin': return <ShieldCheck className="w-5 h-5 stroke-[1.5]" />;
      case 'vendor': return <Store className="w-5 h-5 stroke-[1.5]" />;
      default: return <User className="w-5 h-5 stroke-[1.5]" />;
    }
  };

  return (
    <div className="relative">
      {/* User Icon/Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-lg hover:bg-herbal-mint/20 transition-all duration-300 transform hover:scale-105 group"
      >
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRoleIcon()}</span>
            <span className="hidden md:block text-sm font-medium text-soil-brown">
              {userName.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 stroke-[1.5] text-soil-brown transition-transform duration-300"
               style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 stroke-[1.5] text-soil-brown group-hover:text-leaf-green transition-all duration-300" />
            <span className="hidden md:block text-sm font-medium text-soil-brown">Login</span>
            <ChevronDown className="w-3 h-3 stroke-[1.5] text-soil-brown transition-transform duration-300"
               style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-green-200 z-20 overflow-hidden">
            {isLoggedIn ? (
              <>
                {/* Logged In User Menu */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRoleIcon()}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{userName}</div>
                      <div className="text-sm text-gray-600 capitalize">{userRole} Account</div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <Gauge className="w-4 h-4 stroke-[1.5] text-green-600" />
                    <span>Dashboard</span>
                  </Link>

                  {userRole === 'customer' && (
                    <Link
                      href="/customer/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[1.5] text-purple-600" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  {userRole === 'vendor' && (
                    <Link
                      href="/vendor/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <ClipboardList className="w-4 h-4 stroke-[1.5] text-blue-600" />
                      <span>Orders</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all text-red-600"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.5]" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Login Options Menu */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
                  <div className="font-semibold text-gray-800 mb-1">Choose Your Role</div>
                  <div className="text-sm text-gray-600">Access your specialized portal</div>
                </div>

                <div className="p-2">
                  <Link
                    href="/customer/login?role=customer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-all group"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5 stroke-[1.5] text-purple-500" />
                    <div>
                      <div className="font-medium text-purple-600">Customer Login</div>
                      <div className="text-xs text-gray-500">Shop & track orders</div>
                    </div>
                    <ArrowRight className="w-4 h-4 stroke-[1.5] text-purple-400 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>

                  <Link
                    href="/customer/login?role=vendor"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all group"
                    onClick={() => setIsOpen(false)}
                  >
                    <Store className="w-5 h-5 stroke-[1.5] text-blue-500" />
                    <div>
                      <div className="font-medium text-blue-600">Vendor Portal</div>
                      <div className="text-xs text-gray-500">Manage your store</div>
                    </div>
                    <ArrowRight className="w-4 h-4 stroke-[1.5] text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>

                  <Link
                    href="/customer/login?role=admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-all group"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheck className="w-5 h-5 stroke-[1.5] text-green-500" />
                    <div>
                      <div className="font-medium text-green-600">Admin Access</div>
                      <div className="text-xs text-gray-500">Platform management</div>
                    </div>
                    <ArrowRight className="w-4 h-4 stroke-[1.5] text-green-400 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </div>

                {/* Demo Credentials */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</div>
                  <div className="text-xs space-y-1">
                    <div><strong>Admin:</strong> admin@kfar.com / admin123</div>
                    <div><strong>Vendor:</strong> vendor@tevadeli.com / vendor123</div>
                    <div><strong>Customer:</strong> Any email/password</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
