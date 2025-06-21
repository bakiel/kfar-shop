'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/lib/context/CartContext';
import QRCodePayment from '@/components/checkout/QRCodePayment';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';

interface CheckoutStep {
  id: number;
  title: string;
  icon: string;
  component: JSX.Element;
}

export default function EnhancedCheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const [isVOPMember, setIsVOPMember] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [stockError, setStockError] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
      <div className="space-y-6">
        {/* Guest Checkout Option */}
        {!isGuest && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="mb-2">Already have an account?</p>
            <div className="flex justify-center gap-4">
              <button className="text-[#478c0b] font-semibold underline">
                Sign in here
              </button>
              <span>|</span>
              <button 
                onClick={() => setIsGuest(true)}
                className="text-[#478c0b] font-semibold underline"
              >
                Continue as guest
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#3a3a1d' }}>
          <i className="fas fa-user text-[#478c0b]"></i>
          Contact Information
        </h2>

        {isVOPMember && (
          <div className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] text-white p-4 rounded-lg flex items-center gap-3">
            <i className="fas fa-star text-xl"></i>
            <span className="font-semibold">VOP Community Member - Special Pricing Applied</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
            required
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isVOPMember}
            onChange={(e) => setIsVOPMember(e.target.checked)}
            className="w-5 h-5 text-[#478c0b] rounded focus:ring-[#478c0b]"
          />
          <span className="font-medium">I am a Village of Peace community member</span>
        </label>
      </div>
    );
  }

  function DeliveryStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#3a3a1d' }}>
          <i className="fas fa-map-marker-alt text-[#478c0b]"></i>
          Shipping Address
        </h2>

        {/* Saved Addresses for Members */}
        {isVOPMember && savedAddresses.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">Saved Addresses</p>
            {savedAddresses.map(addr => (
              <div
                key={addr.id}
                className="border-2 rounded-lg p-4 cursor-pointer hover:border-[#478c0b] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-[#478c0b]">{addr.type}</span>
                    <p className="text-sm mt-1">{addr.address}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                  </div>
                  <input type="radio" name="savedAddress" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Street Address</label>
            <input
              type="text"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: '#3a3a1d' }}>
            <i className="fas fa-truck text-[#478c0b]"></i>
            Delivery Options
          </h3>

          {deliveryOptions.map(option => (
            <div
              key={option.id}
              onClick={() => {
                handleInputChange('deliveryMethod', option.id);
                handleInputChange('deliveryPrice', option.price);
              }}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                formData.deliveryMethod === option.id
                  ? 'border-[#478c0b] bg-[#cfe7c1]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{option.name}</p>
                  <p className="text-sm text-gray-600">{option.time}</p>
                </div>
                <p className="font-bold text-[#478c0b]">
                  {option.price === 0 ? 'Free' : convertPrice(option.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function PaymentStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#3a3a1d' }}>
          <i className="fas fa-credit-card text-[#478c0b]"></i>
          Payment Method
        </h2>

        <div className="space-y-3">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              onClick={() => handleInputChange('paymentMethod', method.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                formData.paymentMethod === method.id
                  ? 'border-[#478c0b] bg-[#cfe7c1]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#478c0b] text-white rounded-lg flex items-center justify-center">
                  <i className={`fas ${method.icon} text-xl`}></i>
                </div>
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Details Based on Method */}
        {formData.paymentMethod === 'braysheet' && (
          <div className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-6 rounded-lg mt-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <i className="fas fa-coins text-3xl"></i>
              <div>
                <h4 className="text-xl font-bold">Braysheet Token Payment</h4>
                <p className="text-sm opacity-90">Community Digital Currency</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">Token Exchange Rate</p>
              <p className="text-2xl font-bold">1 BRY = {convertPrice(10)}</p>
              <p className="text-sm mt-2">Total: {(calculateTotals().total / 10).toFixed(2)} BRY tokens</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-2">Wallet Address</label>
                <input
                  type="text"
                  placeholder="Enter your Braysheet wallet address"
                  className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button 
                onClick={() => completeOrder()}
                className="w-full py-3 bg-white text-[#478c0b] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Pay with Braysheet Tokens
              </button>
            </div>
            <p className="text-xs mt-3 opacity-75">
              * Braysheet tokens support Village of Peace community initiatives
            </p>
          </div>
        )}

        {formData.paymentMethod === 'qr' && (
          <QRCodePayment
            amount={calculateTotals().total}
            currency={formData.currency}
            onComplete={() => completeOrder()}
          />
        )}

        {formData.paymentMethod === 'card' && (
          <div className="space-y-4 mt-6">
            <div>
              <label className="block font-semibold mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
                />
              </div>
            </div>
          </div>
        )}

        {formData.paymentMethod === 'bank' && (
          <div className="bg-blue-50 p-6 rounded-lg mt-6">
            <p className="font-semibold mb-3">Bank Transfer Details</p>
            <div className="space-y-2 text-sm">
              <p><strong>Bank:</strong> Bank Hapoalim</p>
              <p><strong>Account:</strong> 12-345-678901</p>
              <p><strong>Reference:</strong> KFAR-{Date.now()}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ConfirmationStep() {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      // Fade in after component mounts to prevent flashing
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className={`text-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] text-white p-8 rounded-2xl mb-8">
          <i className="fas fa-check-circle text-6xl mb-4"></i>
          <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-xl mb-4">Order #{orderNumber}</p>
          <p className="text-lg">Thank you for supporting Village of Peace businesses!</p>
          <p className="mt-2">Yah Khai! HalleluYah!</p>
        </div>

        <div className="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto">
          <h3 className="font-bold text-lg mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <i className="fas fa-envelope text-[#478c0b] text-xl"></i>
              <span>Order confirmation sent to {formData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-box text-[#478c0b] text-xl"></i>
              <span>Vendors will prepare your items</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-truck text-[#478c0b] text-xl"></i>
              <span>Track your delivery in your account</span>
            </div>
          </div>
        </div>

        {/* Order QR Code */}
        <div className="bg-white rounded-lg p-6 mt-6 max-w-md mx-auto">
          <h3 className="font-bold text-lg mb-6 text-center">Order QR Code</h3>
          <div className="flex justify-center">
            <SmartQRCompactFixed
              type="order"
              data={{
                id: orderNumber,
                status: 'confirmed',
                total: calculateTotals().total,
                currency: formData.currency,
                customer: {
                  name: formData.fullName,
                  email: formData.email,
                  phone: formData.phone
                },
                items: items.length,
                timestamp: Date.now()
              }}
              size={200}
              hideActions={false}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Save this QR code to track your order
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 border-2 border-[#478c0b] text-[#478c0b] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/account/orders')}
            className="px-6 py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors"
          >
            Track Order
          </button>
        </div>
      </div>
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
    
    // Use setTimeout to prevent flashing by allowing state to settle
    setTimeout(() => {
      setCurrentStep(4);
      // Clear cart after a slight delay to prevent flickering
      setTimeout(() => {
        clearCart();
      }, 100);
    }, 50);
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
      <div className="min-h-screen bg-[#fef9ef] py-8">
        <div className="container mx-auto px-4">
          {/* Stock Error Alert */}
          {stockError.show && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
                <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
                <p className="text-red-700 font-medium">{stockError.message}</p>
                <button
                  onClick={() => setStockError({ show: false, message: '' })}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Progress Indicator */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.id
                          ? 'bg-[#478c0b] text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <i className={`fas ${step.icon}`}></i>
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-[#478c0b]' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-[#478c0b]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300">
                <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                  {steps[currentStep - 1].component}
                </div>

                {/* Navigation */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                      <button
                        onClick={prevStep}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Previous
                      </button>
                    )}
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors ml-auto"
                    >
                      {currentStep === 3 ? 'Complete Order' : 'Continue'}
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            {currentStep < 4 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                    <i className="fas fa-shopping-cart text-[#478c0b]"></i>
                    Order Summary
                  </h3>

                  {/* Currency Selector */}
                  <div className="flex gap-2 mb-6">
                    {Object.keys(currencySymbols).map(currency => (
                      <button
                        key={currency}
                        onClick={() => handleInputChange('currency', currency)}
                        className={`px-3 py-1 rounded font-medium transition-all ${
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
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      // Fix People Store images
                      let itemImage = item.image;
                      if (item.vendorId === 'people-store' && !item.image.startsWith('/images/')) {
                        // If it's a People Store item with a broken image path, use a fallback
                        itemImage = '/images/vendors/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
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
                                target.src = '/images/vendors/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
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
                      <span>Subtotal</span>
                      <span>{convertPrice(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{convertPrice(totals.shipping)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Community Discount (10%)</span>
                        <span>-{convertPrice(totals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{convertPrice(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span style={{ color: '#c23c09' }}>{convertPrice(totals.total)}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-gray-600 mb-3">Secure Payment</p>
                    <div className="flex justify-center gap-3">
                      <i className="fab fa-cc-visa text-2xl text-blue-600"></i>
                      <i className="fab fa-cc-mastercard text-2xl text-red-500"></i>
                      <i className="fas fa-shield-alt text-2xl text-green-600"></i>
                      <i className="fas fa-qrcode text-2xl text-purple-600"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}