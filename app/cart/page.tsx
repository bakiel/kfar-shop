'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  ShoppingCart, Store, Truck, Minus, Plus, Trash2, CheckCircle, X,
  Lock, CreditCard, Shield, QrCode, Heart, ArrowRight, Tag, Gift
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

  // Currency conversion rates
  const currencyRates = {
    ILS: 1,
    USD: 0.27,
    EUR: 0.25,
    GBP: 0.21
  };

  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  // Group items by vendor
  useEffect(() => {
    const groups = items.reduce((acc: VendorGroup[], item) => {
      // Calculate item price with bulk pricing
      let itemPrice = item.price;
      if (item.bulkPricing && item.bulkPricing.length > 0) {
        const applicableBulk = item.bulkPricing
          .filter(bulk => item.quantity >= bulk.quantity)
          .sort((a, b) => b.quantity - a.quantity)[0];
        
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
    // Map vendor names to their IDs for consistent logo retrieval
    const vendorIdMap: Record<string, string> = {
      'Teva Deli': 'teva-deli',
      'Gahn Delight': 'gahn-delight',
      'Queens Cuisine': 'queens-cuisine',
      'VOP Shop': 'vop-shop',
      'People Store': 'people-store'
    };
    
    const vendorId = vendorIdMap[vendor];
    
    // Use consistent logo paths based on vendor ID
    const logoPath = vendorId === 'people-store' ? '/images/vendors/people_store_logo_community_retail.jpg' :
                     vendorId === 'teva-deli' ? '/images/vendors/teva_deli_logo_vegan_factory.jpg' :
                     vendorId === 'queens-cuisine' ? '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg' :
                     vendorId === 'gahn-delight' ? '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg' :
                     vendorId === 'vop-shop' ? '/images/vendors/vop_shop_logo_village_marketplace.jpg' :
                     '/images/vendors/people_store_logo_community_retail.jpg'; // Default to People Store logo
    
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
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-gray-300 stroke-[1.5]" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  {language === 'he' ? 'העגלה שלך ריקה' : 'Your cart is empty'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {language === 'he'
                    ? 'גלה מוצרים מדהימים מספקי כפר השלום'
                    : 'Discover amazing products from Village of Peace vendors'}
                </p>
                <Link href="/shop">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all cursor-pointer"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <Store className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'התחל לקנות' : 'Start Shopping'}
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
      <div className="min-h-screen bg-[#fef9ef] py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              {language === 'he' ? 'עגלת קניות' : 'Shopping Cart'} ({items.length} {items.length === 1 ? (language === 'he' ? 'פריט' : 'item') : (language === 'he' ? 'פריטים' : 'items')})
            </h1>

            {/* Currency Selector */}
            <div className="flex gap-2">
              {Object.keys(currencySymbols).map(currency => (
                <motion.button
                  key={currency}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedCurrency === currency
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedCurrency === currency ? { backgroundColor: '#478c0b' } : {}}
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
              {vendorGroups.map((group, index) => (
                <motion.div
                  key={index}
                  variants={listItem}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  transition={cardTransition}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  style={{ border: '2px solid #cfe7c1' }}
                >
                  {/* Vendor Header */}
                  <div className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                          <Image src={group.vendorLogo}
                            alt={`${group.vendor || "Product image"} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{group.vendor}</h3>
                          <p className="text-sm opacity-90 flex items-center gap-1">
                            <Truck className="w-4 h-4 stroke-[1.5]" />
                            {language === 'he' ? 'משלוח משוער:' : 'Est. delivery:'} {group.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                      <div className={isRTL ? 'text-left' : 'text-right'}>
                        <p className="text-sm opacity-90">{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</p>
                        <p className="text-xl font-bold">{convertPrice(group.subtotal)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Items */}
                  <div className="p-6 space-y-4">
                    {group.items.map((item) => {
                      // Fix People Store images
                      let itemImage = item.image;
                      if (item.vendorId === 'people-store' && !item.image.startsWith('/images/')) {
                        // If it's a People Store item with a broken image path, use the first available People Store image
                        itemImage = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                      }
                      
                      return (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={itemImage}
                              alt={item.name || "Product image"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Fallback image on error
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                              }}
                            />
                          </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {language === 'he' ? 'מחיר ליחידה:' : 'Unit price:'} {convertPrice(item.price)}
                            {item.bulkPricing && item.bulkPricing.length > 0 && (() => {
                              const applicableBulk = item.bulkPricing
                                .filter((bulk: any) => item.quantity >= bulk.quantity)
                                .sort((a: any, b: any) => b.quantity - a.quantity)[0];
                              
                              if (applicableBulk) {
                                const savings = (item.price - applicableBulk.price) * item.quantity;
                                return (
                                  <>
                                    <span className={`line-through ${isRTL ? 'mr-2' : 'ml-2'}`}>{convertPrice(item.price)}</span>
                                    <span className={`text-green-600 font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                      {convertPrice(applicableBulk.price)} ({language === 'he' ? 'חיסכון' : 'Save'} {convertPrice(savings)})
                                    </span>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <motion.button
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Minus className="w-4 h-4 stroke-[1.5]" />
                              </motion.button>
                              <span className="px-4 py-1 font-medium min-w-[40px] text-center">{item.quantity}</span>
                              <motion.button
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Plus className="w-4 h-4 stroke-[1.5]" />
                              </motion.button>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5 stroke-[1.5]" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{ color: '#478c0b' }}>
                            {(() => {
                              let itemPrice = item.price;
                              if (item.bulkPricing && item.bulkPricing.length > 0) {
                                const applicableBulk = item.bulkPricing
                                  .filter((bulk: any) => item.quantity >= bulk.quantity)
                                  .sort((a: any, b: any) => b.quantity - a.quantity)[0];
                                
                                if (applicableBulk) {
                                  itemPrice = applicableBulk.price;
                                }
                              }
                              return convertPrice(itemPrice * item.quantity);
                            })()}
                          </p>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Free Shipping Progress */}
                  {group.vendor === 'Teva Deli' && group.subtotal < 150 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 pb-4"
                    >
                      <div className="bg-[#fef9ef] rounded-lg p-3">
                        <p className="text-sm mb-2 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                          {language === 'he'
                            ? `הוסף ${convertPrice(150 - group.subtotal)} עוד למשלוח חינם!`
                            : `Add ${convertPrice(150 - group.subtotal)} more for free shipping!`}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(group.subtotal / 150) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: '#478c0b' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24">
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
                        placeholder={language === 'he' ? 'הזן קוד קופון' : 'Enter coupon code'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2 pl-10 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] transition-colors"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyCoupon}
                      className="px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all cursor-pointer"
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
                            className="flex items-center justify-between text-sm bg-green-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                              {coupon} {language === 'he' ? 'הוחל' : 'applied'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setAppliedCoupons(appliedCoupons.filter(c => c !== coupon))}
                              className="text-red-500 hover:text-red-600 cursor-pointer"
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
                <div className="space-y-3 pb-6 border-b">
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</span>
                    <span>{convertPrice(subtotal)}</span>
                  </div>
                  <AnimatePresence>
                    {discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-green-600"
                      >
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4 stroke-[1.5]" />
                          {language === 'he' ? 'הנחה' : 'Discount'}
                        </span>
                        <span>-{convertPrice(discount)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'מע"מ (17%)' : 'Tax (17%)'}</span>
                    <span>{convertPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg py-6">
                  <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.1, color: '#478c0b' }}
                    animate={{ scale: 1, color: '#c23c09' }}
                    transition={{ duration: 0.3 }}
                    style={{ color: '#c23c09' }}
                  >
                    {convertPrice(total)}
                  </motion.span>
                </div>

                <Link href="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(71, 140, 11, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all cursor-pointer"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'המשך לתשלום מאובטח' : 'Proceed to Secure Checkout'}
                    <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                </Link>

                {/* QR Code for Quick Cart Save */}
                <motion.div
                  ref={summaryRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isSummaryInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6"
                >
                  <h3 className="text-base font-bold mb-3 text-center" style={{ color: '#3a3a1d' }}>
                    {language === 'he' ? 'שמור עגלה להמשך' : 'Save Cart for Later'}
                  </h3>
                  <div className="flex justify-center">
                    <SmartQRCompactFixed
                      type="order"
                      data={{
                        id: `cart-${Date.now()}`,
                        items: items.map(item => ({
                          id: item.id,
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price
                        })),
                        total: total,
                        currency: selectedCurrency,
                        timestamp: Date.now()
                      }}
                      size={200}
                      hideActions={false}
                    />
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isSummaryInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 pt-6 border-t text-center"
                >
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'he' ? 'אפשרויות תשלום מאובטחות' : 'Secure Payment Options'}
                  </p>
                  <div className="flex justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <CreditCard className="w-8 h-8 text-blue-600 stroke-[1.5]" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Shield className="w-8 h-8 text-green-600 stroke-[1.5]" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <QrCode className="w-8 h-8 text-purple-600 stroke-[1.5]" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Lock className="w-8 h-8 text-gray-600 stroke-[1.5]" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {language === 'he' ? 'SSL מאובטח • תשלום בטוח 100%' : 'SSL Secured • 100% Safe Checkout'}
                  </p>
                </motion.div>

                {/* Community Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isSummaryInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="mt-6 p-4 bg-gradient-to-r from-[#478c0b] to-[#f6af0d] rounded-lg text-white text-center cursor-default"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Heart className="w-6 h-6 mx-auto mb-2 stroke-[1.5]" />
                  </motion.div>
                  <p className="text-sm font-medium">
                    {language === 'he' ? 'תומכים בכפר השלום' : 'Supporting Village of Peace'}
                  </p>
                  <p className="text-xs mt-1">Yah Khai! HalleluYah!</p>
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