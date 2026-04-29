'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import { Package, Store, TrendingUp, DollarSign, LogOut, Plus, Edit } from 'lucide-react';

export default function VendorAdminDashboard() {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading, logout } = useAuth();
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    todayRevenue: 0,
    totalOrders: 0
  });

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken || user?.role !== 'vendor' || !user.vendorId) {
      setLoading(false);
      router.replace('/vendor/login?expired=1');
      return;
    }

    const loadVendor = async () => {
      try {
        const response = await fetch(`/api/vendor/${user.vendorId}`, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`Vendor feed failed: ${response.status}`);

        const data = await response.json();
        const vendor = data.vendor;
        const products = Array.isArray(vendor?.products) ? vendor.products : [];

        if (!vendor) return;

        const normalizedProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || product.images?.[0] || '/images/placeholder-product.jpg',
          inStock: product.inStock !== false,
        }));

        setVendorData({
          ...vendor,
          id: user.vendorId,
          logo: vendor.logo || '/images/vendors/default_logo.jpg',
          products: normalizedProducts,
        });
      
        setStats({
          totalProducts: normalizedProducts.length,
          activeProducts: normalizedProducts.filter((p: any) => p.inStock).length,
          todayRevenue: 0,
          totalOrders: 0,
        });
      } catch (error) {
        console.error('Error loading vendor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendor();
  }, [accessToken, authLoading, router, user?.displayName, user?.role, user?.vendorId]);

  const handleLogout = async () => {
    await logout();
    router.push('/vendor/login');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#478c0b' }}></div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="text-center">
          <p className="text-lg font-medium mb-3" style={{ color: '#3a3a1d' }}>
            Unable to load vendor dashboard.
          </p>
          <Link href="/vendor/login" className="text-[#478c0b] underline">
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              {vendorData.name} Admin
            </h1>
            <p className="mt-2" style={{ color: '#3a3a1d', opacity: 0.8 }}>
              Manage your products and view analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img 
              src={vendorData.logo} 
              alt={vendorData.name}
              className="w-16 h-16 rounded-full object-cover border-2"
              style={{ borderColor: '#f6af0d' }}
            />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: '#478c0b20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Total Products</CardTitle>
              <Package className="h-4 w-4" style={{ color: '#478c0b' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                {stats.totalProducts}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>
                In your catalog
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: '#f6af0d20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Active Products</CardTitle>
              <Store className="h-4 w-4" style={{ color: '#f6af0d' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                {stats.activeProducts}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>
                Currently in stock
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: '#c23c0920' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Today\'s Revenue</CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: '#c23c09' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                ₪{stats.todayRevenue}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>
                From orders today
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: '#478c0b20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Total Orders</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#478c0b' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                {stats.totalOrders}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/vendor/admin/products">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#478c0b20' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <Edit className="h-5 w-5" style={{ color: '#478c0b' }} />
                  Manage Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#3a3a1d', opacity: 0.7 }}>
                  View and edit your product catalog
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/admin/products/add">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#f6af0d20' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <Plus className="h-5 w-5" style={{ color: '#f6af0d' }} />
                  Add New Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#3a3a1d', opacity: 0.7 }}>
                  Create a new product listing
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/vendor/${vendorData.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#c23c0920' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <Store className="h-5 w-5" style={{ color: '#c23c09' }} />
                  View Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#3a3a1d', opacity: 0.7 }}>
                  See your public store page
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Products */}
        <Card className="border-2" style={{ borderColor: '#478c0b20' }}>
          <CardHeader>
            <CardTitle style={{ color: '#3a3a1d' }}>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendorData.products.slice(0, 6).map((product: any) => (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: '#478c0b20' }}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm" style={{ color: '#3a3a1d' }}>
                        {product.name}
                      </h4>
                      <p className="text-sm mt-1" style={{ color: '#478c0b' }}>
                        ₪{product.price.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/vendor/admin/products">
                <Button 
                  className="text-white"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Data Connection Status */}
        <div className="mt-8 p-4 rounded-lg border-2 flex items-center gap-3" 
             style={{ borderColor: '#478c0b20', backgroundColor: '#478c0b05' }}>
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#478c0b' }}></div>
          <p className="text-sm font-medium" style={{ color: '#3a3a1d' }}>
            Connected to Live Marketplace Data
          </p>
        </div>
      </div>
    </div>
  );
}
