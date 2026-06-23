'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, Phone, Mail, ShoppingBag, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:    { label: 'Pending',    icon: Clock,        color: '#B45309', bg: '#FEF3C7' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,  color: '#1D4ED8', bg: '#DBEAFE' },
  accepted:   { label: 'Accepted',   icon: CheckCircle,  color: '#1D4ED8', bg: '#DBEAFE' },
  processing: { label: 'Processing', icon: Package,      color: '#6D28D9', bg: '#EDE9FE' },
  preparing:  { label: 'Preparing',  icon: Package,      color: '#6D28D9', bg: '#EDE9FE' },
  ready:      { label: 'Ready',      icon: Package,      color: '#0369A1', bg: '#E0F2FE' },
  shipped:    { label: 'Shipped',    icon: Truck,        color: '#0369A1', bg: '#E0F2FE' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: '#15803D', bg: '#DCFCE7' },
  completed:  { label: 'Completed',  icon: CheckCircle,  color: '#15803D', bg: '#DCFCE7' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: '#B91C1C', bg: '#FEE2E2' },
  refunded:   { label: 'Refunded',   icon: XCircle,      color: '#B91C1C', bg: '#FEE2E2' },
};

const TERMINAL_STATUSES = ['delivered', 'completed', 'cancelled', 'refunded'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon className="w-4 h-4 stroke-[1.5]" />
      {cfg.label}
    </span>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { isRTL } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // `silent` refreshes (polling / the refresh button) update the data without flipping
  // the full-page loading spinner. Only SILENT polls skip when a request is already
  // running — an explicit load (initial mount, token arrival, navigation) must never be
  // dropped, or the page can get stuck with order=null and polling never starts. A
  // request-sequence ref makes the latest request win, so a slow unauthenticated request
  // can't clobber a newer authenticated one.
  const inFlight = useRef(false);
  const reqSeq = useRef(0);
  const [pollStopped, setPollStopped] = useState(false);
  const fetchOrder = useCallback(async (silent = false) => {
    if (silent && inFlight.current) return;
    const seq = ++reqSeq.current;
    inFlight.current = true;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`/api/orders/${id}`, { headers, cache: 'no-store' });
      if (seq !== reqSeq.current) return; // superseded by a newer request
      if (res.status === 401 || res.status === 403) {
        setPollStopped(true); // session invalid — stop polling instead of hammering
        if (!silent) setError('Please sign in to view this order.');
        return;
      }
      const data = await res.json();
      if (seq !== reqSeq.current) return;
      if (data.success && data.order) {
        setOrder(data.order);
        setError('');
      } else if (!silent) {
        setError(data.error || 'Order not found');
      }
    } catch {
      if (!silent) setError('Failed to load order');
    } finally {
      if (seq === reqSeq.current) {
        inFlight.current = false;
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    }
  }, [id, accessToken]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Light polling so a buyer sees status changes without reloading. Only runs while an
  // order is loaded, not terminal, and the session is still valid — so failed/404/401
  // pages don't poll forever. The interval calls the latest fetchOrder via a ref, so a
  // token refresh (which changes fetchOrder's identity) doesn't restart/starve the timer.
  const fetchOrderRef = useRef(fetchOrder);
  useEffect(() => { fetchOrderRef.current = fetchOrder; }, [fetchOrder]);
  const terminal = TERMINAL_STATUSES.includes(order?.status);
  const hasOrder = !!order;
  useEffect(() => {
    if (!hasOrder || terminal || pollStopped) return;
    const interval = setInterval(() => fetchOrderRef.current(true), 30000);
    return () => clearInterval(interval);
    // id intentionally omitted: App Router remounts this page on id change, so it's
    // constant per lifetime; the effect body reads only fetchOrderRef.
  }, [hasOrder, terminal, pollStopped]);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime())
      ? '—'
      : dt.toLocaleDateString('en-IL', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
  };

  // order.items may arrive as an array or a JSON string; never let a malformed string
  // throw during render (that would blank the whole page via the error boundary).
  const items: any[] = (() => {
    const raw = order?.items;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          Back to Orders
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24">
            <XCircle className="w-12 h-12 stroke-[1.5] text-red-400 mx-auto mb-3" />
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {order && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order</p>
                  <h1 className="text-xl font-bold text-gray-900">{order.orderNumber || order.order_number}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed {formatDate(order.createdAt || order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <button
                    onClick={() => fetchOrder(true)}
                    disabled={refreshing}
                    title="Refresh status"
                    className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 stroke-[1.5] ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* A cancelled/refunded order has no forward progress, so show a banner
                  instead of the step timeline. */}
              {(order.status === 'cancelled' || order.status === 'refunded') ? (
                <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <XCircle className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
                  {order.status === 'refunded' ? 'This order was refunded.' : 'This order was cancelled.'}
                </div>
              ) : (
              /* Status timeline */
              <div className="mt-6 flex items-center gap-0">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((s, idx, arr) => {
                  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                  // Map statuses that aren't literal timeline steps onto a step:
                  // 'ready' (for pickup) ~ prepared; 'completed' ~ fully delivered.
                  const progressStatus =
                    order.status === 'completed' ? 'delivered'
                    : order.status === 'ready' ? 'processing'
                    : order.status === 'accepted' ? 'confirmed'
                    : order.status === 'preparing' ? 'processing'
                    : order.status;
                  const currentIdx = statuses.indexOf(progressStatus);
                  const done = idx <= currentIdx;
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: done ? cfg.bg : '#F3F4F6',
                            color: done ? cfg.color : '#9CA3AF',
                          }}
                        >
                          <Icon className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <span className="text-[10px] mt-1 text-gray-400 hidden sm:block">{cfg.label}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          className="flex-1 h-0.5 mx-1"
                          style={{ backgroundColor: idx < currentIdx ? '#2D5A27' : '#E5E7EB' }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 stroke-[1.5] text-[#2D5A27]" />
                <h2 className="font-semibold text-gray-900">Items ({items.length})</h2>
              </div>
              <div className="space-y-3">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.vendorName && (
                        <p className="text-xs text-gray-400">{item.vendorName}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} ILS
                      </p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{parseFloat(order.subtotal || order.totalAmount || order.total || 0).toFixed(2)} ILS</span>
                </div>
                {(order.deliveryFee || order.delivery_fee) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>{parseFloat(order.deliveryFee || order.delivery_fee || 0).toFixed(2)} ILS</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{parseFloat(order.totalAmount || order.total || 0).toFixed(2)} ILS</span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Delivery Details</h2>
              <div className="space-y-3">
                {(order.customerName || order.customer_name) && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 stroke-[1.5] text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customerName || order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail || order.customer_email}</p>
                    </div>
                  </div>
                )}
                {(order.customerPhone || order.customer_phone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 stroke-[1.5] text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{order.customerPhone || order.customer_phone}</p>
                  </div>
                )}
                {(order.deliveryAddress || order.delivery_address) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 stroke-[1.5] text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      {(() => {
                        const addr = order.deliveryAddress || order.delivery_address;
                        if (!addr) return '';
                        try {
                          const parsed = typeof addr === 'string' ? JSON.parse(addr) : addr;
                          return [parsed.address, parsed.city, parsed.country].filter(Boolean).join(', ');
                        } catch { return addr; }
                      })()}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 stroke-[1.5] text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700 capitalize">
                    {String(order.paymentMethod || order.payment_method || 'cash').replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(order.notes || order.deliveryNotes || order.delivery_notes) && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-sm font-medium text-amber-800 mb-1">Notes</p>
                <p className="text-sm text-amber-700">
                  {order.notes || order.deliveryNotes || order.delivery_notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/customer/orders"
                className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                All Orders
              </Link>
              <Link
                href="/"
                className="flex-1 text-center py-3 rounded-xl bg-[#2D5A27] text-white text-sm font-medium hover:bg-[#1E3D1A] transition-colors"
              >
                Shop Again
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
