'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import { vendorDataService } from '@/lib/services/vendor-data-service';
import '@/styles/kfar-style-system.css';

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const vendorList = Object.values(vendorStores);
        const vendorAnalytics = await Promise.all(
          vendorList.map(vendor => vendorDataService.getVendorAnalytics(vendor.id))
        );
        
        const enrichedVendors = vendorList.map((vendor, index) => ({
          ...vendor,
          analytics: {
            ...vendor.analytics,
            ...vendorAnalytics[index]
          }
        }));
        
        setVendors(enrichedVendors);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.info.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && vendor.analytics.activeProducts > 0) ||
                         (filterStatus === 'inactive' && vendor.analytics.activeProducts === 0);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 kfar-border-leaf-green border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="kfar-text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 font-bold kfar-text-soil mb-2">Vendor Management</h1>
        <p className="text-body kfar-text-gray-600">
          Manage all {vendors.length} marketplace vendors
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input flex-1"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-primary">
            <i className="fas fa-plus mr-2"></i>
            Add New Vendor
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            className="card hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Vendor Header */}
            <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden">
              <div className="absolute inset-0 kfar-gradient-primary opacity-90"></div>
              <Image
                src={vendor.branding.logo}
                alt={vendor.name || "Image"}
                width={80}
                height={80}
                className="absolute bottom-4 left-6 w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/vendors/default_logo.jpg';
                }}
              />
            </div>

            {/* Vendor Info */}
            <div className="mb-4">
              <h3 className="text-h4 font-bold kfar-text-soil mb-1">{vendor.name}</h3>
              <p className="text-body-sm kfar-text-gray-600 line-clamp-2">
                {vendor.info.description || 'No description available'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg kfar-bg-gray-50">
                <p className="text-h5 font-bold kfar-text-leaf-green">
                  {vendor.analytics.totalProducts}
                </p>
                <p className="text-body-sm kfar-text-gray-600">Products</p>
              </div>
              <div className="text-center p-3 rounded-lg kfar-bg-gray-50">
                <p className="text-h5 font-bold kfar-text-sun-gold">
                  {vendor.analytics.activeProducts}
                </p>
                <p className="text-body-sm kfar-text-gray-600">Active</p>
              </div>
              <div className="text-center p-3 rounded-lg kfar-bg-gray-50">
                <p className="text-h5 font-bold kfar-text-earth-flame">
                  ⭐ {vendor.analytics.averageRating}
                </p>
                <p className="text-body-sm kfar-text-gray-600">Rating</p>
              </div>
              <div className="text-center p-3 rounded-lg kfar-bg-gray-50">
                <p className="text-h5 font-bold kfar-text-soil">
                  {vendor.analytics.reviewCount}
                </p>
                <p className="text-body-sm kfar-text-gray-600">Reviews</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/admin/vendors/${vendor.id}`} className="flex-1">
                <button className="btn btn-primary w-full">
                  <i className="fas fa-eye mr-2"></i>
                  View Details
                </button>
              </Link>
              <Link href={`/store/${vendor.id}`}>
                <button className="btn btn-outline">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
