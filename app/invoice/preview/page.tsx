'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function InvoicePreviewPage() {
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sample invoice data
      const invoiceData = {
        orderId: 'ORD-2025-001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+972-50-123-4567',
          address: '123 Peace Street, Dimona'
        },
        items: [
          {
            name: 'Database Test Product 1',
            vendor: 'Village Bakery',
            quantity: 3,
            price: 29.99
          },
          {
            name: 'Chocolate Tahini Swirl Ice Cream',
            vendor: 'Desert Delights',
            quantity: 2,
            price: 28.00
          },
          {
            name: 'Spicy Tofu Spread',
            vendor: 'Green Kitchen',
            quantity: 1,
            price: 18.90
          },
          {
            name: 'FOCO 100% Pure Coconut Water - 3 Variety Pack',
            vendor: 'Natural Store',
            quantity: 1,
            price: 65.00
          },
          {
            name: 'Classic Seitan Burger Deluxe',
            vendor: 'Vegan Grill',
            quantity: 3,
            price: 45.00
          },
          {
            name: 'Test Product',
            vendor: 'Test Vendor',
            quantity: 1,
            price: 25.00
          },
          {
            name: 'Seitan Amaranth Kubbeh - Traditional Style',
            vendor: 'Heritage Foods',
            quantity: 2,
            price: 42.99
          },
          {
            name: 'Seitan Schnitzel with Sesame - Amaranth Style',
            vendor: 'Heritage Foods',
            quantity: 2,
            price: 45.99
          },
          {
            name: 'Edenic Vegan Men\'s T-Shirt',
            vendor: 'Eco Fashion',
            quantity: 1,
            price: 79.99
          },
          {
            name: 'Vegan Life Tote Bag',
            vendor: 'Eco Fashion',
            quantity: 1,
            price: 34.99
          }
        ],
        paymentMethod: 'Credit Card',
        deliveryMethod: 'Express Delivery',
        deliveryFee: 15
      };
      
      const response = await fetch('/api/invoice/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInvoiceHtml(result.invoice.html);
      } else {
        setError(result.error || 'Failed to generate invoice');
      }
    } catch (err) {
      setError('Failed to generate invoice');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openInNewWindow = () => {
    if (!invoiceHtml) return;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(invoiceHtml);
      newWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Invoice Preview</h1>
        
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generate HTML Invoice</h2>
            <div className="space-x-4">
              <button
                onClick={generateInvoice}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Invoice'}
              </button>
              {invoiceHtml && (
                <button
                  onClick={openInNewWindow}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open in New Window
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="text-sm text-gray-600 mb-4">
            <p>✅ Clean HTML design with no overlapping text</p>
            <p>✅ Print-friendly layout optimized for PDF generation</p>
            <p>✅ QR code for payment</p>
            <p>✅ Professional styling with proper spacing</p>
          </div>
        </Card>
        
        {invoiceHtml && (
          <Card className="p-0 overflow-hidden">
            <iframe
              srcDoc={invoiceHtml}
              className="w-full h-screen border-0"
              title="Invoice Preview"
            />
          </Card>
        )}
      </div>
    </div>
  );
}