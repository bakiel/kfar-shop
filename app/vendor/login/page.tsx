'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// All vendor accounts with their IDs
const vendorAccounts = [
  {
    id: 'teva-deli',
    name: 'Teva Deli',
    email: 'admin@tevadeli.com',
    password: 'teva123',
    logo: '/images/vendors/teva_deli_logo_vegan_factory.jpg'
  },
  {
    id: 'queens-cuisine', 
    name: 'Queens Cuisine',
    email: 'admin@queenscuisine.com',
    password: 'queens123',
    logo: '/images/vendors/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg'
  },
  {
    id: 'people-store',
    name: 'People Store',
    email: 'admin@peoplestore.com', 
    password: 'people123',
    logo: '/images/vendors/people_store_logo_community_retail.jpg'
  },
  {
    id: 'garden-of-light',
    name: 'Garden of Light',
    email: 'admin@gardenoflight.com',
    password: 'garden123',
    logo: '/images/vendors/Garden of Light Logo.jpg'
  },
  {
    id: 'vop-shop',
    name: 'VOP Shop',
    email: 'admin@vopshop.com',
    password: 'vop123',
    logo: '/images/vendors/vop_shop_official_logo_master_brand_village_of_peace.jpg'
  },
  {
    id: 'gahn-delight',
    name: 'Gahn Delight',
    email: 'admin@gahndelight.com',
    password: 'gahn123',
    logo: '/images/vendors/gahn_delight_official_logo_master_brand_ice_cream.jpg'
  }
];

export default function VendorLoginPage() {
  const router = useRouter();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showQuickAccess, setShowQuickAccess] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendor = vendorAccounts.find(v => 
      v.email === email && v.password === password
    );

    if (vendor) {
      // Store vendor info in localStorage (in production, use proper auth)
      localStorage.setItem('vendorAuth', JSON.stringify({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorLogo: vendor.logo
      }));
      router.push('/vendor/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  const quickLogin = (vendorId: string) => {
    const vendor = vendorAccounts.find(v => v.id === vendorId);
    if (vendor) {
      localStorage.setItem('vendorAuth', JSON.stringify({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorLogo: vendor.logo
      }));
      router.push('/vendor/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cfe7c1] via-[#fef9ef] to-[#ffeaa7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#3a3a1d' }}>KiFar Marketplace</h1>
          <p className="text-gray-600">Vendor Portal Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Vendor Login</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#478c0b]"
                  placeholder="admin@yourstore.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#478c0b]"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Quick Access for Demo */}
          {showQuickAccess && (
            <div className="bg-gray-50 p-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Quick Demo Access</h3>
                <button
                  onClick={() => setShowQuickAccess(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {vendorAccounts.map((vendor) => (
                  <button
                    key={vendor.id}
                    onClick={() => quickLogin(vendor.id)}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#478c0b] hover:shadow-md transition-all"
                  >
                    <Image
                      src={vendor.logo}
                      alt={vendor.name || "Image"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">{vendor.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                {vendorAccounts.map((vendor) => (
                  <p key={vendor.id}>
                    {vendor.name}: {vendor.email} / {vendor.password}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back to Admin */}
        <div className="text-center mt-6">
          <a href="/admin" className="text-sm text-gray-600 hover:text-[#478c0b]">
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}