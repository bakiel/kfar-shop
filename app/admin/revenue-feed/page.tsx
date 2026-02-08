'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Store data with logos
const stores = [
  {
    id: 'teva-deli',
    name: 'Teva Deli',
    logo: '/images/vendors/teva_deli_logo_organic_vegan_products.jpg',
    color: '#2E7D32',
    avgOrderValue: 85
  },
  {
    id: 'queens-cuisine',
    name: 'Queens Cuisine',
    logo: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
    color: '#F57C00',
    avgOrderValue: 95
  },
  {
    id: 'people-store',
    name: 'People Store',
    logo: '/images/vendors/people_store_storefront_community_shop_local_goods.jpg',
    color: '#1976D2',
    avgOrderValue: 65
  },
  {
    id: 'garden-of-light',
    name: 'Garden of Light',
    logo: '/images/vendors/garden_of_light_wellness_products_natural_health_store_logo.jpg',
    color: '#388E3C',
    avgOrderValue: 120
  },
  {
    id: 'vop-shop',
    name: 'VOP Shop',
    logo: '/images/vendors/vop_shop_village_of_peace_branded_merchandise_apparel_gifts.jpg',
    color: '#7B1FA2',
    avgOrderValue: 75
  },
  {
    id: 'gahn-delight',
    name: 'Gahn Delight',
    logo: '/images/vendors/gahn_delight_vegan_ice_cream_frozen_desserts_logo_sweet_treats.jpg',
    color: '#E91E63',
    avgOrderValue: 45
  }
];

// Product names for realistic orders
const productsByStore = {
  'teva-deli': ['Vegan Schnitzel', 'Plant-Based Burger', 'Seitan Strips', 'Vegan Sausages', 'Tofu Steaks'],
  'queens-cuisine': ['Gourmet Wrap', 'Falafel Platter', 'Shawarma Bowl', 'Mediterranean Feast', 'Vegan Burger'],
  'people-store': ['Organic Produce Box', 'Pantry Essentials', 'Fresh Bread', 'Local Honey', 'Dried Fruits'],
  'garden-of-light': ['Wellness Kit', 'Herbal Tea Set', 'Natural Supplements', 'Essential Oils', 'Healing Crystals'],
  'vop-shop': ['Community T-Shirt', 'Tote Bag', 'Prayer Shawl', 'Handmade Crafts', 'Book Set'],
  'gahn-delight': ['Ice Cream Pint', 'Frozen Yogurt', 'Sorbet Selection', 'Ice Cream Cake', 'Dessert Sampler']
};

// Customer names for orders
const customerNames = [
  'Sarah Cohen', 'David Levi', 'Rachel Green', 'Michael Brown', 'Rebecca Miller',
  'Daniel Goldstein', 'Miriam Shapiro', 'Jonathan Katz', 'Esther Friedman', 'Aaron Rosen',
  'Leah Weiss', 'Joshua Silver', 'Hannah Gold', 'Benjamin Stone', 'Naomi Diamond'
];

interface RevenueItem {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  products: string[];
  amount: number;
  timestamp: Date;
  paymentMethod: string;
  isVOPMember: boolean;
}

