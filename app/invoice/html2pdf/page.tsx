'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Script from 'next/script';

declare global {
  interface Window {
    html2pdf: any;
  }
}

export default function Html2PdfInvoicePage() {
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const generateInvoice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sample invoice data with all the items from your screenshot
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
      
      const response = await fetch('/api/invoice/generate-html2pdf', {
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

  const downloadPDF = () => {
    if (!invoiceHtml || !scriptLoaded || !window.html2pdf) {
      setError('PDF library not loaded yet. Please wait...');
      return;
    }

    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHtml;
    document.body.appendChild(tempDiv);

    // Get the invoice container
    const element = tempDiv.querySelector('.invoice-container');
    
    if (!element) {
      setError('Invoice container not found');
      document.body.removeChild(tempDiv);
      return;
    }

    // Configure html2pdf options with better margins
    const opt = {
      margin: [10, 10, 10, 10], // top, right, bottom, left in mm
      filename: `invoice-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Generate and download PDF
    window.html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((err: any) => {
        console.error('PDF generation error:', err);
        setError('Failed to generate PDF');
        document.body.removeChild(tempDiv);
      });
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
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">HTML2PDF Invoice Generator</h1>
          
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generate Invoice with html2pdf.js</h2>
              <div className="space-x-4">
                <button
                  onClick={generateInvoice}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Invoice'}
                </button>
                {invoiceHtml && (
                  <>
                    <button
                      onClick={downloadPDF}
                      disabled={!scriptLoaded}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {scriptLoaded ? 'Download PDF' : 'Loading...'}
                    </button>
                    <button
                      onClick={openInNewWindow}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      View Full Screen
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-semibold mb-2">Using html2pdf.js - HTML as Design Template:</p>
              <p>✅ Design invoice with HTML/CSS</p>
              <p>✅ Convert to PDF using html2canvas + jsPDF</p>
              <p>✅ Client-side PDF generation</p>
              <p>✅ No server-side dependencies</p>
              <p>✅ Clean layout without overlaps</p>
              <p className="mt-2 text-xs">
                Script Status: {scriptLoaded ? 
                  <span className="text-green-600 font-semibold">Ready</span> : 
                  <span className="text-yellow-600">Loading...</span>
                }
              </p>
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
    </>
  );
}