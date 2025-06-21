'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Heart, MapPin, Gift, TrendingUp, Clock } from 'lucide-react';

export default function CustomerDashboard() {
  // Mock data - in production, this would come from API
  const customerData = {
    name: 'John Doe',
    memberSince: '2024',
    loyaltyPoints: 150,
    recentOrders: [
      { id: 'ORD-001', date: '2025-01-05', total: 234.50, status: 'Delivered' },
      { id: 'ORD-002', date: '2025-01-03', total: 89.99, status: 'In Transit' },
    ],
    savedItems: 5,
    addresses: 2,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
          Welcome back, {customerData.name}!
        </h1>
        <p className="text-gray-600">
          Member since {customerData.memberSince} | {customerData.loyaltyPoints} Loyalty Points
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <ShoppingBag className="h-4 w-4" style={{ color: '#478c0b' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.recentOrders.length}</div>
            <Link href="/customer/orders" className="text-xs" style={{ color: '#478c0b' }}>
              View all →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4" style={{ color: '#c23c09' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.savedItems}</div>
            <Link href="/customer/wishlist" className="text-xs" style={{ color: '#478c0b' }}>
              View wishlist →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4" style={{ color: '#f6af0d' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.addresses}</div>
            <Link href="/customer/addresses" className="text-xs" style={{ color: '#478c0b' }}>
              Manage →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4" style={{ color: '#478c0b' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.loyaltyPoints}</div>
            <span className="text-xs text-gray-600">Points available</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" style={{ color: '#478c0b' }} />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerData.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₪{order.total.toFixed(2)}</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/customer/orders" 
            className="block mt-4 text-center py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#478c0b', color: 'white' }}
          >
            View All Orders
          </Link>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: '#f6af0d' }} />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Based on your preferences and purchase history
          </p>
          <Link 
            href="/marketplace" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#f6af0d', color: 'white' }}
          >
            Explore Marketplace
            <i className="fas fa-arrow-right"></i>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}