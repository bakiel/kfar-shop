'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import PaymentMethodSelector, { CheckoutPaymentMethod, getPaymentMethodLabel } from '@/components/checkout/PaymentMethodSelector';

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { isRTL } = useLanguage();
  const { accessToken } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('cash');

  const total = getCartTotal();
  const canSubmit = fullName.trim().length >= 2
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    && address.trim().length >= 5
    && phone.trim().length >= 7
    && items.length > 0
    && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: items.map(it => ({
            productId: it.id,
            name: it.name,
            quantity: it.quantity,
            price: it.price,
            vendorId: it.vendorId,
            vendorName: it.vendorName,
            image: it.image,
          })),
          subtotal: total,
          total,
          paymentMethod,
          deliveryMethod: 'delivery',
          currency: 'ILS',
          customer: {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to place order');
      }
      setOrderNumber(data.order.orderNumber);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (orderNumber) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#FDFBF7] py-16 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-[#F5F0E8] p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#2D5A27]/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#2D5A27] stroke-[1.5]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E3D1A] mb-2">
              {isRTL ? 'ההזמנה התקבלה' : 'Order received'}
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {isRTL
                ? `נצור קשר בהקדם לתיאום המשלוח. אמצעי התשלום: ${getPaymentMethodLabel(paymentMethod)}.`
                : `We'll be in touch shortly to arrange delivery. Payment method: ${getPaymentMethodLabel(paymentMethod)}.`}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F0E8] rounded-lg mb-6">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                {isRTL ? 'מספר הזמנה' : 'Order #'}
              </span>
              <span className="text-sm font-mono font-semibold text-[#1E3D1A]">{orderNumber}</span>
            </div>
            <div>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium hover:bg-[#1E3D1A] transition-colors"
              >
                {isRTL ? 'חזור לחנות' : 'Back to marketplace'}
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#FDFBF7] py-16 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="w-10 h-10 text-[#C4A265] stroke-[1.5] mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-[#1E3D1A] mb-2">
              {isRTL ? 'העגלה שלך ריקה' : 'Your cart is empty'}
            </h1>
            <Link
              href="/marketplace"
              className="inline-block mt-4 px-6 py-2.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium hover:bg-[#1E3D1A]"
            >
              {isRTL ? 'עיין בחנות' : 'Browse marketplace'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDFBF7] py-10 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="h-0.5 w-10 bg-[#C4A265] mb-4" />
            <h1 className="text-3xl font-bold text-[#1E3D1A] mb-2">
              {isRTL ? 'קופה מהירה' : 'Quick checkout'}
            </h1>
            <p className="text-sm text-gray-600">
              {isRTL
                ? 'משלוח לכפר. תשלום במזומן בעת המסירה.'
                : `Delivery to the village. ${getPaymentMethodLabel(paymentMethod)} is selected.`}
            </p>
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E8B84D]/15 border border-[#E8B84D]/30 rounded-lg mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84D]" />
            <span className="text-xs text-[#8a6b1e] font-medium uppercase tracking-wide">
              {isRTL ? 'תקופת השקה - ללא תשלום מראש' : 'Launch phase - no prepayment'}
            </span>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl border border-[#F5F0E8] p-5 mb-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              {isRTL ? 'סיכום הזמנה' : 'Your order'}
            </h2>
            <ul className="divide-y divide-[#F5F0E8]">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-gray-800">
                    {it.name}{' '}
                    <span className="text-gray-400">x {it.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900">&#8362;{(it.price * it.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F5F0E8]">
              <span className="text-sm text-gray-600">{isRTL ? 'סה"כ' : 'Total'}</span>
              <span className="text-xl font-bold text-[#1E3D1A]">&#8362;{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="bg-white rounded-xl border border-[#F5F0E8] p-6 space-y-5">
            <div>
              <label htmlFor="checkout-full-name" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                {isRTL ? 'שם מלא' : 'Full name'}
              </label>
              <input
                id="checkout-full-name"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                placeholder={isRTL ? 'לדוגמה, ישראל ישראלי' : 'e.g. Dawid Israel'}
              />
            </div>

            <div>
              <label htmlFor="checkout-email" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                {isRTL ? 'אימייל לאישור הזמנה' : 'Email for order confirmation'}
              </label>
              <input
                id="checkout-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                spellCheck={false}
                required
                className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                placeholder={isRTL ? 'לדוגמה, name@example.com' : 'e.g. customer@example.com'}
              />
            </div>

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              isRTL={isRTL}
            />

            <div>
              <label htmlFor="checkout-address" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                {isRTL ? 'כתובת' : 'Delivery address'}
              </label>
              <textarea
                id="checkout-address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                required
                rows={2}
                className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] resize-none"
                placeholder={isRTL ? 'רחוב, כניסה, דירה - דימונה' : 'Street, entrance, flat - Dimona'}
              />
            </div>

            <div>
              <label htmlFor="checkout-phone" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                {isRTL ? 'טלפון' : 'Phone'}
              </label>
              <input
                id="checkout-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
                className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                placeholder="+972 50 123 4567"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2D5A27] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3D1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                : <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />}
              {submitting
                ? (isRTL ? 'שולח...' : 'Placing order...')
                : (isRTL ? 'אשר הזמנה - תשלום במסירה' : `Place order - ${getPaymentMethodLabel(paymentMethod)}`)}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            {isRTL
              ? 'נצור קשר טלפוני לאישור המשלוח'
              : "We'll call to confirm delivery before dispatch"}
          </p>
        </div>
      </div>
    </Layout>
  );
}
