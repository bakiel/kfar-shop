'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { Loader2, AlertTriangle, Download } from 'lucide-react';

declare global {
  interface Window {
    html2pdf: any;
  }
}

export default function InvoiceViewPage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (invoiceNumber) {
      fetchInvoiceData();
    }
  }, [invoiceNumber]);

  const fetchInvoiceData = async () => {
    try {
      // Get invoice from database
      const response = await fetch(`/api/invoices/get/${invoiceNumber}`);
      const result = await response.json();
      
      if (result.success && result.invoice) {
        // Use stored HTML content
        if (result.invoice.html_content) {
          setInvoiceHtml(result.invoice.html_content);
        } else {
          setError('Invoice found but no content available');
        }
      } else {
        setError('Invoice not found in database');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };


  const downloadPDF = () => {
    if (!invoiceHtml || !scriptLoaded || !window.html2pdf) {
      alert('PDF library not ready. Please wait...');
      return;
    }

    // Create temporary div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHtml;
    document.body.appendChild(tempDiv);

    const element = tempDiv.querySelector('.invoice-container');
    
    if (!element) {
      alert('Invoice content not found');
      document.body.removeChild(tempDiv);
      return;
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `KFAR-Invoice-${invoiceNumber}.pdf`,
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

    window.html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((err: any) => {
        console.error('PDF generation error:', err);
        document.body.removeChild(tempDiv);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 stroke-[1.5] text-green-600 mb-4 animate-spin mx-auto" />
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 stroke-[1.5] text-red-500 mb-4 mx-auto" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header with download button */}
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Invoice #{invoiceNumber}</h1>
            <button
              onClick={downloadPDF}
              disabled={!scriptLoaded}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5 stroke-[1.5]" />
              {scriptLoaded ? 'Download PDF' : 'Loading...'}
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-4">
          {invoiceHtml ? (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                srcDoc={invoiceHtml}
                className="w-full h-screen border-0"
                title={`Invoice ${invoiceNumber}`}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No invoice content available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}