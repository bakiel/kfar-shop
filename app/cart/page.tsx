'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import FloatingCartPopup from '@/components/cart/FloatingCartPopup';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';

interface VendorGroup {
  vendor: string;
  vendorLogo: string;
  items: any[];
  subtotal: number;
  estimatedDelivery?: string;
}

export default function EnhancedCartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');

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
        <div className="min-h-screen bg-[#fef9ef] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-6"></i>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Discover amazing products from Village of Peace vendors
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <i className="fas fa-store mr-2"></i>
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h1>
            
            {/* Currency Selector */}
            <div className="flex gap-2">
              {Object.keys(currencySymbols).map(currency => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCurrency === currency
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedCurrency === currency ? { backgroundColor: '#478c0b' } : {}}
                >
                  {currencySymbols[currency as keyof typeof currencySymbols]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {vendorGroups.map((group, index) => (
                <div
                  key={index}
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
                          <p className="text-sm opacity-90">
                            <i className="fas fa-truck mr-1"></i>
                            Est. delivery: {group.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">Subtotal</p>
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
                        itemImage = '/images/vendors/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
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
                                target.src = '/images/vendors/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                              }}
                            />
                          </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Unit price: {convertPrice(item.price)}
                            {item.bulkPricing && item.bulkPricing.length > 0 && (() => {
                              const applicableBulk = item.bulkPricing
                                .filter((bulk: any) => item.quantity >= bulk.quantity)
                                .sort((a: any, b: any) => b.quantity - a.quantity)[0];
                              
                              if (applicableBulk) {
                                const savings = (item.price - applicableBulk.price) * item.quantity;
                                return (
                                  <>
                                    <span className="line-through ml-2">{convertPrice(item.price)}</span>
                                    <span className="text-green-600 font-semibold ml-2">
                                      {convertPrice(applicableBulk.price)} (Save {convertPrice(savings)})
                                    </span>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                              >
                                <i className="fas fa-minus text-sm"></i>
                              </button>
                              <span className="px-4 py-1 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                              >
                                <i className="fas fa-plus text-sm"></i>
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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
                    <div className="px-6 pb-4">
                      <div className="bg-[#fef9ef] rounded-lg p-3">
                        <p className="text-sm mb-2">
                          Add {convertPrice(150 - group.subtotal)} more for free shipping!
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              backgroundColor: '#478c0b',
                              width: `${(group.subtotal / 150) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Order Summary
                </h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-[#478c0b]"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#f6af0d' }}
                    >
                      Apply
                    </button>
                  </div>
                  
                  {appliedCoupons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {appliedCoupons.map(coupon => (
                        <div key={coupon} className="flex items-center justify-between text-sm">
                          <span className="text-green-600">
                            <i className="fas fa-check-circle mr-1"></i>
                            {coupon} applied
                          </span>
                          <button
                            onClick={() => setAppliedCoupons(appliedCoupons.filter(c => c !== coupon))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Details */}
                <div className="space-y-3 pb-6 border-b">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{convertPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{convertPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (17%)</span>
                    <span>{convertPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg py-6">
                  <span>Total</span>
                  <span style={{ color: '#c23c09' }}>{convertPrice(total)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <i className="fas fa-lock mr-2"></i>
                  Proceed to Secure Checkout
                </Link>

                {/* QR Code for Quick Cart Save */}
                <div className="mt-6">
                  <h3 className="text-base font-bold mb-3 text-center" style={{ color: '#3a3a1d' }}>
                    Save Cart for Later
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
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-gray-600 mb-3">Secure Payment Options</p>
                  <div className="flex justify-center gap-3">
                    <i className="fab fa-cc-visa text-2xl text-blue-600"></i>
                    <i className="fab fa-cc-mastercard text-2xl text-red-500"></i>
                    <i className="fas fa-shield-alt text-2xl text-green-600"></i>
                    <i className="fas fa-qrcode text-2xl text-purple-600"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    SSL Secured • 100% Safe Checkout
                  </p>
                </div>

                {/* Community Message */}
                <div className="mt-6 p-4 bg-gradient-to-r from-[#478c0b] to-[#f6af0d] rounded-lg text-white text-center">
                  <i className="fas fa-heart text-xl mb-2"></i>
                  <p className="text-sm font-medium">Supporting Village of Peace</p>
                  <p className="text-xs mt-1">Yah Khai! HalleluYah!</p>
                </div>
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