'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorName: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
}

export default function CustomerOrders() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Mock data - in production, this would come from API
  const orders: Order[] = [
    {
      id: 'ORD-2025-001',
      date: '2025-01-05',
      total: 234.50,
      status: 'delivered',
      items: [
        {
          id: 'prod1',
          name: 'Organic Tahini',
          price: 45.00,
          quantity: 2,
          image: '/images/products/tahini.jpg',
          vendorName: 'Garden of Light'
        },
        {
          id: 'prod2',
          name: 'Vegan Burger Patties',
          price: 72.25,
          quantity: 2,
          image: '/images/products/burger.jpg',
          vendorName: 'Teva Deli'
        }
      ],
      deliveryAddress: '123 Peace Street, Dimona',
      paymentMethod: 'Credit Card ending in 4567',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-2025-002',
      date: '2025-01-03',
      total: 89.99,
      status: 'shipped',
      items: [
        {
          id: 'prod3',
          name: 'Chocolate Ice Cream',
          price: 89.99,
          quantity: 1,
          image: '/images/products/ice-cream.jpg',
          vendorName: 'Gahn Delight'
        }
      ],
      deliveryAddress: '123 Peace Street, Dimona',
      paymentMethod: 'PayPal',
      trackingNumber: 'TRK987654321'
    }
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#f6af0d'; // gold
      case 'processing':
        return '#478c0b'; // green
      case 'shipped':
        return '#3b82f6'; // blue
      case 'delivered':
        return '#10b981'; // emerald
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
          Order History
        </h1>
        <p className="text-gray-600">
          Track and manage your orders
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Ordered on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">₪{order.total.toFixed(2)}</p>
                  <span 
                    className="text-sm font-medium capitalize px-3 py-1 rounded-full inline-block mt-1"
                    style={{ 
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Order Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} • 
                  {order.status === 'shipped' || order.status === 'delivered' ? (
                    <span className="ml-2">
                      Tracking: <span className="font-mono">{order.trackingNumber}</span>
                    </span>
                  ) : null}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>Hide Details <ChevronUp className="ml-1 w-4 h-4" /></>
                  ) : (
                    <>Show Details <ChevronDown className="ml-1 w-4 h-4" /></>
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.vendorName} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">₪{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Delivery Address</p>
                      <p>{order.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Payment Method</p>
                      <p>{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {order.status === 'delivered' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ borderColor: '#478c0b', color: '#478c0b' }}
                      >
                        Leave Review
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Invoice
                    </Button>
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ borderColor: '#f6af0d', color: '#f6af0d' }}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <Link href="/marketplace">
              <Button style={{ backgroundColor: '#478c0b' }} className="text-white">
                Browse Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}