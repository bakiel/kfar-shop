'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, RefreshCw, Save } from 'lucide-react';
import { PageHeader, LoadingState, StatusBadge } from '@/components/portal';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
type BadgeStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  customer: { name: string; email?: string; phone?: string };
  deliveryAddress?: Record<string, string>;
  items: Array<Record<string, any>>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  createdAt?: string;
}

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'completed', 'cancelled'];

function money(value: unknown) {
  return `₪${(Number(value) || 0).toFixed(2)}`;
}

function itemVendor(item: Record<string, any>) {
  return item.vendorName || item.vendor_name || item.vendorId || item.vendor_id || 'Unassigned';
}

function toBadgeStatus(status: OrderStatus): BadgeStatus {
  if (status === 'confirmed' || status === 'ready') return 'processing';
  return status;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { isRTL } = useLanguage();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) h.Authorization = `Bearer ${accessToken}`;
    return h;
  }, [accessToken]);

  const loadOrder = useCallback(() => {
    if (!accessToken || !params?.id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/orders/${params.id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setOrder(data.order);
        setStatus(data.order.status);
      })
      .catch(err => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [accessToken, headers, params?.id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const updateStatus = async () => {
    if (!order) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to update status');
      setMessage('Status updated.');
      loadOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const resendConfirmation = async () => {
    if (!order) return;
    setResending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'resend_confirmation' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to resend confirmation');
      setMessage(`Confirmation resent${data.messageId ? ` (${data.messageId})` : ''}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation');
    } finally {
      setResending(false);
    }
  };

  if (loading) return <LoadingState type="page" />;

  if (error && !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link href="/admin/orders" className="text-sm font-medium text-[#2D5A27]">Back to orders</Link>
      </div>
    );
  }

  if (!order) return null;

  const addressLines = Object.values(order.deliveryAddress || {}).filter(Boolean);
  const vendorGroups = order.items.reduce<Record<string, AdminOrder['items']>>((acc, orderItem) => {
    const vendor = itemVendor(orderItem);
    acc[vendor] = acc[vendor] || [];
    acc[vendor].push(orderItem);
    return acc;
  }, {});

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={order.orderNumber || order.id}
        subtitle={order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Order detail'}
        isRTL={isRTL}
        actions={
          <Link href="/admin/orders" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" />
            Orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Items by vendor</h2>
              <StatusBadge status={toBadgeStatus(order.status)} language="en" customLabel={order.status} />
            </div>
            {Object.entries(vendorGroups).map(([vendor, vendorItems]) => (
              <div key={vendor} className="mb-5 last:mb-0">
                <h3 className="text-sm font-semibold text-[#1E3D1A] mb-2">{vendor}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-gray-500 border-b">
                      <tr>
                        <th className="py-2 text-left">Item</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Unit</th>
                        <th className="py-2 text-right">Line total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vendorItems.map((line, index) => {
                        const qty = Number(line.quantity || 1);
                        const price = Number(line.price || 0);
                        return (
                          <tr key={`${line.id || line.productId || index}`}>
                            <td className="py-3 font-medium text-gray-900">{line.name || line.productId || 'Item'}</td>
                            <td className="py-3 text-center">{qty}</td>
                            <td className="py-3 text-right">{money(price)}</td>
                            <td className="py-3 text-right font-semibold">{money(price * qty)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Customer notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes || 'No notes provided.'}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-gray-900">{order.customer.name || 'Unknown customer'}</p>
              <p className="text-gray-600">{order.customer.email || 'No email'}</p>
              <p className="text-gray-600">{order.customer.phone || 'No phone'}</p>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Delivery address</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{addressLines.length ? addressLines.join('\n') : 'No address provided.'}</p>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Payment</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Method</dt><dd className="font-medium">{order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{order.paymentStatus || 'pending'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Delivery</dt><dd>{money(order.deliveryFee)}</dd></div>
              <div className="flex justify-between border-t pt-2"><dt className="font-semibold">Total</dt><dd className="font-bold text-[#1E3D1A]">{money(order.total)}</dd></div>
            </dl>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Admin actions</h2>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">Order status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
            >
              {statuses.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            <button
              type="button"
              onClick={updateStatus}
              disabled={saving || status === order.status}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D5A27] text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save status
            </button>
            <button
              type="button"
              onClick={resendConfirmation}
              disabled={resending || !order.customer.email}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Resend confirmation
            </button>
            {(message || error) && (
              <p className={`mt-3 text-sm ${error ? 'text-red-600' : 'text-[#2D5A27]'}`}>{error || message}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
