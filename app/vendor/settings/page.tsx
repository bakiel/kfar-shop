'use client';

import React, { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface VendorSettingsForm {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  category: string;
  logo: string;
  banner: string;
  minimumOrder: string;
  deliveryFee: string;
  preparationTime: string;
}

const initialForm: VendorSettingsForm = {
  name: '',
  description: '',
  phone: '',
  whatsapp: '',
  address: '',
  category: '',
  logo: '',
  banner: '',
  minimumOrder: '',
  deliveryFee: '',
  preparationTime: '',
};

export default function VendorSettingsPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const vendorId = user?.vendorId || '';
  const [form, setForm] = useState<VendorSettingsForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!vendorId || !accessToken) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/vendor/${vendorId}`, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (!response.ok || !data.vendor) {
          throw new Error(data.error || 'Failed to load vendor profile');
        }

        const vendor = data.vendor;
        const metadata = vendor.metadata || {};
        setForm({
          name: vendor.name || '',
          description: vendor.description || '',
          phone: metadata.phone || '',
          whatsapp: metadata.whatsapp || '',
          address: metadata.location || '',
          category: vendor.category || vendor.categories?.[0] || '',
          logo: vendor.logo || '',
          banner: vendor.banner || '',
          minimumOrder: metadata.minimumOrder === undefined ? '' : String(metadata.minimumOrder),
          deliveryFee: metadata.deliveryFee === undefined ? '' : String(metadata.deliveryFee),
          preparationTime: metadata.preparationTime === undefined ? '' : String(metadata.preparationTime),
        });
      } catch (err) {
        console.error('Vendor settings load failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [accessToken, authLoading, vendorId]);

  const updateField = (field: keyof VendorSettingsForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage('');
    setError('');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !vendorId) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/vendor/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          address: form.address.trim(),
          category: form.category.trim(),
          categories: form.category.trim() ? [form.category.trim()] : [],
          logo: form.logo.trim(),
          banner: form.banner.trim(),
          minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : null,
          deliveryFee: form.deliveryFee ? Number(form.deliveryFee) : null,
          preparationTime: form.preparationTime ? Number(form.preparationTime) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vendor profile');
      }
      setMessage('Store settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        </div>
        <p className="text-gray-500">Update the public information customers see on your store page.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 max-w-4xl space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Store Name</span>
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category</span>
            <input value={form.category} onChange={(e) => updateField('category', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">WhatsApp</span>
            <input value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Logo URL</span>
            <input value={form.logo} onChange={(e) => updateField('logo', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Banner URL</span>
            <input value={form.banner} onChange={(e) => updateField('banner', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Minimum Order</span>
            <input type="number" value={form.minimumOrder} onChange={(e) => updateField('minimumOrder', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Delivery Fee</span>
            <input type="number" value={form.deliveryFee} onChange={(e) => updateField('deliveryFee', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Address</span>
          <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#478c0b]" />
        </label>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="text-sm">
            {message && <span className="text-green-700">{message}</span>}
            {error && <span className="text-red-600">{error}</span>}
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#478c0b] text-white rounded-lg font-semibold disabled:opacity-60">
            <Save className="w-4 h-4 stroke-[1.5]" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
