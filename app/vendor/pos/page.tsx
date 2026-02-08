'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  nameHe: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export default function VendorPOS() {
  const router = useRouter();
  const [vendorName, setVendorName] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  
  // Quick add product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    nameHe: '',
    price: 0,
    quantity: 1
  });

  useEffect(() => {
    // Get vendor info from localStorage
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorName = localStorage.getItem('customerName');
    
    if (storedVendorId) {
      setVendorId(storedVendorId);
      setVendorName(storedVendorName || 'Your Store');
    }
  }, []);

  const addToCart = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      alert('Please enter product name and price');
      return;
    }
    
    const item: CartItem = {
      id: `item-${Date.now()}`,
      name: newProduct.name,
      nameHe: newProduct.nameHe || newProduct.name,
      price: newProduct.price,
      quantity: newProduct.quantity
    };
    
    setCartItems([...cartItems, item]);
    setNewProduct({ name: '', nameHe: '', price: 0, quantity: 1 });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.17; // 17% Israeli VAT
    const deliveryFee = deliveryMethod === 'delivery' ? 25 : 0;
    const total = subtotal + vat + deliveryFee;
    
    return { subtotal, vat, deliveryFee, total };
  };

  const generateInvoice = async () => {
    // Validate customer info
    if (!customer.name || !customer.phone) {
      alert('Please enter customer name and phone');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Please add items to the cart');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const totals = calculateTotals();
      
      const invoicePayload = {
        orderId: `ORD-${Date.now()}`,
        vendorName,
        vendorId,
        customer,
        items: cartItems,
        ...totals,
        paymentMethod,
        deliveryMethod,
        createdAt: new Date().toISOString(),
        language
      };
      
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInvoiceData(result.invoice);
        setInvoiceReady(true);
      } else {
        alert('Failed to generate invoice: ' + result.error);
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      alert('Error generating invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadInvoice = () => {
    if (!invoiceData) return;
    
    // Create download link for PDF
    const link = document.createElement('a');
    link.href = invoiceData.downloadUrl;
    link.download = `KFAR-Invoice-${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const newTransaction = () => {
    setCartItems([]);
    setCustomer({ name: '', email: '', phone: '', address: '' });
    setInvoiceReady(false);
    setInvoiceData(null);
  };

  const { subtotal, vat, deliveryFee, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
              <p className="text-sm text-gray-600">{vendorName}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {language === 'en' ? '🇮🇱 עברית' : '🇬🇧 English'}
              </button>
              <button
                onClick={() => router.push('/vendor/dashboard')}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Product Entry & Cart */}
          <div className="space-y-6">
            {/* Quick Add Product */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add Product</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name (English)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="שם המוצר (עברית)"
                  value={newProduct.nameHe}
                  onChange={(e) => setNewProduct({ ...newProduct, nameHe: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-right"
                  dir="rtl"
                />
                <input
                  type="number"
                  placeholder="Price (₪)"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addToCart}
                className="w-full mt-4 px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-green-600"
              >
                Add to Cart
              </button>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Cart Items</h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in cart</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.nameHe && (
                          <p className="text-sm text-gray-600" dir="rtl">{item.nameHe}</p>
                        )}
                        <p className="text-sm text-gray-600">₪{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer Info & Totals */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Payment & Delivery Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment & Delivery</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="braysheet">Braysheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Method</label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery (+₪25)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (17%):</span>
                  <span>₪{vat.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>₪{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-earth-flame">₪{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!invoiceReady ? (
                <button
                  onClick={generateInvoice}
                  disabled={isGenerating || cartItems.length === 0}
                  className={`w-full px-6 py-3 rounded-lg font-semibold ${
                    isGenerating || cartItems.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-earth-flame text-white hover:bg-orange-600'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Invoice...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-invoice mr-2"></i>
                      Generate Invoice & QR Code
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={downloadInvoice}
                    className="w-full px-6 py-3 bg-leaf-green text-white rounded-lg font-semibold hover:bg-green-600"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download Invoice PDF
                  </button>
                  <button
                    onClick={newTransaction}
                    className="w-full px-6 py-3 bg-sun-gold text-white rounded-lg font-semibold hover:bg-yellow-600"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    New Transaction
                  </button>
                </>
              )}
            </div>

            {/* Invoice Preview */}
            {invoiceReady && invoiceData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice Ready!</h2>
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">Invoice Number:</p>
                  <p className="text-xl font-bold text-earth-flame">{invoiceData.invoiceNumber}</p>
                  
                  {invoiceData.qrCode && (
                    <div className="flex justify-center">
                      <img src={invoiceData.qrCode} alt="Payment QR Code" className="w-32 h-32" />
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">
                    Customer can scan this QR code to pay
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}