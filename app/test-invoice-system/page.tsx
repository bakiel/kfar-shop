'use client';

import React, { useState } from 'react';

export default function TestInvoiceSystem() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFullFlow = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-invoice-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Invoice System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Complete Invoice Flow</h2>
          <p className="text-gray-600 mb-4">
            This will test: Invoice Generation → Database Save → View Link
          </p>
          
          <button
            onClick={testFullFlow}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Full Test'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">✅ Test Results:</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Step 1:</strong> Invoice generation - ✅ Success</p>
              <p><strong>Step 2:</strong> Database save - {result.results.step2_database_save ? '✅ Success' : '⚠️ Warning'}</p>
              <p><strong>Invoice Number:</strong> {result.results.step1_invoice_generation?.invoice?.invoiceNumber}</p>
              
              <div className="mt-4 space-x-4">
                <a 
                  href={result.results.test_invoice_url}
                  target="_blank"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  📄 View Generated Invoice
                </a>
                <a 
                  href="/invoice/html2pdf"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🧪 Direct HTML2PDF Test
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/invoice/html2pdf"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-semibold">Direct Test</div>
              <div className="text-sm text-gray-600">HTML2PDF Generator</div>
            </a>
            <a 
              href="/checkout"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold">Full Checkout</div>
              <div className="text-sm text-gray-600">Complete Flow Test</div>
            </a>
            <a 
              href="/marketplace"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">🏪</div>
              <div className="font-semibold">Marketplace</div>
              <div className="text-sm text-gray-600">Add Items to Cart</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}