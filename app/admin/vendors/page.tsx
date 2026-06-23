'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { Plus, Eye, ExternalLink, AlertTriangle, X, Power, PowerOff, Copy, CheckCircle } from 'lucide-react';
import '@/styles/kfar-style-system.css';

const VENDOR_CATEGORIES = ['food', 'bakery', 'clothing', 'wellness', 'crafts', 'services'];

interface NewVendorForm {
  storeName: string;
  storeNameHe: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

const emptyForm: NewVendorForm = {
  storeName: '',
  storeNameHe: '',
  category: 'food',
  description: '',
  email: '',
  phone: '',
  password: '',
  address: '',
};

function suggestPassword(): string {
  // Browser-side helper for a hand-over password the admin can change later.
  // Uses the Web Crypto CSPRNG rather than Math.random for the live credential.
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(10);
  (globalThis.crypto || (window as any).crypto).getRandomValues(bytes);
  const body = Array.from(bytes, (b) => chars[b % chars.length]).join('');
  return `Kfar-${body}`;
}

export default function VendorManagementPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add-vendor modal state
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewVendorForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; storeUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Per-vendor enable/disable in flight
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError('Admin session expired. Please log in again.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [vendorFeedResponse, adminResponse] = await Promise.all([
        fetch('/api/vendors', { cache: 'no-store' }),
        fetch('/api/admin/accounts?type=vendors', { cache: 'no-store', headers }),
      ]);

      if (!adminResponse.ok) throw new Error(`Admin vendor feed failed: ${adminResponse.status}`);
      if (!vendorFeedResponse.ok) throw new Error(`Vendor feed failed: ${vendorFeedResponse.status}`);

      const [vendorFeedData, adminData] = await Promise.all([
        vendorFeedResponse.json(),
        adminResponse.json(),
      ]);
      const feedVendors = new Map((vendorFeedData.vendors || []).map((vendor: any) => [vendor.id, vendor]));
      const sourceVendors = adminData.vendors?.length ? adminData.vendors : (vendorFeedData.vendors || []);
      const enrichedVendors = sourceVendors.map((vendor: any) => {
        const vendorId = vendor.vendorId || vendor.vendor_id || vendor.id;
        const feedVendor: any = feedVendors.get(vendorId) || {};
        const productCount = feedVendor.productCount || vendor.productCount || vendor.product_count || 0;
        return {
          id: vendorId,
          accountId: vendor.userId || vendor.id,
          name: vendor.name || vendor.storeName || feedVendor.name || vendor.business_name || vendorId,
          featured: Boolean(vendor.featured ?? feedVendor.featured),
          // Store status lives on profile.status (vendors.status); the top-level
          // `status` from the accounts API is the user-account active flag.
          status: vendor.profile?.status || feedVendor.status || vendor.status || 'active',
          branding: {
            logo: feedVendor.logo || vendor.logo_url || vendor.logo || '/images/vendors/default_logo.jpg',
          },
          info: {
            description: vendor.description || feedVendor.description || '',
          },
          analytics: {
            totalProducts: productCount,
            activeProducts: productCount,
            averageRating: feedVendor.rating || vendor.rating || 0,
            reviewCount: feedVendor.totalReviews || vendor.review_count || 0,
            totalOrders: vendor.totalOrders || 0,
            totalRevenue: vendor.totalRevenue || 0,
          },
        };
      });

      setVendors(enrichedVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    loadVendors();
  }, [authLoading, loadVendors]);

  const openAddModal = () => {
    setForm({ ...emptyForm, password: suggestPassword() });
    setFormError(null);
    setCreatedCreds(null);
    setCopied(false);
    setShowAdd(true);
  };

  const submitNewVendor = async () => {
    setFormError(null);
    if (!form.storeName || !form.category || !form.description || !form.email || !form.phone || !form.password) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to create vendor');
      setCreatedCreds({ email: form.email, password: form.password, storeUrl: data.storeUrl });
      await loadVendors();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVendorStatus = async (vendor: any) => {
    const action = vendor.status === 'active' ? 'disable' : 'enable';
    setStatusUpdating(vendor.id);
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ vendorId: vendor.id, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to update vendor');
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, status: data.vendor.status } : v)));
    } catch (err) {
      console.error('Vendor status update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setStatusUpdating(null);
    }
  };

  const copyCreds = async () => {
    if (!createdCreds) return;
    try {
      await navigator.clipboard.writeText(
        `Login: ${createdCreds.email}\nPassword: ${createdCreds.password}\nVendor login: /vendor/login`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.info.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && vendor.status === 'active') ||
                         (filterStatus === 'inactive' && vendor.status !== 'active');
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

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

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
            <option value="inactive">Disabled</option>
          </select>
          <button className="btn btn-primary cursor-pointer" onClick={openAddModal}>
            <Plus className="w-5 h-5 stroke-[1.5] inline mr-2" />
            Add New Vendor
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor, index) => {
          const isActive = vendor.status === 'active';
          return (
          <motion.div
            key={vendor.id}
            className="card hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
              <span
                className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-white/90 text-green-700' : 'bg-white/90 text-red-600'
                }`}
              >
                {isActive ? 'Active' : 'Disabled'}
              </span>
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
                  {vendor.analytics.averageRating}
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
              <Link href={`/admin/vendor/${vendor.id}`} className="flex-1">
                <button className="btn btn-primary w-full cursor-pointer">
                  <Eye className="w-5 h-5 stroke-[1.5] inline mr-2" />
                  View Details
                </button>
              </Link>
              <button
                className="btn btn-outline cursor-pointer"
                title={isActive ? 'Disable vendor' : 'Enable vendor'}
                disabled={statusUpdating === vendor.id}
                onClick={() => toggleVendorStatus(vendor)}
              >
                {isActive
                  ? <PowerOff className="w-5 h-5 stroke-[1.5]" />
                  : <Power className="w-5 h-5 stroke-[1.5]" />}
              </button>
              <Link href={`/store/${vendor.id}`}>
                <button className="btn btn-outline cursor-pointer">
                  <ExternalLink className="w-5 h-5 stroke-[1.5]" />
                </button>
              </Link>
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowAdd(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-h4 font-bold kfar-text-soil">
                  {createdCreds ? 'Vendor Created' : 'Set Up a Vendor Store'}
                </h2>
                <button onClick={() => setShowAdd(false)} className="cursor-pointer text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {createdCreds ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5 stroke-[1.5]" />
                    <span className="font-medium">Store created and active.</span>
                  </div>
                  <p className="text-body-sm kfar-text-gray-600">
                    Share these login details with the store owner. They sign in at
                    {' '}<span className="font-mono">/vendor/login</span> and can change the password later.
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm space-y-1">
                    <div><span className="text-gray-400">Email: </span>{createdCreds.email}</div>
                    <div><span className="text-gray-400">Password: </span>{createdCreds.password}</div>
                    <div><span className="text-gray-400">Store: </span>{createdCreds.storeUrl}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline cursor-pointer" onClick={copyCreds}>
                      {copied
                        ? <><CheckCircle className="w-4 h-4 stroke-[1.5] inline mr-2" />Copied</>
                        : <><Copy className="w-4 h-4 stroke-[1.5] inline mr-2" />Copy credentials</>}
                    </button>
                    <button className="btn btn-primary flex-1 cursor-pointer" onClick={() => setShowAdd(false)}>
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium kfar-text-soil mb-1">Store name (English) *</label>
                      <input className="input w-full" value={form.storeName}
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium kfar-text-soil mb-1">Store name (Hebrew)</label>
                      <input className="input w-full" dir="rtl" value={form.storeNameHe}
                        onChange={(e) => setForm({ ...form, storeNameHe: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium kfar-text-soil mb-1">Category *</label>
                    <select className="input w-full" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {VENDOR_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium kfar-text-soil mb-1">Short description *</label>
                    <textarea className="input w-full" rows={2} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium kfar-text-soil mb-1">Owner email *</label>
                      <input className="input w-full" type="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium kfar-text-soil mb-1">Phone *</label>
                      <input className="input w-full" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium kfar-text-soil mb-1">Address</label>
                    <input className="input w-full" value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium kfar-text-soil mb-1">Temporary password *</label>
                    <div className="flex gap-2">
                      <input className="input flex-1 font-mono" value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <button type="button" className="btn btn-outline cursor-pointer"
                        onClick={() => setForm({ ...form, password: suggestPassword() })}>
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="btn btn-outline cursor-pointer" onClick={() => setShowAdd(false)} disabled={submitting}>
                      Cancel
                    </button>
                    <button className="btn btn-primary flex-1 cursor-pointer" onClick={submitNewVendor} disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Store'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
