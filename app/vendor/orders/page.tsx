'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package, Clock, CheckCircle, Truck, AlertCircle,
  Phone, MessageSquare, Eye, FileText, Filter
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { whatsAppService } from '@/lib/services/whatsapp-service';

// --- Types ---
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed';
  orderDate: string;
  pickupDate: string;
  pickupTime: string;
  collectionPoint: string;
  paymentMethod: string;
  notes?: string;
  invoiceNumber?: string;
  [key: string]: unknown;
}

type FilterType = 'all' | 'pending' | 'active' | 'completed';

// --- Status mapping for StatusBadge ---
const statusToBadgeMap: Record<string, 'pending' | 'active' | 'processing' | 'completed'> = {
  pending: 'pending',
  accepted: 'processing',
  preparing: 'processing',
  ready: 'active',
  completed: 'completed',
};

// --- Animation variants ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function VendorOrders() {
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();
  const { user, accessToken, isLoading: authLoading } = useAuth();

  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // --- Fetch orders from authenticated vendor API ---
  const fetchOrders = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/vendor/orders?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success && data.orders && data.orders.length > 0) {
          const formattedOrders: Order[] = data.orders.map((order: any) => {
            const items = Array.isArray(order.items) ? order.items : [];
            return {
              id: order.id,
              orderNumber: order.order_number || order.id,
              customerName: order.customer_name || '',
              customerPhone: order.customer_phone || '',
              items: items.map((itm: any) => ({
                id: itm.product_id || itm.id || '',
                productName: itm.product_name || itm.productName || itm.name || `Product`,
                quantity: itm.quantity || 1,
                price: parseFloat(itm.price || '0'),
              })),
              total: parseFloat(order.total_amount ?? order.total ?? '0'),
              status: order.status || 'pending',
              orderDate: order.created_at || new Date().toISOString(),
              pickupDate: order.delivery_date || '',
              pickupTime: order.delivery_time || '',
              collectionPoint: order.collection_point || '',
              paymentMethod: order.payment_method || '',
              notes: order.notes || '',
              invoiceNumber: order.invoice_number || '',
            };
          });

          setOrders(formattedOrders);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    // No orders found or error -- set empty
    setOrders([]);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const id = user?.vendorId || '';
    const name = user?.displayName || '';

    setVendorId(id);
    setVendorName(name);

    if (accessToken) {
      fetchOrders(accessToken).finally(() => setLoading(false));
    } else {
      // No token, show empty state
      setOrders([]);
      setLoading(false);
    }
  }, [accessToken, authLoading, fetchOrders, user?.displayName, user?.vendorId]);

  // --- Update order status (DB update + WhatsApp notification) ---
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Optimistic update
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      if (!accessToken) {
        throw new Error('Vendor session expired. Please log in again.');
      }

      const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: order.status } : o))
      );
    }

    // WhatsApp notification
    try {
      await whatsAppService.notifyCustomerStatusUpdate(
        order.customerPhone,
        order.orderNumber,
        newStatus,
        vendorName
      );
    } catch {
      // WhatsApp notification is best-effort
    }
  };

  // --- Filter logic ---
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'active') return ['accepted', 'preparing', 'ready'].includes(order.status);
    if (filter === 'completed') return order.status === 'completed';
    return true;
  });

  // --- Filter counts ---
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  // --- Filter tabs ---
  const filterTabs: { key: FilterType; labelEn: string; labelHe: string; color: string }[] = [
    { key: 'all', labelEn: 'All', labelHe: 'הכל', color: '#478c0b' },
    { key: 'pending', labelEn: 'Pending', labelHe: 'ממתין', color: '#d97706' },
    { key: 'active', labelEn: 'Active', labelHe: 'פעיל', color: '#2563eb' },
    { key: 'completed', labelEn: 'Completed', labelHe: 'הושלם', color: '#6b7280' },
  ];

  // --- Status labels ---
  const statusLabels: Record<string, Record<string, string>> = {
    pending: { en: 'Pending', he: 'ממתין' },
    accepted: { en: 'Accepted', he: 'אושר' },
    preparing: { en: 'Preparing', he: 'בהכנה' },
    ready: { en: 'Ready', he: 'מוכן' },
    completed: { en: 'Completed', he: 'הושלם' },
  };

  // --- Next status action buttons per current status ---
  const getNextAction = (order: Order) => {
    const buttonBase = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-white';
    switch (order.status) {
      case 'pending':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateOrderStatus(order.id, 'accepted')}
            className={`${buttonBase} bg-[#478c0b] hover:bg-[#3a7209]`}
          >
            {isRTL ? 'אשר הזמנה' : 'Accept'}
          </motion.button>
        );
      case 'accepted':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className={`${buttonBase} bg-purple-600 hover:bg-purple-700`}
          >
            {isRTL ? 'התחל הכנה' : 'Start Preparing'}
          </motion.button>
        );
      case 'preparing':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className={`${buttonBase} bg-emerald-600 hover:bg-emerald-700`}
          >
            {isRTL ? 'סמן מוכן' : 'Mark Ready'}
          </motion.button>
        );
      case 'ready':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className={`${buttonBase} bg-gray-600 hover:bg-gray-700`}
          >
            {isRTL ? 'סיים' : 'Complete'}
          </motion.button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'ניהול הזמנות' : 'Order Management'}
          subtitle={isRTL ? `${orders.length} הזמנות` : `${orders.length} total orders`}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Stat Summary Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: isRTL ? 'ממתין' : 'Pending', count: counts.pending, color: '#d97706', bg: 'bg-amber-50' },
          { label: isRTL ? 'בתהליך' : 'In Progress', count: counts.active, color: '#2563eb', bg: 'bg-blue-50' },
          { label: isRTL ? 'מוכן' : 'Ready', count: orders.filter(o => o.status === 'ready').length, color: '#059669', bg: 'bg-emerald-50' },
          { label: isRTL ? 'הכנסות' : 'Revenue', count: null, color: '#3a3a1d', bg: 'bg-gray-50', revenue: orders.reduce((sum, o) => sum + o.total, 0) },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl px-5 py-4 border border-gray-100`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.revenue !== undefined ? `\u20AA${stat.revenue}` : stat.count}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 stroke-[1.5]" />
        {filterTabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              filter === tab.key
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
            style={filter === tab.key ? { backgroundColor: tab.color } : {}}
          >
            {isRTL ? tab.labelHe : tab.labelEn} ({counts[tab.key]})
          </motion.button>
        ))}
      </motion.div>

      {/* Orders List */}
      <motion.div variants={item} className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="cart"
            title={isRTL ? 'אין הזמנות' : 'No orders found'}
            description={isRTL ? 'שנה את המסנן או המתן להזמנות חדשות' : 'Change the filter or wait for new orders'}
          />
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors"
            >
              {/* Order Header Row */}
              <div
                className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <StatusBadge
                    status={statusToBadgeMap[order.status] || 'pending'}
                    language={language}
                    customLabel={statusLabels[order.status]?.[language]}
                  />
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                    <p className="text-lg font-bold text-gray-900">{'\u20AA'}{order.total}</p>
                    <p className="text-xs text-gray-400">{order.customerName}</p>
                  </div>
                  {getNextAction(order)}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100"
                >
                  <div className="px-6 py-5 space-y-4">
                    {/* Customer & Pickup Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          {isRTL ? 'פרטי לקוח' : 'Customer Details'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">{order.customerName || (isRTL ? 'לא צוין' : 'Not specified')}</p>
                          <p className="text-gray-500">{order.customerPhone || (isRTL ? 'לא צוין' : 'Not specified')}</p>
                        </div>
                        {order.customerPhone && (
                          <div className="flex gap-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => window.open(`tel:${order.customerPhone}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
                              {isRTL ? 'התקשר' : 'Call'}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const cleanPhone = order.customerPhone.replace(/\D/g, '');
                                const msg = `Hi ${order.customerName}, this is ${vendorName} regarding your order ${order.orderNumber}.`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
                              WhatsApp
                            </motion.button>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          {isRTL ? 'פרטי איסוף' : 'Pickup Details'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          {order.pickupDate && (
                            <p className="text-gray-700">
                              <span className="text-gray-400">{isRTL ? 'תאריך:' : 'Date:'} </span>
                              {order.pickupDate} {order.pickupTime ? `${isRTL ? 'בשעה' : 'at'} ${order.pickupTime}` : ''}
                            </p>
                          )}
                          {order.collectionPoint && (
                            <p className="text-gray-700">
                              <span className="text-gray-400">{isRTL ? 'נקודת איסוף:' : 'Point:'} </span>
                              {order.collectionPoint}
                            </p>
                          )}
                          {order.paymentMethod && (
                            <p className="text-gray-700">
                              <span className="text-gray-400">{isRTL ? 'תשלום:' : 'Payment:'} </span>
                              {order.paymentMethod}
                            </p>
                          )}
                          {!order.pickupDate && !order.collectionPoint && !order.paymentMethod && (
                            <p className="text-gray-400 italic">{isRTL ? 'אין פרטים נוספים' : 'No additional details'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          {isRTL ? 'פריטים' : 'Order Items'}
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((itm, idx) => (
                            <div key={itm.id || idx} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                              <span className="text-gray-700">
                                {itm.quantity}x {itm.productName}
                              </span>
                              <span className="font-medium text-gray-900">
                                {'\u20AA'}{itm.price * itm.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">{isRTL ? 'הערה:' : 'Note:'} </span>
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-2">
                      {order.invoiceNumber && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(`/invoice/view/${order.invoiceNumber}`, '_blank')}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#478c0b] text-[#478c0b] rounded-lg text-xs font-medium hover:bg-[#478c0b]/5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
                          {isRTL ? 'חשבונית' : 'Invoice'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
