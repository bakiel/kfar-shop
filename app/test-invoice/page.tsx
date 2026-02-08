'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  quantity: number;
}

export default function TestInvoicePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadRealProducts();
  }, []);

  const loadRealProducts = async () => {
    try {
      const response = await fetch('/api/vendors/products');
      const data = await response.json();
      
      if (data.success && data.vendors) {
        const items: CartItem[] = [];
        
        // Get sample products from each vendor
        data.vendors.forEach((vendor: any) => {
          if (vendor.products && vendor.products.length > 0) {
            const numProducts = Math.min(vendor.products.length, Math.random() > 0.5 ? 2 : 1);
            for (let i = 0; i < numProducts; i++) {
              const product = vendor.products[i];
              items.push({
                name: product.name,
                vendor: vendor.name,
                vendorId: vendor.id,
                price: parseFloat(product.price) || 35,
                quantity: Math.floor(Math.random() * 3) + 1
              });
            }
          }
        });
        
        if (items.length === 0) {
          // Use fallback data
          items.push(
            { name: "Classic Vegan Schnitzel", vendor: "Teva Deli", vendorId: "teva-deli", price: 45, quantity: 2 },
            { name: "Cashew Cream Cheese", vendor: "Garden of Light", vendorId: "garden-of-light", price: 32, quantity: 1 },
            { name: "BBQ Pulled Jackfruit", vendor: "Queens Cuisine", vendorId: "queens-cuisine", price: 38, quantity: 1 }
          );
        }
        
        setCartItems(items);
        setStatus(`Loaded ${items.length} items from ${data.source} source`);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use fallback data
      setCartItems([
        { name: "Classic Vegan Schnitzel", vendor: "Teva Deli", vendorId: "teva-deli", price: 45, quantity: 2 },
        { name: "Cashew Cream Cheese", vendor: "Garden of Light", vendorId: "garden-of-light", price: 32, quantity: 1 },
        { name: "BBQ Pulled Jackfruit", vendor: "Queens Cuisine", vendorId: "queens-cuisine", price: 38, quantity: 1 }
      ]);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.17;
    const delivery = 15;
    const total = subtotal + vat + delivery;
    return { subtotal, vat, delivery, total };
  };

  const generateInvoice = async (type: 'standard' | 'enhanced' = 'enhanced') => {
    setLoading(true);
    setStatus('Generating invoice...');
    
    const totals = calculateTotals();
    
    // Group items by vendor for enhanced invoice
    const itemsByVendor: any = {};
    cartItems.forEach(item => {
      if (!itemsByVendor[item.vendor]) {
        itemsByVendor[item.vendor] = [];
      }
      itemsByVendor[item.vendor].push({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendorName: item.vendor
      });
    });
    
    const invoicePayload = {
      orderId: `ORD-${Date.now()}`,
      vendorName: "KFAR Marketplace",
      vendorId: "kfar-marketplace",
      itemsByVendor: type === 'enhanced' ? itemsByVendor : undefined,
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '052-1234567',
        address: "Village of Peace, Dimona"
      },
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendorName: item.vendor
      })),
      subtotal: totals.subtotal,
      vat: totals.vat,
      deliveryFee: totals.delivery,
      total: totals.total,
      paymentMethod: 'Credit Card',
      deliveryMethod: 'Home Delivery',
      language: 'en'
    };
    
    try {
      const endpoint = type === 'enhanced' 
        ? '/api/invoice/generate-simple'  // Using proven pdf-invoice library
        : '/api/invoice/generate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInvoiceData(result);
        setStatus(`✅ ${type === 'enhanced' ? 'Multi-vendor POS' : 'Standard'} invoice generated successfully!`);
      } else {
        setStatus('❌ Failed to generate invoice: ' + (result.error || 'Unknown error'));
      }
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!invoiceData) return;
    
    const link = document.createElement('a');
    link.href = invoiceData.downloadUrl;
    link.download = `KFAR_Invoice_${invoiceData.invoice.invoiceNumber}.pdf`;
    link.click();
    setStatus('✅ PDF downloaded successfully!');
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-leaf-green">KFAR Marketplace Invoice System</h1>
        <p className="text-gray-600 mb-8">Multi-Vendor POS Checkout - Using Real Database Vendors</p>
        
        {/* Order Summary */}
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🛒 Order Summary</h2>
          
          {cartItems.length > 0 ? (
            <>
              {/* Group items by vendor */}
              {Object.entries(
                cartItems.reduce((acc: any, item) => {
                  if (!acc[item.vendor]) acc[item.vendor] = [];
                  acc[item.vendor].push(item);
                  return acc;
                }, {})
              ).map(([vendor, items]: [string, any]) => (
                <div key={vendor} className="mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">📦 {vendor}</h3>
                  {items.map((item: CartItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded mb-1">
                      <div className="flex-1">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-sm font-medium">₪{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>₪{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>VAT (17%):</span>
                  <span>₪{totals.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span>Delivery:</span>
                  <span>₪{totals.delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₪{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Loading products...</p>
          )}
        </div>
        
        {/* Generate Invoice Buttons */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => generateInvoice('standard')}
            disabled={loading || cartItems.length === 0}
            className="flex-1 bg-leaf-green text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
          >
            <i className="fas fa-file-invoice mr-2"></i>
            Generate Standard Invoice
          </button>
          <button 
            onClick={() => generateInvoice('enhanced')}
            disabled={loading || cartItems.length === 0}
            className="flex-1 bg-gradient-to-r from-leaf-green to-sun-gold text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all font-semibold disabled:opacity-50"
          >
            <i className="fas fa-store mr-2"></i>
            Generate Multi-Vendor POS Invoice
          </button>
        </div>
        
        {/* Invoice Result */}
        {invoiceData && (
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">📄 Invoice Generated Successfully!</h3>
            <p className="text-sm text-gray-600 mb-2">
              Invoice Number: <span className="font-mono font-bold">{invoiceData.invoice.invoiceNumber}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Total: <span className="font-bold">₪{invoiceData.invoice.total.toFixed(2)}</span>
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={downloadPDF}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                Download PDF
              </button>
              <button 
                onClick={() => {
                  const newWindow = window.open('', '_blank');
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                      <head><title>Invoice ${invoiceData.invoice.invoiceNumber}</title></head>
                      <body style="margin:0;">
                        <embed src="${invoiceData.downloadUrl}" type="application/pdf" width="100%" height="100%">
                      </body>
                      </html>
                    `);
                  }
                }}
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-eye mr-2"></i>
                View PDF
              </button>
            </div>
            
            {/* QR Code */}
            {invoiceData.invoice.qrCode && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Scan to Pay:</p>
                <img 
                  src={invoiceData.invoice.qrCode} 
                  alt="QR Code" 
                  className="mx-auto border-2 border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Status Messages */}
        {status && (
          <div className={`p-3 rounded-lg border mt-4 ${
            status.includes('✅') ? 'bg-green-100 text-green-800 border-green-300' :
            status.includes('❌') ? 'bg-red-100 text-red-800 border-red-300' :
            'bg-blue-100 text-blue-800 border-blue-300'
          }`}>
            {status}
          </div>
        )}
      </div>
      
      {/* Vendor Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Active vendors in database:</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {['Teva Deli', 'Garden of Light', 'Queens Cuisine', 'Gahn Delight', 'VOP Shop', 'People Store'].map(vendor => (
            <div key={vendor} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-leaf-green to-sun-gold rounded-full flex items-center justify-center mb-1">
                <i className="fas fa-store text-white text-xl"></i>
              </div>
              <p className="text-xs">{vendor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}