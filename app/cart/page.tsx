'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  ShoppingCart, Store, Truck, Minus, Plus, Trash2, CheckCircle, X,
  Lock, CreditCard, Shield, QrCode, Heart, ArrowRight, Tag, Gift,
  ArrowLeft, Sparkles, Package
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import FloatingCartPopup from '@/components/cart/FloatingCartPopup';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';
import {
  listContainer,
  listItem,
  cardTransition
} from '@/lib/animations/motion-variants';

interface VendorGroup {
  vendor: string;
  vendorLogo: string;
  items: any[];
  subtotal: number;
  estimatedDelivery?: string;
}

export default function EnhancedCartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { language, isRTL, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Refs for scroll animations
  const summaryRef = useRef(null);
  const isSummaryInView = useInView(summaryRef, { once: true, margin: '-50px' });

  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // Currency conversion rates
  const currencyRates = {
    ILS: 1,
    USD: 0.27,
    EUR: 0.25,
    GBP: 0.21
  };

  const currencySymbols = {
    ILS: '\u20AA',
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3'
  };

  // Group items by vendor
  useEffect(() => {
    const groups = items.reduce((acc: VendorGroup[], item) => {
      // Calculate item price with bulk pricing
      let itemPrice = item.price;
      if (item.bulkPricing && item.bulkPricing.length > 0) {
        const applicableBulk = item.bulkPricing
          .filter((bulk: any) => item.quantity >= bulk.quantity)
          .sort((a: any, b: any) => b.quantity - a.quantity)[0];

        if (applicableBulk) {
          itemPrice = applicableBulk.price;
        }
      }

      const existingGroup = acc.find(g => g.vendor === item.vendorName);
      if (existingGroup) {
        existingGroup.items.push(item);
        existingGroup.subtotal += itemPrice * item.quantity;
      } else {
        acc.push({
          vendor: item.vendorName,
          vendorLogo: getVendorLogo(item.vendorName),
          items: [item],
          subtotal: itemPrice * item.quantity,
          estimatedDelivery: getEstimatedDelivery(item.vendorName)
        });
      }
      return acc;
    }, []);
    setVendorGroups(groups);
  }, [items]);

  // Show floating cart when items are added
  useEffect(() => {
    if (items.length > 0) {
      setShowFloatingCart(true);
      const timer = setTimeout(() => setShowFloatingCart(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  const getVendorLogo = (vendor: string): string => {
    const vendorIdMap: Record<string, string> = {
      'Teva Deli': 'teva-deli',
      'Gahn Delight': 'gahn-delight',
      'Queens Cuisine': 'queens-cuisine',
      'VOP Shop': 'vop-shop',
      'People Store': 'people-store'
    };

    const vendorId = vendorIdMap[vendor];

    const logoPath = vendorId === 'people-store' ? '/images/vendors/people_store_logo_community_retail.jpg' :
                     vendorId === 'teva-deli' ? '/images/vendors/teva_deli_logo_vegan_factory.jpg' :
                     vendorId === 'queens-cuisine' ? '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg' :
                     vendorId === 'gahn-delight' ? '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg' :
                     vendorId === 'vop-shop' ? '/images/vendors/vop_shop_logo_village_marketplace.jpg' :
                     '/images/vendors/people_store_logo_community_retail.jpg';

    return logoPath;
  };

  const getEstimatedDelivery = (vendor: string): string => {
    const deliveryTimes: Record<string, string> = {
      'Teva Deli': '1-2 business days',
      'Gahn Delight': 'Same day (order before 2PM)',
      'Queens Cuisine': '2-3 business days',
      'VOP Shop': '3-5 business days',
      'People Store': '2-3 business days'
    };
    return deliveryTimes[vendor] || '2-3 business days';
  };

  const applyCoupon = () => {
    const validCoupons: Record<string, { discount: number; description: string }> = {
      'KFAR10': { discount: 0.1, description: '10% off' },
      'NEWMEMBER': { discount: 0.15, description: '15% off for new members' },
      'VOP2024': { discount: 0.2, description: '20% Village of Peace discount' }
    };

    if (validCoupons[couponCode] && !appliedCoupons.includes(couponCode)) {
      setAppliedCoupons([...appliedCoupons, couponCode]);
      setCouponCode('');
      setCouponSuccess(true);
      setTimeout(() => setCouponSuccess(false), 2000);
    }
  };

  const calculateDiscount = () => {
    const discounts: Record<string, number> = {
      'KFAR10': 0.1,
      'NEWMEMBER': 0.15,
      'VOP2024': 0.2
    };

    return appliedCoupons.reduce((total, coupon) => {
      return total + (getCartTotal() * (discounts[coupon] || 0));
    }, 0);
  };

  const convertPrice = (price: number) => {
    const converted = price * currencyRates[selectedCurrency as keyof typeof currencyRates];
    return `${currencySymbols[selectedCurrency as keyof typeof currencySymbols]}${converted.toFixed(2)}`;
  };

  const handleRemoveItem = (itemId: string) => {
    setRemovingItem(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItem(null);
    }, 300);
  };

  const subtotal = getCartTotal();
  const discount = calculateDiscount();
  const tax = (subtotal - discount) * 0.17; // 17% VAT
  const total = subtotal - discount + tax;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fef9ef] py-12" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gray-50 flex items-center justify-center"
                >
                  <ShoppingCart className="w-12 h-12 text-gray-300 stroke-[1.5]" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#3a3a1d' }}>
                  {language === 'he' ? 'העגלה שלך ריקה' : 'Your cart is empty'}
                </h2>
                <p className="text-gray-500 mb-8">
                  {language === 'he'
                    ? 'גלו מוצרים מדהימים מספקי כפר השלום'
                    : 'Discover amazing products from Village of Peace vendors'}
                </p>
                <Link href="/shop">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(71, 140, 11, 0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg hover:shadow-lg transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}
                  >
                    <Store className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'התחילו לקנות' : 'Start Shopping'}
                    <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef] py-8 md:py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          >
            <div>
              <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#478c0b] transition-colors mb-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
                {language === 'he' ? 'חזרה לחנות' : 'Continue Shopping'}
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#3a3a1d' }}>
                {language === 'he' ? 'עגלת קניות' : 'Shopping Cart'}
                <span className="text-lg font-normal text-gray-400 ml-3">
                  ({items.length} {items.length === 1 ? (language === 'he' ? 'פריט' : 'item') : (language === 'he' ? 'פריטים' : 'items')})
                </span>
              </h1>
            </div>

            {/* Currency Selector */}
            <div className="flex gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
              {Object.keys(currencySymbols).map(currency => (
                <motion.button
                  key={currency}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    selectedCurrency === currency
                      ? 'bg-[#478c0b] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {currencySymbols[currency as keyof typeof currencySymbols]}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="lg:col-span-2 space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {vendorGroups.map((group, index) => (
                  <motion.div
                    key={group.vendor}
                    layout
                    variants={listItem}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                  >
                    {/* Vendor Header */}
                    <div className="bg-gradient-to-r from-[#478c0b] to-[#2D5A27] p-5">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-white/30 shadow-sm">
                            <Image src={group.vendorLogo}
                              alt={`${group.vendor || "Product image"} logo`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{group.vendor}</h3>
                            <p className="text-sm text-white/75 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 stroke-[1.5]" />
                              {language === 'he' ? 'משלוח:' : 'Delivery:'} {group.estimatedDelivery}
                            </p>
                          </div>
                        </div>
                        <div className={isRTL ? 'text-left' : 'text-right'}>
                          <p className="text-xs text-white/60 uppercase tracking-wider">{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</p>
                          <p className="text-xl font-bold">{convertPrice(group.subtotal)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Items */}
                    <div className="p-5 md:p-6">
                      <AnimatePresence mode="popLayout">
                        {group.items.map((cartItem) => {
                          let itemImage = cartItem.image;
                          if (cartItem.vendorId === 'people-store' && !cartItem.image.startsWith('/images/')) {
                            itemImage = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                          }

                          return (
                            <motion.div
                              key={cartItem.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: removingItem === cartItem.id ? 0.3 : 1, y: 0, scale: removingItem === cartItem.id ? 0.95 : 1 }}
                              exit={{ opacity: 0, x: isRTL ? 60 : -60, transition: { duration: 0.3 } }}
                              className="flex gap-4 py-5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0"
                            >
                              {/* Product Image */}
                              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <Image
                                  src={itemImage}
                                  alt={cartItem.name || "Product image"}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.src = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                                  }}
                                />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#3a3a1d] mb-1 truncate">{cartItem.name}</h4>
                                <p className="text-sm text-gray-400 mb-3">
                                  {language === 'he' ? 'מחיר:' : 'Price:'} {convertPrice(cartItem.price)}
                                  {cartItem.bulkPricing && cartItem.bulkPricing.length > 0 && (() => {
                                    const applicableBulk = cartItem.bulkPricing
                                      .filter((bulk: any) => cartItem.quantity >= bulk.quantity)
                                      .sort((a: any, b: any) => b.quantity - a.quantity)[0];

                                    if (applicableBulk) {
                                      const savings = (cartItem.price - applicableBulk.price) * cartItem.quantity;
                                      return (
                                        <span className={`text-[#478c0b] font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                          {language === 'he' ? 'חיסכון' : 'Save'} {convertPrice(savings)}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </p>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    <motion.button
                                      whileHover={{ backgroundColor: '#f3f4f6' }}
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => updateQuantity(cartItem.id, Math.max(0, cartItem.quantity - 1))}
                                      className="px-3 py-2.5 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                      <Minus className="w-4 h-4 stroke-[1.5] text-gray-500" />
                                    </motion.button>
                                    <motion.span
                                      key={cartItem.quantity}
                                      initial={{ scale: 1.3 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 0.15 }}
                                      className="px-4 py-1 font-bold text-[#3a3a1d] min-w-[40px] text-center text-sm"
                                    >
                                      {cartItem.quantity}
                                    </motion.span>
                                    <motion.button
                                      whileHover={{ backgroundColor: '#f3f4f6' }}
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                      className="px-3 py-2.5 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-4 h-4 stroke-[1.5] text-gray-500" />
                                    </motion.button>
                                  </div>

                                  <motion.button
                                    whileHover={{ scale: 1.1, color: '#dc2626' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRemoveItem(cartItem.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Price */}
                              <div className={isRTL ? 'text-left' : 'text-right'}>
                                <motion.p
                                  key={`${cartItem.id}-${cartItem.quantity}`}
                                  initial={{ scale: 1.1 }}
                                  animate={{ scale: 1 }}
                                  className="font-bold text-lg"
                                  style={{ color: '#478c0b' }}
                                >
                                  {(() => {
                                    let itemPrice = cartItem.price;
                                    if (cartItem.bulkPricing && cartItem.bulkPricing.length > 0) {
                                      const applicableBulk = cartItem.bulkPricing
                                        .filter((bulk: any) => cartItem.quantity >= bulk.quantity)
                                        .sort((a: any, b: any) => b.quantity - a.quantity)[0];

                                      if (applicableBulk) {
                                        itemPrice = applicableBulk.price;
                                      }
                                    }
                                    return convertPrice(itemPrice * cartItem.quantity);
                                  })()}
                                </motion.p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Free Shipping Progress */}
                    {group.vendor === 'Teva Deli' && group.subtotal < 150 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-5 md:px-6 pb-5"
                      >
                        <div className="bg-[#478c0b]/5 rounded-xl p-4">
                          <p className="text-sm mb-2 flex items-center gap-2 text-[#3a3a1d]">
                            <Truck className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                            {language === 'he'
                              ? `הוסיפו ${convertPrice(150 - group.subtotal)} עוד למשלוח חינם!`
                              : `Add ${convertPrice(150 - group.subtotal)} more for free shipping!`}
                          </p>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((group.subtotal / 150) * 100, 100)}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-2 rounded-full bg-gradient-to-r from-[#478c0b] to-[#2D5A27]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  {language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}
                </h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                      <input
                        type="text"
                        placeholder={language === 'he' ? 'קוד קופון' : 'Coupon code'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 pl-10 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors text-sm"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyCoupon}
                      className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:shadow-lg transition-all cursor-pointer"
                      style={{ backgroundColor: '#f6af0d' }}
                    >
                      {language === 'he' ? 'החל' : 'Apply'}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {appliedCoupons.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1 overflow-hidden"
                      >
                        {appliedCoupons.map(coupon => (
                          <motion.div
                            key={coupon}
                            initial={{ opacity: 0, x: -10 }}
                            animate={couponSuccess ? {
                              opacity: 1,
                              x: 0,
                              scale: [1, 1.05, 1],
                            } : { opacity: 1, x: 0 }}
                            className="flex items-center justify-between text-sm bg-[#478c0b]/5 px-3 py-2 rounded-lg"
                          >
                            <span className="text-[#478c0b] flex items-center gap-1 font-medium">
                              <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                              {coupon} {language === 'he' ? 'הוחל' : 'applied'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setAppliedCoupons(appliedCoupons.filter(c => c !== coupon))}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-4 h-4 stroke-[1.5]" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Summary Details */}
                <div className="space-y-3 pb-5 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</span>
                    <span className="font-medium text-[#3a3a1d]">{convertPrice(subtotal)}</span>
                  </div>
                  <AnimatePresence>
                    {discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-sm"
                      >
                        <span className="flex items-center gap-1 text-[#478c0b]">
                          <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
                          {language === 'he' ? 'הנחה' : 'Discount'}
                        </span>
                        <span className="text-[#478c0b] font-medium">-{convertPrice(discount)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{language === 'he' ? 'מע"מ (17%)' : 'VAT (17%)'}</span>
                    <span className="font-medium text-[#3a3a1d]">{convertPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg py-5">
                  <span className="text-[#3a3a1d]">{language === 'he' ? 'סה"כ' : 'Total'}</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: '#c23c09' }}
                  >
                    {convertPrice(total)}
                  </motion.span>
                </div>

                <Link href="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(71, 140, 11, 0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-white font-semibold text-lg transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}
                  >
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'המשיכו לתשלום' : 'Proceed to Checkout'}
                    <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                </Link>

                {/* Trust Badges */}
                <motion.div
                  ref={summaryRef}
                  initial={{ opacity: 0 }}
                  animate={isSummaryInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 pt-6 border-t border-gray-100 text-center"
                >
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">
                    {language === 'he' ? 'תשלום מאובטח' : 'Secure Payment'}
                  </p>
                  <div className="flex justify-center gap-4">
                    {[
                      { icon: CreditCard, color: '#3b82f6' },
                      { icon: Shield, color: '#478c0b' },
                      { icon: QrCode, color: '#8b5cf6' },
                      { icon: Lock, color: '#6b7280' }
                    ].map((badge, i) => {
                      const BadgeIcon = badge.icon;
                      return (
                        <motion.div key={i} whileHover={{ scale: 1.15, y: -2 }} transition={{ duration: 0.2 }}>
                          <BadgeIcon className="w-7 h-7 stroke-[1.5]" style={{ color: badge.color }} />
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {language === 'he' ? 'SSL מאובטח - 100% בטוח' : 'SSL Secured - 100% Safe'}
                  </p>
                </motion.div>

                {/* Community Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isSummaryInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 p-4 rounded-xl text-center text-white"
                  style={{ background: 'linear-gradient(135deg, #478c0b, #f6af0d)' }}
                >
                  <motion.div
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Heart className="w-5 h-5 mx-auto mb-2 stroke-[1.5]" />
                  </motion.div>
                  <p className="text-sm font-semibold">
                    {language === 'he' ? 'תומכים בכפר השלום' : 'Supporting Village of Peace'}
                  </p>
                  <p className="text-xs mt-1 text-white/75">Yah Khai! HalleluYah!</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Popup */}
      {showFloatingCart && (
        <FloatingCartPopup
          items={items}
          onClose={() => setShowFloatingCart(false)}
        />
      )}
    </Layout>
  );
}
