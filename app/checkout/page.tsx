'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  User, Truck, CreditCard, CheckCircle, MapPin, Star,
  ArrowLeft, ArrowRight, ShoppingCart, ChevronDown,
  Shield, QrCode, Copy, MessageCircle, Package, FileText,
  Download, Loader2, X, AlertCircle, Coins, Building, Phone, Mail
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import QRCodePayment from '@/components/checkout/QRCodePayment';
import SmartSuggestions from '@/components/checkout/SmartSuggestions';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';
import { listContainer, listItem } from '@/lib/animations/motion-variants';
import '@/styles/checkout-mobile.css';

interface CheckoutStep {
  id: number;
  title: string;
  icon: string;
  component: JSX.Element;
}

export default function EnhancedCheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const [isVOPMember, setIsVOPMember] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [stockError, setStockError] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    // Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Shipping Address
    streetAddress: '',
    city: 'Dimona',
    postalCode: '84000',
    country: 'IL',
    
    // Delivery Option
    deliveryMethod: 'pickup',
    deliveryPrice: 0,
    
    // Payment Method
    paymentMethod: 'braysheet',
    
    // Currency
    currency: 'ILS'
  });

  const [savedAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: '123 Main Street, Dimona, Israel',
      phone: '+972-8-1234567'
    },
    {
      id: 2,
      type: 'Work',
      address: 'Village of Peace, Dimona, Israel',
      phone: '+972-8-7654321'
    }
  ]);

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

  const deliveryOptions = [
    { id: 'pickup', name: 'Pickup from Village of Peace', time: 'Available today', price: 0 },
    { id: 'local', name: 'Local Delivery (Dimona)', time: '1-2 business days', price: 15 },
    { id: 'standard', name: 'Standard Shipping (Israel)', time: '3-5 business days', price: 25 },
    { id: 'international', name: 'International Shipping', time: '7-14 business days', price: 75 }
  ];

  const paymentMethods = [
    { id: 'braysheet', name: 'Braysheet Token', icon: 'fa-coins', description: 'Community digital currency' },
    { id: 'qr', name: 'QR Code Payment', icon: 'fa-qrcode', description: 'Scan with your mobile banking app' },
    { id: 'card', name: 'Credit Card', icon: 'fa-credit-card', description: 'Visa, Mastercard, American Express' },
    { id: 'bank', name: 'Bank Transfer', icon: 'fa-university', description: 'Direct bank transfer' }
  ];

  useEffect(() => {
    if (items.length === 0 && currentStep < 4) {
      router.push('/cart');
    }
  }, [items, currentStep, router]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const convertPrice = (price: number) => {
    const converted = price * currencyRates[formData.currency];
    return `${currencySymbols[formData.currency]}${converted.toFixed(2)}`;
  };

  const calculateTotals = () => {
    const subtotal = getCartTotal();
    const shipping = formData.deliveryPrice;
    const discount = isVOPMember ? subtotal * 0.1 : 0;
    const taxableAmount = subtotal - discount + shipping;
    const tax = taxableAmount * 0.17;
    const total = taxableAmount + tax;

    return { subtotal, shipping, discount, tax, total };
  };

  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: 'Information',
      icon: 'fa-user',
      component: <ContactInfoStep />
    },
    {
      id: 2,
      title: 'Delivery',
      icon: 'fa-truck',
      component: <DeliveryStep />
    },
    {
      id: 3,
      title: 'Payment',
      icon: 'fa-credit-card',
      component: <PaymentStep />
    },
    {
      id: 4,
      title: 'Confirmation',
      icon: 'fa-check-circle',
      component: <ConfirmationStep />
    }
  ];

  function ContactInfoStep() {
    return (
      <motion.div
        className="space-y-6"
        variants={listContainer}
        initial="hidden"
        animate="show"
      >
        {/* Guest Checkout Option */}
        {!isGuest && (
          <motion.div variants={listItem} className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="mb-2 text-sm md:text-base">
              {language === 'he' ? 'כבר יש לך חשבון?' : 'Already have an account?'}
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[#478c0b] font-semibold underline text-sm md:text-base cursor-pointer"
              >
                {language === 'he' ? 'התחבר כאן' : 'Sign in here'}
              </motion.button>
              <span className="hidden md:inline">|</span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsGuest(true)}
                className="text-[#478c0b] font-semibold underline text-sm md:text-base cursor-pointer"
              >
                {language === 'he' ? 'המשך כאורח' : 'Continue as guest'}
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.h2
          variants={listItem}
          className="text-xl md:text-2xl font-bold flex items-center gap-3"
          style={{ color: '#3a3a1d' }}
        >
          <User className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
          {language === 'he' ? 'פרטי התקשרות' : 'Contact Information'}
        </motion.h2>

        <AnimatePresence>
          {isVOPMember && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] text-white p-3 md:p-4 rounded-lg flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Star className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] fill-current" />
              </motion.div>
              <span className="font-semibold text-sm md:text-base">
                {language === 'he' ? 'חבר קהילת VOP - מחיר מיוחד!' : 'VOP Community Member - Special Pricing Applied'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={listItem} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-sm md:text-base">
              {language === 'he' ? 'שם פרטי' : 'First Name'}
            </label>
            <input
              type="text"
              name="given-name"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-sm md:text-base">
              {language === 'he' ? 'שם משפחה' : 'Last Name'}
            </label>
            <input
              type="text"
              name="family-name"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
        </motion.div>

        <motion.div variants={listItem}>
          <label className="block font-semibold mb-2 text-sm md:text-base">
            {language === 'he' ? 'כתובת אימייל' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
        </motion.div>

        <motion.div variants={listItem}>
          <label className="block font-semibold mb-2 text-sm md:text-base">
            {language === 'he' ? 'מספר טלפון' : 'Phone Number'}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
              style={{ fontSize: '16px' }}
              required
            />
          </div>
        </motion.div>

        <motion.label variants={listItem} className="flex items-center gap-3 cursor-pointer p-2 -m-2">
          <input
            type="checkbox"
            checked={isVOPMember}
            onChange={(e) => setIsVOPMember(e.target.checked)}
            className="w-5 h-5 text-[#478c0b] rounded focus:ring-[#478c0b]"
          />
          <span className="font-medium text-sm md:text-base">
            {language === 'he' ? 'אני חבר/ת קהילת כפר השלום' : 'I am a Village of Peace community member'}
          </span>
        </motion.label>
      </motion.div>
    );
  }

  function DeliveryStep() {
    return (
      <motion.div
        className="space-y-6"
        variants={listContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h2
          variants={listItem}
          className="text-xl md:text-2xl font-bold flex items-center gap-3"
          style={{ color: '#3a3a1d' }}
        >
          <MapPin className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
          {language === 'he' ? 'כתובת למשלוח' : 'Shipping Address'}
        </motion.h2>

        {/* Saved Addresses for Members */}
        {isVOPMember && savedAddresses.length > 0 && (
          <motion.div variants={listItem} className="space-y-3">
            <p className="font-semibold text-sm md:text-base">
              {language === 'he' ? 'כתובות שמורות' : 'Saved Addresses'}
            </p>
            {savedAddresses.map(addr => (
              <motion.div
                key={addr.id}
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                className="border-2 rounded-lg p-3 md:p-4 cursor-pointer hover:border-[#478c0b] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-[#478c0b] text-sm md:text-base">{addr.type}</span>
                    <p className="text-xs md:text-sm mt-1">{addr.address}</p>
                    <p className="text-xs md:text-sm text-gray-600">{addr.phone}</p>
                  </div>
                  <input type="radio" name="savedAddress" className="mt-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div variants={listItem} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2 text-sm md:text-base">
              {language === 'he' ? 'כתובת רחוב' : 'Street Address'}
            </label>
            <input
              type="text"
              name="street-address"
              autoComplete="street-address"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
              style={{ fontSize: '16px' }}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-sm md:text-base">
                {language === 'he' ? 'עיר' : 'City'}
              </label>
              <input
                type="text"
                name="address-level2"
                autoComplete="address-level2"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
                style={{ fontSize: '16px' }}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm md:text-base">
                {language === 'he' ? 'מיקוד' : 'Postal Code'}
              </label>
              <input
                type="text"
                name="postal-code"
                autoComplete="postal-code"
                inputMode="numeric"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
                style={{ fontSize: '16px' }}
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={listItem} className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-3" style={{ color: '#3a3a1d' }}>
            <Truck className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
            {language === 'he' ? 'אפשרויות משלוח' : 'Delivery Options'}
          </h3>

          <div className="space-y-3 delivery-options">
            {deliveryOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleInputChange('deliveryMethod', option.id);
                  handleInputChange('deliveryPrice', option.price);
                }}
                className={`border-2 rounded-lg p-3 md:p-4 cursor-pointer transition-all delivery-option touchable ${
                  formData.deliveryMethod === option.id
                    ? 'border-[#478c0b] bg-[#cfe7c1]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm md:text-base">{option.name}</p>
                    <p className="text-xs md:text-sm text-gray-600">{option.time}</p>
                  </div>
                  <motion.p
                    className="font-bold text-[#478c0b] text-sm md:text-base"
                    animate={formData.deliveryMethod === option.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {option.price === 0 ? (language === 'he' ? 'חינם' : 'Free') : convertPrice(option.price)}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  function PaymentStep() {
    // Map payment method icons to Lucide components
    const getPaymentIcon = (iconKey: string) => {
      switch (iconKey) {
        case 'fa-coins': return <Coins className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />;
        case 'fa-qrcode': return <QrCode className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />;
        case 'fa-credit-card': return <CreditCard className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />;
        case 'fa-university': return <Building className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />;
        default: return <CreditCard className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />;
      }
    };

    return (
      <motion.div
        className="space-y-6"
        variants={listContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h2
          variants={listItem}
          className="text-xl md:text-2xl font-bold flex items-center gap-3"
          style={{ color: '#3a3a1d' }}
        >
          <CreditCard className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
          {language === 'he' ? 'אמצעי תשלום' : 'Payment Method'}
        </motion.h2>

        <motion.div variants={listItem} className="space-y-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInputChange('paymentMethod', method.id)}
              className={`border-2 rounded-lg p-3 md:p-4 cursor-pointer transition-all payment-method touchable ${
                formData.paymentMethod === method.id
                  ? 'border-[#478c0b] bg-[#cfe7c1]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <motion.div
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#478c0b] text-white rounded-lg flex items-center justify-center payment-method-icon"
                  animate={formData.paymentMethod === method.id ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {getPaymentIcon(method.icon)}
                </motion.div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{method.name}</p>
                  <p className="text-xs md:text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Details Based on Method */}
        <AnimatePresence mode="wait">
          {formData.paymentMethod === 'braysheet' && (
            <motion.div
              key="braysheet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-4 md:p-6 rounded-lg mt-6 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Coins className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5]" />
                </motion.div>
                <div>
                  <h4 className="text-lg md:text-xl font-bold">
                    {language === 'he' ? 'תשלום בטוקן Braysheet' : 'Braysheet Token Payment'}
                  </h4>
                  <p className="text-xs md:text-sm opacity-90">
                    {language === 'he' ? 'מטבע דיגיטלי קהילתי' : 'Community Digital Currency'}
                  </p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 mb-4">
                <p className="font-semibold mb-2 text-sm md:text-base">
                  {language === 'he' ? 'שער המרה' : 'Token Exchange Rate'}
                </p>
                <p className="text-xl md:text-2xl font-bold">1 BRY = {convertPrice(10)}</p>
                <p className="text-xs md:text-sm mt-2">
                  {language === 'he' ? 'סה"כ:' : 'Total:'} {(calculateTotals().total / 10).toFixed(2)} BRY {language === 'he' ? 'טוקנים' : 'tokens'}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-2 text-sm md:text-base">
                    {language === 'he' ? 'כתובת ארנק' : 'Wallet Address'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'he' ? 'הזן את כתובת הארנק שלך' : 'Enter your Braysheet wallet address'}
                    className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => completeOrder()}
                  className="w-full py-3 bg-white text-[#478c0b] rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base cursor-pointer"
                >
                  {language === 'he' ? 'שלם עם טוקנים' : 'Pay with Braysheet Tokens'}
                </motion.button>
              </div>
              <p className="text-xs mt-3 opacity-75">
                {language === 'he' ? '* טוקנים תומכים ביוזמות קהילת כפר השלום' : '* Braysheet tokens support Village of Peace community initiatives'}
              </p>
            </motion.div>
          )}

          {formData.paymentMethod === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QRCodePayment
                amount={calculateTotals().total}
                currency={formData.currency}
                onComplete={() => completeOrder()}
              />
            </motion.div>
          )}

          {formData.paymentMethod === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mt-6"
            >
              <div>
                <label className="block font-semibold mb-2 text-sm md:text-base">
                  {language === 'he' ? 'מספר כרטיס' : 'Card Number'}
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-sm md:text-base">
                    {language === 'he' ? 'תוקף' : 'Expiry Date'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-sm md:text-base">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b] text-base transition-all duration-200"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {formData.paymentMethod === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 p-4 md:p-6 rounded-lg mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 stroke-[1.5] text-blue-600" />
                <p className="font-semibold text-sm md:text-base">
                  {language === 'he' ? 'פרטי העברה בנקאית' : 'Bank Transfer Details'}
                </p>
              </div>
              <div className="space-y-2 text-xs md:text-sm">
                <p><strong>{language === 'he' ? 'בנק:' : 'Bank:'}</strong> Bank Hapoalim</p>
                <p><strong>{language === 'he' ? 'חשבון:' : 'Account:'}</strong> 12-345-678901</p>
                <p><strong>{language === 'he' ? 'אסמכתא:' : 'Reference:'}</strong> KFAR-{Date.now()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  function ConfirmationStep() {
    return (
      <motion.div
        className="text-center confirmation-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] text-white p-6 md:p-8 rounded-2xl mb-6 md:mb-8 confirmation-header"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-4"
          >
            <CheckCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto stroke-[1.5]" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 confirmation-title">
            {language === 'he' ? 'ההזמנה אושרה!' : 'Order Confirmed!'}
          </h2>
          <p className="text-lg md:text-xl mb-4 confirmation-order-number">
            {language === 'he' ? 'הזמנה' : 'Order'} #{orderNumber}
          </p>
          <p className="text-base md:text-lg">
            {language === 'he' ? 'תודה שתמכת בעסקים של כפר השלום!' : 'Thank you for supporting Village of Peace businesses!'}
          </p>
          <p className="mt-2 text-sm md:text-base">Yah Khai! HalleluYah!</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-4 md:p-6 text-left max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-base md:text-lg mb-4">
            {language === 'he' ? 'מה הלאה?' : "What's Next?"}
          </h3>
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] text-[#25D366]" />
              <span className="text-sm md:text-base">
                {language === 'he'
                  ? `החשבונית תישלח ל-${formData.phone} בווטסאפ`
                  : `Invoice will be sent to ${formData.phone} via WhatsApp`}
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Package className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] text-[#478c0b]" />
              <span className="text-sm md:text-base">
                {language === 'he' ? 'הספקים יכינו את המוצרים שלך' : 'Vendors will prepare your items'}
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Truck className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] text-[#478c0b]" />
              <span className="text-sm md:text-base">
                {language === 'he' ? 'עקוב אחר המשלוח שלך בחשבונך' : 'Track your delivery in your account'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Invoice Download Section */}
        <motion.div
          className="bg-white rounded-lg p-4 md:p-6 mt-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-base md:text-lg mb-4 text-center flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
            {language === 'he' ? 'חשבונית וקבלה' : 'Invoice & Receipt'}
          </h3>

          {isGeneratingInvoice ? (
            <div className="text-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-8 h-8 stroke-[1.5] text-[#478c0b] mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-gray-600">
                {language === 'he' ? 'מייצר את החשבונית...' : 'Generating your invoice...'}
              </p>
            </div>
          ) : invoiceData ? (
            <div className="space-y-4">
              {/* QR Code for Payment */}
              <div className="flex justify-center">
                {invoiceData.qrCode && (
                  <img
                    src={invoiceData.qrCode}
                    alt="Payment QR Code"
                    className="w-32 h-32"
                  />
                )}
              </div>

              <p className="text-center text-sm text-gray-600">
                {language === 'he' ? 'חשבונית' : 'Invoice'} #{invoiceData.invoiceNumber}
              </p>

              {/* Download Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadInvoice}
                className="w-full py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a7009] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[1.5]" />
                {language === 'he' ? 'הורד חשבונית PDF' : 'Download Invoice PDF'}
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                {language === 'he'
                  ? 'החשבונית כוללת קוד QR למעקב תשלום'
                  : 'Your invoice includes a QR code for easy payment tracking'}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                {language === 'he' ? 'החשבונית תהיה זמינה בקרוב' : 'Invoice will be available shortly'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Order QR Code */}
        <motion.div
          className="bg-white rounded-lg p-4 md:p-6 mt-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-center">
            {language === 'he' ? 'QR למעקב הזמנה' : 'Order Tracking QR'}
          </h3>
          <div className="flex justify-center">
            <SmartQRCompactFixed
              type="order"
              data={{
                id: orderNumber,
                status: 'confirmed',
                total: calculateTotals().total,
                currency: formData.currency,
                customer: {
                  name: `${formData.firstName} ${formData.lastName}`,
                  email: formData.email,
                  phone: formData.phone
                },
                items: items.length,
                timestamp: Date.now()
              }}
              size={isMobile ? 160 : 200}
              hideActions={false}
            />
          </div>
          <p className="text-center text-xs md:text-sm text-gray-600 mt-4">
            {language === 'he' ? 'שמור את קוד ה-QR למעקב ההזמנה' : 'Save this QR code to track your order'}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-4 mt-6 md:mt-8 action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Generate simple invoice text for copy/paste
              const totals = calculateTotals();
              const itemsList = items.map(item =>
                `• ${item.quantity}x ${item.name} - ₪${(item.price * item.quantity).toFixed(2)}`
              ).join('\n');

              const invoiceText = `KFAR MARKETPLACE - ORDER INVOICE
==============================
Order #: ${orderNumber}
Date: ${new Date().toLocaleDateString('he-IL')}
Customer: ${formData.firstName} ${formData.lastName}
Phone: ${formData.phone}

ITEMS:
${itemsList}

Subtotal: ₪${totals.subtotal.toFixed(2)}
Delivery: ₪${totals.shipping.toFixed(2)}
Tax: ₪${totals.tax.toFixed(2)}
TOTAL: ₪${totals.total.toFixed(2)}

PAYMENT: ${formData.paymentMethod === 'braysheet' ? 'Braysheet Tokens' :
           formData.paymentMethod === 'bank' ? 'Bank Transfer' :
           formData.paymentMethod === 'card' ? 'Credit Card' : 'QR Code'}

DELIVERY: ${formData.deliveryMethod === 'pickup' ? 'Pickup at Village of Peace' :
            formData.deliveryMethod === 'local' ? 'Local Delivery (1-2 days)' :
            'Standard Shipping (3-5 days)'}

Thank you for your order!
Contact: 052-KFAR-MKT`;

              // Copy to clipboard
              navigator.clipboard.writeText(invoiceText).then(() => {
                alert(language === 'he'
                  ? 'החשבונית הועתקה! תוכל להדביק אותה בווטסאפ או בכל אפליקציה.'
                  : 'Invoice copied to clipboard! You can now paste it in WhatsApp or any messaging app.');
              }).catch(() => {
                prompt('Copy this invoice:', invoiceText);
              });
            }}
            className="px-6 py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors text-sm md:text-base touchable flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-5 h-5 stroke-[1.5]" />
            {language === 'he' ? 'העתק טקסט חשבונית' : 'Copy Invoice Text'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 border-2 border-[#478c0b] text-[#478c0b] rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base touchable cursor-pointer"
          >
            {language === 'he' ? 'המשך לקנות' : 'Continue Shopping'}
          </motion.button>
        </motion.div>
        <motion.div
          className="mt-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Generate invoice text
              const totals = calculateTotals();
              const itemsList = items.map(item =>
                `${item.quantity}x ${item.name}`
              ).join(', ');

              const simpleText = `Order #${orderNumber} confirmed! Items: ${itemsList}. Total: ₪${totals.total.toFixed(2)}. Pickup at Village of Peace.`;

              // Open WhatsApp Web with pre-filled text (user needs to select recipient)
              const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(simpleText)}`;
              window.open(whatsappWebUrl, '_blank');
            }}
            className="w-full px-6 py-3 bg-[#25D366] text-white rounded-lg font-semibold hover:bg-[#20BD5A] transition-colors text-sm md:text-base touchable flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 stroke-[1.5]" />
            {language === 'he' ? 'שתף הזמנה בווטסאפ' : 'Share Order via WhatsApp'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/customer/orders')}
            className="w-full px-6 py-3 bg-[#f6af0d] text-white rounded-lg font-semibold hover:bg-[#e5a00c] transition-colors text-sm md:text-base touchable cursor-pointer"
          >
            {language === 'he' ? 'עקוב אחר ההזמנה' : 'Track Order'}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const completeOrder = async () => {
    // Validate stock availability
    const stockValidation = validateStock();
    if (!stockValidation.valid) {
      setStockError({ show: true, message: stockValidation.message });
      // Auto-hide after 5 seconds
      setTimeout(() => setStockError({ show: false, message: '' }), 5000);
      return;
    }
    
    // Generate order number first
    const newOrderNumber = `KFAR-${Date.now()}`;
    setOrderNumber(newOrderNumber);
    
    // Prepare order data
    const orderData = {
      orderId: newOrderNumber,
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.streetAddress
      },
      items: items.map(item => ({
        ...item,
        vendorId: item.vendorId || 'unknown',
        vendorName: item.vendorName || 'KFAR Marketplace'
      })),
      deliveryMethod: formData.deliveryMethod,
      deliveryFee: formData.deliveryPrice,
      paymentMethod: formData.paymentMethod,
      notes: '',
      currency: formData.currency,
      subtotal: calculateTotals().subtotal,
      vat: calculateTotals().vat,
      total: calculateTotals().total,
      createdAt: new Date().toISOString()
    };
    
    // Save order to database and get real order ID
    let realOrderId = null;
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Order saved:', result.orderId);
        realOrderId = result.orderId;
      } else {
        console.error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      // Continue anyway - don't block checkout
    }
    
    // Generate invoice in background with real order ID
    generateInvoice(orderData, realOrderId);
    
    // Use setTimeout to prevent flashing by allowing state to settle
    setTimeout(() => {
      setCurrentStep(4);
      // Clear cart after a slight delay to prevent flickering
      setTimeout(() => {
        clearCart();
      }, 100);
    }, 50);
  };
  
  const generateInvoice = async (orderData: any, realOrderId?: string) => {
    setIsGeneratingInvoice(true);
    try {
      // Get vendor info for the invoice
      const vendorName = orderData.items[0]?.vendorName || 'KFAR Marketplace';
      const vendorId = orderData.items[0]?.vendorId || 'kfar-marketplace';
      
      // Calculate totals for invoice
      const totals = calculateTotals();
      
      // Group items by vendor for POS-style invoice
      const itemsByVendor = {};
      orderData.items.forEach(item => {
        const vendor = item.vendorName || vendorName;
        if (!itemsByVendor[vendor]) {
          itemsByVendor[vendor] = [];
        }
        itemsByVendor[vendor].push(item);
      });
      
      const invoicePayload = {
        ...orderData,
        vendorName,
        vendorId,
        itemsByVendor,
        subtotal: totals.subtotal,
        vat: totals.tax,
        deliveryFee: totals.shipping,
        total: totals.total,
        language: localStorage.getItem('kfar-language') || 'en'
      };
      
      // Use the new html2pdf solution
      const response = await fetch('/api/invoice/generate-html2pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoiceData(result.invoice);
        
        // Save invoice to Supabase for future reference
        try {
          const saveResponse = await fetch('/api/invoices/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoice: result.invoice,
              orderId: realOrderId // Use the real database order ID
            })
          });
          
          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Invoice saved to database:', saveResult);
          } else {
            const saveError = await saveResponse.json();
            console.error('❌ Failed to save invoice to database:', saveError);
          }
        } catch (saveError) {
          console.error('❌ Error saving invoice:', saveError);
          // Don't block the user experience if saving fails
        }
        
        console.log('✅ Invoice generated:', result.invoice.invoiceNumber);
      } else {
        console.error('❌ Failed to generate invoice');
      }
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };
  
  const downloadInvoice = () => {
    if (!invoiceData) return;
    
    // Open invoice in new tab for download
    const invoiceUrl = `/invoice/view/${invoiceData.invoiceNumber}`;
    window.open(invoiceUrl, '_blank');
  };
  
  const validateStock = () => {
    // In a real application, this would check against a database
    // For now, we'll simulate stock validation
    for (const item of items) {
      if (item.maxQuantity && item.quantity > item.maxQuantity) {
        return {
          valid: false,
          message: `${item.name} only has ${item.maxQuantity} units available. Please adjust your quantity.`
        };
      }
      // Simulate random stock issues for testing (uncomment to test)
      // if (Math.random() < 0.1) {
      //   return {
      //     valid: false,
      //     message: `${item.name} is currently out of stock. Please remove it from your cart.`
      //   };
      // }
    }
    return { valid: true, message: '' };
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    } else if (currentStep === 3) {
      completeOrder();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const totals = calculateTotals();

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef] py-4 md:py-8 checkout-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 checkout-container">
          {/* Stock Error Alert */}
          <AnimatePresence>
            {stockError.show && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto mb-4 md:mb-6"
              >
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 md:p-4 flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] text-red-500" />
                  </motion.div>
                  <p className="text-red-700 font-medium text-sm md:text-base flex-1">{stockError.message}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setStockError({ show: false, message: '' })}
                    className="ml-auto text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Progress Indicator - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto mb-6 md:mb-8"
          >
            <div className="flex items-center justify-center overflow-x-auto scrollbar-hide md:overflow-visible progress-indicator">
              <div className="flex items-center px-4 md:px-0">
                {steps.map((step, index) => {
                  const StepIcon = step.id === 1 ? User : step.id === 2 ? Truck : step.id === 3 ? CreditCard : CheckCircle;
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center progress-step">
                        <motion.div
                          initial={false}
                          animate={
                            currentStep > step.id
                              ? { scale: [1, 1.2, 1], backgroundColor: '#478c0b' }
                              : currentStep === step.id
                              ? { scale: 1, backgroundColor: '#478c0b', boxShadow: '0 0 0 4px rgba(71, 140, 11, 0.2)' }
                              : { scale: 1, backgroundColor: '#e5e7eb' }
                          }
                          transition={{ duration: 0.3 }}
                          className={`w-10 h-10 md:w-14 md:h-14 min-w-[40px] min-h-[40px] md:min-w-[56px] md:min-h-[56px] rounded-full flex items-center justify-center progress-step-icon ${
                            currentStep >= step.id ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {currentStep > step.id ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <StepIcon className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <span className={`mt-1 md:mt-2 text-[10px] md:text-sm font-medium whitespace-nowrap progress-step-title ${
                          currentStep >= step.id ? 'text-[#478c0b]' : 'text-gray-500'
                        }`}>
                          {language === 'he'
                            ? (step.id === 1 ? 'פרטים' : step.id === 2 ? 'משלוח' : step.id === 3 ? 'תשלום' : 'אישור')
                            : step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: currentStep > step.id ? 1 : 0.3 }}
                          transition={{ duration: 0.3 }}
                          className={`w-6 md:w-16 h-0.5 mx-1 md:mx-2 progress-connector origin-left ${
                            currentStep > step.id ? 'bg-[#478c0b]' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Mobile Order Summary Toggle - Only on mobile and not on confirmation */}
          {isMobile && currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 order-summary-mobile"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="w-full bg-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between order-summary-toggle cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
                  <span className="font-semibold">
                    {language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#c23c09]">{convertPrice(totals.total)}</span>
                  <motion.div
                    animate={{ rotate: showOrderSummary ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 stroke-[1.5] text-gray-500" />
                  </motion.div>
                </div>
              </motion.button>
              
              {/* Mobile Order Summary Dropdown */}
              <AnimatePresence>
                {showOrderSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg shadow-lg p-4 mt-2 overflow-hidden"
                >
                  {/* Currency Selector */}
                  <div className="flex gap-2 mb-4 justify-center currency-selector">
                    {Object.keys(currencySymbols).map(currency => (
                      <button
                        key={currency}
                        onClick={() => handleInputChange('currency', currency)}
                        className={`px-3 py-1 rounded font-medium transition-all text-sm currency-button ${
                          formData.currency === currency
                            ? 'bg-[#478c0b] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {currencySymbols[currency]}
                      </button>
                    ))}
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => {
                      // Fix People Store images
                      let itemImage = item.image;
                      if (item.vendorId === 'people-store' && !item.image.startsWith('/images/')) {
                        // If it's a People Store item with a broken image path, use a fallback
                        itemImage = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                      }
                      
                      return (
                        <div key={item.id} className="flex items-center gap-3 order-item">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden order-item-image">
                            <Image
                              src={itemImage}
                              alt={item.name || "Product image"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Fallback image on error
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 order-item-details">
                            <p className="font-medium text-xs line-clamp-1 order-item-name">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.vendorName}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantity} × {convertPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 border-t pt-3 text-sm">
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</span>
                      <span>{convertPrice(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'משלוח' : 'Shipping'}</span>
                      <span>{convertPrice(totals.shipping)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{language === 'he' ? 'הנחת קהילה (10%)' : 'Community Discount (10%)'}</span>
                        <span>-{convertPrice(totals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'מע"מ' : 'Tax'}</span>
                      <span>{convertPrice(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                      <span style={{ color: '#c23c09' }}>{convertPrice(totals.total)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 transition-all duration-300 checkout-card">
                <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                  {steps[currentStep - 1].component}
                </div>

                {/* Smart Suggestions - show on info and delivery steps */}
                {currentStep <= 2 && items.length > 0 && (
                  <SmartSuggestions
                    cartItems={items.map(item => ({
                      id: item.id,
                      name: item.name,
                      vendorId: item.vendorId,
                      category: undefined,
                    }))}
                  />
                )}

                {/* Navigation */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-6 md:mt-8 checkout-navigation">
                    {currentStep > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02, x: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={prevStep}
                        className="px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base touchable flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[1.5]" />
                        {language === 'he' ? 'הקודם' : 'Previous'}
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={nextStep}
                      className="px-4 md:px-6 py-2 md:py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors ml-auto text-sm md:text-base touchable flex items-center gap-2 cursor-pointer"
                    >
                      {currentStep === 3
                        ? (language === 'he' ? 'השלם הזמנה' : 'Complete Order')
                        : (language === 'he' ? 'המשך' : 'Continue')}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 stroke-[1.5]" />
                      </motion.div>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar - Desktop Only */}
            {!isMobile && currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-1 order-1 lg:order-2"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                    <ShoppingCart className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
                    {language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}
                  </h3>

                  {/* Currency Selector */}
                  <div className="flex gap-2 mb-6">
                    {(Object.keys(currencySymbols) as Array<keyof typeof currencySymbols>).map(currency => (
                      <motion.button
                        key={currency}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleInputChange('currency', currency)}
                        className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                          formData.currency === currency
                            ? 'bg-[#478c0b] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {currencySymbols[currency]}
                      </motion.button>
                    ))}
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      // Fix People Store images
                      let itemImage = item.image;
                      if (item.vendorId === 'people-store' && !item.image.startsWith('/images/')) {
                        // If it's a People Store item with a broken image path, use a fallback
                        itemImage = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                      }
                      
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={itemImage}
                              alt={item.name || "Product image"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Fallback image on error
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.vendorName}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantity} × {convertPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'סכום ביניים' : 'Subtotal'}</span>
                      <span>{convertPrice(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'משלוח' : 'Shipping'}</span>
                      <span>{convertPrice(totals.shipping)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{language === 'he' ? 'הנחת קהילה (10%)' : 'Community Discount (10%)'}</span>
                        <span>-{convertPrice(totals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{language === 'he' ? 'מע"מ' : 'Tax'}</span>
                      <span>{convertPrice(totals.tax)}</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between font-bold text-lg pt-2 border-t"
                    >
                      <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                      <motion.span
                        key={totals.total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        style={{ color: '#c23c09' }}
                      >
                        {convertPrice(totals.total)}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      {language === 'he' ? 'תשלום מאובטח' : 'Secure Payment'}
                    </p>
                    <div className="flex justify-center gap-4">
                      <motion.div whileHover={{ scale: 1.1, y: -2 }} transition={{ duration: 0.2 }}>
                        <CreditCard className="w-7 h-7 stroke-[1.5] text-blue-600" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, y: -2 }} transition={{ duration: 0.2 }}>
                        <Shield className="w-7 h-7 stroke-[1.5] text-green-600" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, y: -2 }} transition={{ duration: 0.2 }}>
                        <QrCode className="w-7 h-7 stroke-[1.5] text-purple-600" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, y: -2 }} transition={{ duration: 0.2 }}>
                        <Coins className="w-7 h-7 stroke-[1.5] text-[#f6af0d]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}