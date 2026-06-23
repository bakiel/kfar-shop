'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { EmptyState, PageHeader, StatCard } from '@/components/portal';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart, type CartItem } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';

const fallbackImage = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';

function getUnitPrice(item: CartItem) {
  if (!item.bulkPricing || item.bulkPricing.length === 0) return item.price;

  const bulkPrice = item.bulkPricing
    .filter((bulk) => item.quantity >= bulk.quantity)
    .sort((a, b) => b.quantity - a.quantity)[0];

  return bulkPrice?.price ?? item.price;
}

function formatIls(value: number) {
  return new Intl.NumberFormat('en-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSavedTime(value: string | null, isRTL: boolean) {
  if (!value) return isRTL ? 'ממתין לסנכרון' : 'Pending sync';

  return new Date(value).toLocaleString(isRTL ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CustomerShoppingListPage() {
  const { accessToken, user } = useAuth();
  const { language, isRTL } = useLanguage();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    loadFromServer,
    syncToServer,
  } = useCart();

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const isCustomer = user?.role === 'customer' && !!accessToken;

  const itemCount = getCartCount();
  const subtotal = getCartTotal();
  const vendorCount = useMemo(() => {
    const vendorIds = new Set(items.map((item) => item.vendorId || item.vendor || item.vendorName || 'vendor'));
    return vendorIds.size;
  }, [items]);

  const fetchSavedMeta = useCallback(async () => {
    if (!accessToken || user?.role !== 'customer') return;

    try {
      const res = await fetch('/api/customer/cart', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLastSavedAt(data.updatedAt ?? null);
    } catch {
      setLastSavedAt(null);
    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    fetchSavedMeta();
  }, [fetchSavedMeta]);

  const handleSaveNow = async () => {
    if (!accessToken) return;

    setSaving(true);
    try {
      await syncToServer(accessToken);
      await fetchSavedMeta();
      toast({
        title: language === 'he' ? 'הרשימה נשמרה' : 'Shopping list saved',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!accessToken) return;

    setRefreshing(true);
    try {
      await loadFromServer(accessToken, { replaceEmpty: true });
      await fetchSavedMeta();
      toast({
        title: language === 'he' ? 'הרשימה עודכנה' : 'Shopping list refreshed',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(language === 'he' ? 'לנקות את כל רשימת הקניות?' : 'Clear the whole shopping list?')) {
      return;
    }

    clearCart();

    if (accessToken) {
      try {
        await fetch('/api/customer/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setLastSavedAt(new Date().toISOString());
      } catch {
        await fetch('/api/customer/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ items: [] }),
        });
      }
    }

    toast({
      title: language === 'he' ? 'הרשימה נוקתה' : 'Shopping list cleared',
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={language === 'he' ? 'רשימת קניות' : 'Shopping List'}
        subtitle={language === 'he' ? 'הפריטים השמורים בחשבון שלך' : 'Items saved to your customer account'}
        breadcrumbs={[
          { label: language === 'he' ? 'לוח בקרה' : 'Dashboard', href: '/customer/dashboard' },
          { label: language === 'he' ? 'רשימת קניות' : 'Shopping List' },
        ]}
        isRTL={isRTL}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={!isCustomer || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" /> : <RefreshCw className="h-4 w-4 stroke-[1.5]" />}
              {language === 'he' ? 'רענון' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleSaveNow}
              disabled={!isCustomer || saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2D5A27] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#234A1F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" /> : <CheckCircle2 className="h-4 w-4 stroke-[1.5]" />}
              {language === 'he' ? 'שמור' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          title={language === 'he' ? 'פריטים ברשימה' : 'List Items'}
          value={itemCount}
          icon={<ClipboardList className="h-5 w-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={language === 'he' ? 'ספקים' : 'Vendors'}
          value={vendorCount}
          icon={<ShoppingBag className="h-5 w-5 stroke-[1.5]" />}
          color="amber"
        />
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">{language === 'he' ? 'עודכן לאחרונה' : 'Last Saved'}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatSavedTime(lastSavedAt, isRTL)}</p>
          <p className="mt-1 text-sm text-gray-500">{formatIls(subtotal)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white">
          <EmptyState
            icon="cart"
            title={language === 'he' ? 'רשימת הקניות ריקה' : 'Your shopping list is empty'}
            description={language === 'he' ? 'הוסיפו מוצרים מהשוק כדי לשמור אותם כאן.' : 'Add products from the marketplace to keep them here.'}
            action={{
              label: language === 'he' ? 'עבור לשוק' : 'Browse Marketplace',
              onClick: () => {
                window.location.href = '/marketplace';
              },
            }}
          />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {language === 'he' ? 'פריטים' : 'Items'}
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const imageSrc = item.image || fallbackImage;
                const lineTotal = getUnitPrice(item) * item.quantity;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
                    className="grid gap-4 border-b border-gray-50 p-5 last:border-b-0 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="relative h-[72px] w-[72px] overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={imageSrc}
                        alt={item.name || 'Product image'}
                        fill
                        sizes="72px"
                        className="object-cover"
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage;
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.vendorName || item.vendor || item.vendorId || (language === 'he' ? 'ספק כפר' : 'KFAR Vendor')}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#2D5A27]">
                        {formatIls(getUnitPrice(item))} x {item.quantity}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 md:justify-end">
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                          aria-label={language === 'he' ? 'הפחת כמות' : 'Decrease quantity'}
                        >
                          <Minus className="h-4 w-4 stroke-[1.5]" />
                        </button>
                        <span className="min-w-10 px-3 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                          aria-label={language === 'he' ? 'הגדל כמות' : 'Increase quantity'}
                        >
                          <Plus className="h-4 w-4 stroke-[1.5]" />
                        </button>
                      </div>

                      <div className={isRTL ? 'text-left' : 'text-right'}>
                        <p className="text-base font-bold text-gray-900">{formatIls(lineTotal)}</p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                          {language === 'he' ? 'הסר' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <aside className="h-fit rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">{language === 'he' ? 'סיכום' : 'Summary'}</h2>
            <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">{language === 'he' ? 'פריטים' : 'Items'}</span>
                <span className="font-semibold text-gray-900">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</span>
                <span className="font-semibold text-gray-900">{formatIls(subtotal)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Link
                href="/cart"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D5A27] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#234A1F]"
              >
                <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
                {language === 'he' ? 'פתח עגלה' : 'Open Cart'}
                <ArrowRight className={`h-4 w-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <Link
                href="/marketplace"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                {language === 'he' ? 'הוסף מוצרים' : 'Add Products'}
              </Link>
              <button
                type="button"
                onClick={handleClear}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 stroke-[1.5]" />
                {language === 'he' ? 'נקה רשימה' : 'Clear List'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </motion.div>
  );
}
