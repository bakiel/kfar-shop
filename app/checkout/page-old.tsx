'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

interface ShippingAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [orderComplete, setOrderComplete] = useState(false);

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendorId]) {
      acc[item.vendorId] = {
        vendorName: item.vendorName,
        items: []
      };
    }
    acc[item.vendorId].items.push(item);
    return acc;
  }, {} as Record<string, { vendorName: string; items: typeof items }>);

  // Mock data
  const savedAddresses: ShippingAddress[] = [
    {
      id: '1',
      name: 'Home',
      street: '123 Kfar Street',
      city: 'Dimona',
      postalCode: '12345',
      phone: '+972 50 123 4567',
      isDefault: true
    },
    {
      id: '2',
      name: 'Work',
      street: '456 Community Center',
      city: 'Dimona',
      postalCode: '12345',
      phone: '+972 50 987 6543'
    }
  ];

  const deliveryOptions: DeliveryOption[] = [
    { id: 'express', name: 'Express Delivery', price: 25, estimatedDays: '1-2 days' },
    { id: 'standard', name: 'Standard Delivery', price: 15, estimatedDays: '3-5 days' },
    { id: 'pickup', name: 'Store Pickup', price: 0, estimatedDays: 'Same day' }
  ];

  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [items, router, orderComplete]);

  const calculateDeliveryFee = () => {
    return Object.values(selectedDeliveryOptions).reduce((total, optionId) => {
      const option = deliveryOptions.find(d => d.id === optionId);
      return total + (option?.price || 0);
    }, 0);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOrder = () => {
    // In a real app, this would submit to an API
    setOrderNumber(`#KF${Date.now()}`);
    setOrderComplete(true);
    setCurrentStep(4);
    clearCart();
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8 px-4">
      <div className="flex items-center">
        {[
          { step: 1, label: 'Cart', icon: 'fa-shopping-cart' },
          { step: 2, label: 'Shipping', icon: 'fa-truck' },
          { step: 3, label: 'Payment', icon: 'fa-credit-card' },
          { step: 4, label: 'Done', icon: 'fa-check-circle' }
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all ${
                  currentStep >= item.step
                    ? 'bg-[#478c0b] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > item.step ? (
                  <i className="fas fa-check text-sm md:text-base"></i>
                ) : (
                  <i className={`fas ${item.icon} text-sm md:text-base`}></i>
                )}
              </div>
              <span className={`mt-1 text-xs md:text-sm ${currentStep >= item.step ? 'text-[#478c0b] font-medium' : 'text-gray-500'} hidden sm:block`}>
                {item.label}
              </span>
            </div>
            {index < 3 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-1 ${
                  currentStep > item.step ? 'bg-[#478c0b]' : 'bg-gray-200'
                } transition-all`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Shipping Information</h2>
      
      {/* Saved Addresses */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Select Delivery Address</h3>
        <div className="space-y-3">
          {savedAddresses.map(address => (
            <label
              key={address.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAddress === address.id
                  ? 'border-[#478c0b] bg-[#cfe7c1] bg-opacity-20'
                  : 'border-gray-200 hover:border-[#478c0b]'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedAddress === address.id}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{address.name}</div>
                  <div className="text-gray-600">{address.street}</div>
                  <div className="text-gray-600">{address.city}, {address.postalCode}</div>
                  <div className="text-gray-600">{address.phone}</div>
                </div>
                {address.isDefault && (
                  <span className="px-2 py-1 text-xs bg-[#f6af0d] text-white rounded">Default</span>
                )}
              </div>
            </label>
          ))}
        </div>
        
        <button className="mt-4 text-[#478c0b] hover:underline">
          <i className="fas fa-plus mr-2"></i>Add New Address
        </button>
      </div>

      {/* Delivery Options by Vendor */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Delivery Options</h3>
        {Object.entries(itemsByVendor).map(([vendorId, vendor]) => (
          <div key={vendorId} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold mb-3">{vendor.vendorName}</h4>
            <div className="space-y-2">
              {deliveryOptions.map(option => (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                    selectedDeliveryOptions[vendorId] === option.id
                      ? 'border-[#478c0b] bg-[#cfe7c1] bg-opacity-20'
                      : 'border-gray-200 hover:border-[#478c0b]'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`delivery-${vendorId}`}
                      value={option.id}
                      checked={selectedDeliveryOptions[vendorId] === option.id}
                      onChange={(e) => setSelectedDeliveryOptions({
                        ...selectedDeliveryOptions,
                        [vendorId]: e.target.value
                      })}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-600">{option.estimatedDays}</div>
                    </div>
                  </div>
                  <span className="font-semibold">₪{option.price}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Link href="/cart" className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50">
          Back to Cart
        </Link>
        <button
          onClick={handleNextStep}
          disabled={!selectedAddress || Object.keys(selectedDeliveryOptions).length !== Object.keys(itemsByVendor).length}
          className="px-6 py-3 bg-[#478c0b] text-white rounded hover:bg-[#3a6d08] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Payment Method</h2>
      
      <div className="space-y-4 mb-8">
        {[
          { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
          { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' },
          { id: 'qr', name: 'QR Code Payment', icon: 'fa-qrcode' }
        ].map(method => (
          <label
            key={method.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              paymentMethod === method.id
                ? 'border-[#478c0b] bg-[#cfe7c1] bg-opacity-20'
                : 'border-gray-200 hover:border-[#478c0b]'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={paymentMethod === method.id}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <i className={`fab ${method.icon} text-xl mr-3`}></i>
            <span className="font-medium">{method.name}</span>
          </label>
        ))}
      </div>

      {paymentMethod === 'card' && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold mb-4">Card Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-3 border border-gray-300 rounded focus:border-[#478c0b] focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="p-3 border border-gray-300 rounded focus:border-[#478c0b] focus:outline-none"
              />
              <input
                type="text"
                placeholder="CVV"
                className="p-3 border border-gray-300 rounded focus:border-[#478c0b] focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full p-3 border border-gray-300 rounded focus:border-[#478c0b] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-[#fef9ef] p-6 rounded-lg mb-8">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₪{getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₪{calculateDeliveryFee().toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span style={{ color: '#c23c09' }}>₪{(getCartTotal() + calculateDeliveryFee()).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevStep}
          className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleCompleteOrder}
          disabled={!paymentMethod}
          className="px-6 py-3 bg-[#478c0b] text-white rounded hover:bg-[#3a6d08] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Complete Order
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-[#478c0b] rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check text-white text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#3a3a1d' }}>Order Confirmed!</h2>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>

      <div className="bg-[#fef9ef] p-6 rounded-lg mb-8">
        <p className="text-lg mb-2">Order Number: <strong>{orderNumber}</strong></p>
        <p className="text-gray-600">A confirmation email has been sent to your email address</p>
      </div>

      <div className="space-y-4">
        <Link
          href="/marketplace"
          className="block w-full max-w-md mx-auto px-6 py-3 bg-[#478c0b] text-white rounded hover:bg-[#3a6d08]"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account/orders"
          className="block w-full max-w-md mx-auto px-6 py-3 border border-[#478c0b] text-[#478c0b] rounded hover:bg-[#cfe7c1] hover:bg-opacity-20"
        >
          View Order Details
        </Link>
      </div>
    </div>
  );

  if (items.length === 0 && !orderComplete) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 2 && renderShippingStep()}
        {currentStep === 3 && renderPaymentStep()}
        {currentStep === 4 && renderConfirmationStep()}
      </div>
    </div>
  );
}