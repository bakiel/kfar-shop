'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Store, TrendingUp, Award, Users } from 'lucide-react';
import VendorBrowseCard from '@/components/marketplace/VendorBrowseCard';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import Link from 'next/link';

export default function MarketplaceStoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('popular');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch vendors from API (includes both static and dynamic)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data = await response.json();
          setVendors(data.vendors);
        } else {
          // Fallback to static vendors if API fails
          const staticVendors = Object.entries(vendorStores).map(([id, store]) => ({
            id,
            ...store
          }));
          setVendors(staticVendors);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        // Fallback to static vendors
        const staticVendors = Object.entries(vendorStores).map(([id, store]) => ({
          id,
          ...store
        }));
        setVendors(staticVendors);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    vendors.forEach(vendor => {
      vendor.categories?.forEach(cat => allCategories.add(cat));
    });
    return ['all', ...Array.from(allCategories)];
  }, [vendors]);

  // Check if vendor is open
  const isVendorOpen = (vendor: any) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Mock business hours for demo (in production, this would come from vendor data)
    const defaultHours = {
      open: '09:00',
      close: '18:00',
      closed: currentDay === 'saturday'
    };
    
    if (defaultHours.closed) return false;
    return currentTime >= defaultHours.open && currentTime <= defaultHours.close;
  };

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        vendor.categories?.includes(selectedCategory);
      
      // Open now filter
      const matchesOpenNow = !filterOpenNow || isVendorOpen(vendor);
      
      return matchesSearch && matchesCategory && matchesOpenNow;
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          // New vendors (featured) come first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        // Sort by product count as a proxy for popularity
        filtered.sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0));
        break;
    }

    return filtered;
  }, [vendors, searchQuery, selectedCategory, filterOpenNow, sortBy]);

  return (
    <div className="min-h-screen bg-cream-base">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          {/* Title and Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
                Marketplace Stores
              </h1>
              <p className="text-lg text-gray-600">
                Discover amazing vendors in the Village of Peace community
              </p>
            </div>
            
            <div className="flex items-center gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>
                  {vendors.length}
                </div>
                <div className="text-sm text-gray-600">Total Stores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#f6af0d' }}>
                  {vendors.filter(v => v.featured).length}
                </div>
                <div className="text-sm text-gray-600">New Stores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#c23c09' }}>
                  {vendors.filter(v => isVendorOpen(v)).length}
                </div>
                <div className="text-sm text-gray-600">Open Now</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores by name or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-leaf-green transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-leaf-green transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-leaf-green transition-colors"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="alphabetical">A-Z</option>
            </select>

            {/* Open Now Filter */}
            <button
              onClick={() => setFilterOpenNow(!filterOpenNow)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                filterOpenNow 
                  ? 'bg-leaf-green text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              Open Now
            </button>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      {searchQuery || selectedCategory !== 'all' || filterOpenNow ? (
        <div className="container mx-auto px-4 py-4">
          <p className="text-gray-600">
            Found <span className="font-semibold" style={{ color: '#478c0b' }}>{filteredVendors.length}</span> stores
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {filterOpenNow && ' that are open now'}
          </p>
        </div>
      ) : null}

      {/* Vendor Grid */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: '#478c0b' }}></i>
              <p className="text-gray-600">Loading vendors...</p>
            </div>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor, index) => (
              <VendorBrowseCard
                key={vendor.id}
                vendorId={vendor.id}
                vendorInfo={{
                  name: vendor.name,
                  logo: vendor.logo,
                  description: vendor.description,
                  tags: vendor.categories
                }}
                products={vendor.products || []}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
              No stores found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterOpenNow(false);
              }}
              className="px-6 py-3 bg-leaf-green text-white rounded-xl font-medium hover:bg-leaf-green-dark transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* CTA Section for New Vendors */}
      <section className="py-16 bg-gradient-to-br from-leaf-green/10 to-sun-gold/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Want to Open Your Store?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join our growing community of successful vendors. Get AI-powered tools, marketing support, and instant access to customers.
            </p>
            <Link
              href="/become-a-vendor"
              className="inline-flex items-center gap-3 px-8 py-4 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: '#c23c09' }}
            >
              <Store className="w-6 h-6" />
              Become a Vendor
            </Link>
            
            <div className="mt-8 flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#478c0b' }} />
                <span className="text-gray-600">40% Average Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: '#f6af0d' }} />
                <span className="text-gray-600">AI-Powered Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: '#c23c09' }} />
                <span className="text-gray-600">Join 50+ Vendors</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}