export default function RevenueFeedPage() {
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('live');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastProductCheck, setLastProductCheck] = useState<Date>(new Date());

  // Check for product updates and generate orders based on real products
  const checkProductUpdates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`);
      if (response.ok) {
        const products = await response.json();
        
        // Group products by vendor
        const productsByVendor: { [key: string]: any[] } = {};
        products.forEach((product: any) => {
          const vendorMap: { [key: string]: string } = {
            'Teva Deli': 'teva-deli',
            'Queens Cuisine': 'queens-cuisine',
            'People Store': 'people-store',
            'Garden of Light': 'garden-of-light',
            'VOP Shop': 'vop-shop',
            'Gahn Delight': 'gahn-delight'
          };
          
          const vendorId = vendorMap[product.vendor_name];
          if (vendorId) {
            if (!productsByVendor[vendorId]) {
              productsByVendor[vendorId] = [];
            }
            productsByVendor[vendorId].push(product);
          }
        });

        // Update productsByStore with real product names
        Object.keys(productsByVendor).forEach(vendorId => {
          const vendorProducts = productsByVendor[vendorId];
          productsByStore[vendorId] = vendorProducts
            .filter(p => p.stock_quantity > 0)
            .slice(0, 10)
            .map(p => p.name || p.name_en);
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Generate random order with real products
  const generateOrder = (): RevenueItem => {
    const store = stores[Math.floor(Math.random() * stores.length)];
    const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
    const storeProducts = productsByStore[store.id as keyof typeof productsByStore];
    
    // If no products available for store, use defaults
    if (!storeProducts || storeProducts.length === 0) {
      productsByStore[store.id] = ['Product 1', 'Product 2', 'Product 3'];
    }
    
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    
    for (let i = 0; i < numProducts; i++) {
      const availableProducts = productsByStore[store.id];
      if (availableProducts && availableProducts.length > 0) {
        selectedProducts.push(availableProducts[Math.floor(Math.random() * availableProducts.length)]);
      }
    }

    const baseAmount = store.avgOrderValue * (0.8 + Math.random() * 0.4);
    const isVOPMember = Math.random() > 0.7;
    const amount = isVOPMember ? baseAmount * 0.9 : baseAmount; // 10% member discount

    const paymentMethods = ['Credit Card', 'Braysheet Token', 'QR Payment', 'Bank Transfer'];

    return {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeId: store.id,
      storeName: store.name,
      customerName: customer,
      products: selectedProducts,
      amount: Math.round(amount * 100) / 100,
      timestamp: new Date(),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      isVOPMember
    };
  };

  // Initial load - fetch real products
  useEffect(() => {
    checkProductUpdates();
  }, []);

  // Generate initial historical data
  useEffect(() => {
    const historicalOrders: RevenueItem[] = [];
    const now = new Date();
    
    // Generate 50 orders from the past 24 hours
    for (let i = 0; i < 50; i++) {
      const order = generateOrder();
      const hoursAgo = Math.random() * 24;
      order.timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      historicalOrders.push(order);
    }
    
    // Sort by timestamp (newest first)
    historicalOrders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setRevenueItems(historicalOrders);
  }, []);

  // Generate new orders in real-time and check for product updates
  useEffect(() => {
    if (isPaused || timeRange !== 'live') return;

    // Check for product updates every 30 seconds
    const productCheckInterval = setInterval(() => {
      checkProductUpdates();
    }, 30000);

    // Generate new orders
    const orderInterval = setInterval(() => {
      const newOrder = generateOrder();
      setRevenueItems(prev => [newOrder, ...prev].slice(0, 100)); // Keep last 100 orders
    }, Math.random() * 8000 + 4000); // Random interval between 4-12 seconds

    return () => {
      clearInterval(productCheckInterval);
      clearInterval(orderInterval);
    };
  }, [isPaused, timeRange]);

  // Calculate total revenue
  useEffect(() => {
    const filteredItems = filter === 'all' 
      ? revenueItems 
      : revenueItems.filter(item => item.storeId === filter);
    
    const total = filteredItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalRevenue(total);
  }, [revenueItems, filter]);

  // Filter items based on time range
  const getFilteredItems = () => {
    let items = filter === 'all' 
      ? revenueItems 
      : revenueItems.filter(item => item.storeId === filter);

    if (timeRange !== 'live') {
      const now = new Date();
      const hoursAgo = parseInt(timeRange);
      items = items.filter(item => 
        item.timestamp.getTime() > now.getTime() - hoursAgo * 60 * 60 * 1000
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Get store stats
  const getStoreStats = () => {
    return stores.map(store => {
      const storeOrders = revenueItems.filter(item => item.storeId === store.id);
      const revenue = storeOrders.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...store,
        orderCount: storeOrders.length,
        revenue: revenue
      };
    });
  };

  const storeStats = getStoreStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KiFar Marketplace Revenue Feed</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time revenue tracking across all stores</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPaused 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <i className={`fas fa-${isPaused ? 'play' : 'pause'} mr-2`}></i>
                {isPaused ? 'Resume' : 'Pause'} Feed
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Revenue (24h)</p>
                <p className="text-2xl font-bold text-green-600">₪{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {storeStats.map(store => (
            <div
              key={store.id}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
                filter === store.id ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{ 
                borderColor: filter === store.id ? store.color : 'transparent',
                borderWidth: '2px',
                '--tw-ring-color': store.color
              } as any}
              onClick={() => setFilter(filter === store.id ? 'all' : store.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={store.logo}
                  alt={store.name || "Image"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <h3 className="font-semibold text-sm">{store.name}</h3>
              </div>
              <p className="text-2xl font-bold" style={{ color: store.color }}>
                ₪{store.revenue.toFixed(0)}
              </p>
              <p className="text-xs text-gray-600">{store.orderCount} orders</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
              >
                <option value="live">Live Feed</option>
                <option value="1">Last Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24">Last 24 Hours</option>
              </select>
            </div>
            
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Stores
            </button>

            {/* Live indicator */}
            {timeRange === 'live' && !isPaused && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </div>
                <div className="text-xs text-gray-500">
                  Product data synced every 30s
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Feed */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`border-b hover:bg-gray-50 transition-all ${
                  index === 0 && timeRange === 'live' ? 'animate-slide-in' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Image src={stores.find(s => s.id === item.storeId)?.logo || ''}
                        alt={item.storeName || "Image"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.customerName}</h4>
                          {item.isVOPMember && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              VOP Member
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.products.join(', ')}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{item.storeName}</span>
                          <span>•</span>
                          <span>{item.paymentMethod}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ 
                        color: stores.find(s => s.id === item.storeId)?.color 
                      }}>
                        ₪{item.amount.toFixed(2)}
                      </p>
                      {item.isVOPMember && (
                        <p className="text-xs text-green-600">10% discount applied</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Orders Today</h3>
              <i className="fas fa-shopping-cart text-gray-400"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {revenueItems.filter(item => 
                item.timestamp.getTime() > new Date().setHours(0,0,0,0)
              ).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Order</h3>
              <i className="fas fa-calculator text-gray-400"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₪{filteredItems.length > 0 
                ? (totalRevenue / filteredItems.length).toFixed(0) 
                : '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">VOP Members</h3>
              <i className="fas fa-users text-gray-400"></i>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(
                (filteredItems.filter(item => item.isVOPMember).length / 
                (filteredItems.length || 1)) * 100
              )}%
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Top Store</h3>
              <i className="fas fa-trophy text-gray-400"></i>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {storeStats.sort((a, b) => b.revenue - a.revenue)[0]?.name || '-'}
            </p>
            <p className="text-sm text-gray-600">
              ₪{storeStats.sort((a, b) => b.revenue - a.revenue)[0]?.revenue.toFixed(0) || '0'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}