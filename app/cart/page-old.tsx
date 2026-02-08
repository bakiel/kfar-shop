'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const deliveryFee = getCartTotal() >= 50 ? 0 : 5;
  const total = getCartTotal() + deliveryFee;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-4xl text-gray-400"></i>
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              style={{ backgroundColor: '#478c0b' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendorName]) {
      acc[item.vendorName] = [];
    }
    acc[item.vendorName].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#3a3a1d' }}>
          Shopping Cart ({items.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByVendor).map(([vendorName, vendorItems]) => (
              <div key={vendorName} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Vendor Header */}
                <div className="px-6 py-4 border-b" style={{ backgroundColor: '#fef9ef' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-leaf-green rounded-full flex items-center justify-center">
                      <i className="fas fa-store text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#3a3a1d' }}>
                        {vendorName}
                      </h3>
                      <p className="text-sm text-gray-600">Ships from Dimona</p>
                    </div>
                  </div>
                </div>

                {/* Vendor Items */}
                <div className="p-6 space-y-4">
                  {vendorItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name || "Image"}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">Unit price: ₪{item.price.toFixed(2)}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <i className="fas fa-minus text-xs"></i>
                              </button>
                              <span className="px-4 py-1 text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <i className="fas fa-plus text-xs"></i>
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: '#478c0b' }}>
                              ₪{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Order Summary
              </h3>

              {/* Currency Selector */}
              <div className="flex gap-2 mb-4">
                <button className="px-3 py-1 rounded-md text-sm font-medium text-white" style={{ backgroundColor: '#478c0b' }}>
                  ₪ ILS
                </button>
                <button className="px-3 py-1 rounded-md text-sm font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  $ USD
                </button>
                <button className="px-3 py-1 rounded-md text-sm font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  € EUR
                </button>
              </div>

              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-medium">₪{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₪${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="text-xs text-gray-500">
                    Add ₪{(50 - getCartTotal()).toFixed(2)} for free delivery
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-lg font-bold" style={{ color: '#3a3a1d' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  ₪{total.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-3 rounded-xl text-white font-semibold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ backgroundColor: '#c23c09' }}
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-start gap-2 text-sm">
                  <i className="fas fa-shield-alt text-green-600 mt-0.5"></i>
                  <div>
                    <div className="font-medium text-green-800">Secure Checkout</div>
                    <div className="text-green-700 text-xs">Your information is safe and encrypted</div>
                  </div>
                </div>
              </div>

              {/* Accepted Payment Methods */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">Accepted payment methods</p>
                <div className="flex gap-2">
                  <div className="bg-gray-100 rounded px-2 py-1">
                    <i className="fab fa-cc-visa text-xl text-gray-600"></i>
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1">
                    <i className="fab fa-cc-mastercard text-xl text-gray-600"></i>
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1">
                    <i className="fab fa-cc-paypal text-xl text-gray-600"></i>
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1">
                    <i className="fab fa-apple-pay text-xl text-gray-600"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}