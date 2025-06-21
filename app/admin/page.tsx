'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import { Package, Store, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import { dataIntegration } from '@/lib/services/data-integration';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeVendors: 0,
    todayRevenue: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Initialize data and get real stats
    const loadStats = async () => {
      try {
        // Get products from data integration service
        const totalProducts = Object.values(vendorStores)
          .reduce((sum, vendor) => sum + vendor.products.length, 0);
        
        const activeVendors = Object.keys(vendorStores).length;
        
        setStats({
          totalProducts,
          activeVendors,
          todayRevenue: 0, // Will be connected to real revenue data
          activeUsers: 0 // Will be connected to real user data
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>KFAR Marketplace Admin</h1>
          <p className="mt-2" style={{ color: '#3a3a1d', opacity: 0.8 }}>Manage vendors, products, and marketplace operations</p>
        </div>
      
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: loading ? '#e5e7eb' : '#478c0b20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Total Products</CardTitle>
              <Package className="h-4 w-4" style={{ color: '#478c0b' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                {loading ? '...' : stats.totalProducts}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>Active in marketplace</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: loading ? '#e5e7eb' : '#f6af0d20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Active Vendors</CardTitle>
              <Store className="h-4 w-4" style={{ color: '#f6af0d' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                {loading ? '...' : stats.activeVendors}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>Verified vendors</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: loading ? '#e5e7eb' : '#c23c0920' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: '#c23c09' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                ₪{loading ? '...' : stats.todayRevenue}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>Ready for orders</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: loading ? '#e5e7eb' : '#478c0b20' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Active Users</CardTitle>
              <Users className="h-4 w-4" style={{ color: '#478c0b' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                {loading ? '...' : stats.activeUsers}
              </div>
              <p className="text-xs" style={{ color: '#3a3a1d', opacity: 0.7 }}>Awaiting launch</p>
            </CardContent>
          </Card>
        </div>
      
        {/* Vendor Management */}
        <Card className="mb-8 border-2 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: '#478c0b20' }}>
          <CardHeader>
            <CardTitle style={{ color: '#3a3a1d' }}>Vendor Management</CardTitle>
            <CardDescription style={{ color: '#3a3a1d', opacity: 0.7 }}>Manage vendor accounts and their products</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#478c0b' }}></div>
                <p className="mt-4" style={{ color: '#3a3a1d', opacity: 0.7 }}>Loading vendors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(vendorStores).map(([vendorId, vendor]) => (
                  <div key={vendorId} className="border-2 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-102" style={{ borderColor: '#478c0b20' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: '#3a3a1d' }}>{vendor.name}</h3>
                        <p className="text-sm" style={{ color: '#478c0b' }}>{vendor.products.length} products</p>
                      </div>
                      <img 
                        src={vendor.logo} 
                        alt={vendor.name}
                        className="w-12 h-12 rounded-full object-cover border-2"
                        style={{ borderColor: '#f6af0d' }}
                      />
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#3a3a1d', opacity: 0.7 }}>{vendor.description}</p>
                    <Link href={`/admin/vendor/${vendorId}`}>
                      <Button 
                        size="sm" 
                        className="w-full text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        Manage Vendor
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/vendors">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#478c0b20' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <Store className="h-5 w-5" style={{ color: '#478c0b' }} />
                  All Vendors
                </CardTitle>
                <CardDescription style={{ color: '#3a3a1d', opacity: 0.7 }}>View and manage all vendors</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/revenue-feed">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#f6af0d20' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: '#f6af0d' }} />
                  Revenue Analytics
                </CardTitle>
                <CardDescription style={{ color: '#3a3a1d', opacity: 0.7 }}>Track sales and performance</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/templates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:scale-102" style={{ borderColor: '#c23c0920' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: '#c23c09' }} />
                  Store Templates
                </CardTitle>
                <CardDescription style={{ color: '#3a3a1d', opacity: 0.7 }}>Manage vendor page templates</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
