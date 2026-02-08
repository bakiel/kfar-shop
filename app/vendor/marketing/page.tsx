'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, Printer, Share2, QrCode, 
  FileText, Image as ImageIcon, Package, Star,
  Copy, CheckCircle
} from 'lucide-react';

interface MarketingMaterial {
  id: string;
  name: string;
  description: string;
  type: 'flyer' | 'poster' | 'social' | 'qr' | 'banner';
  format: string;
  size: string;
  preview: string;
  downloadUrl: string;
}

export default function MarketingMaterialsPage() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendorId') || 'demo-vendor';
  const [vendorData, setVendorData] = useState<any>(null);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load vendor data
    const storedData = localStorage.getItem(`vendor_${vendorId}_data`);
    if (storedData) {
      setVendorData(JSON.parse(storedData));
    }

    // Generate QR codes
    generateQRCodes();
    setLoading(false);
  }, [vendorId]);

  const generateQRCodes = async () => {
    // In a real app, this would call the API
    // For demo, we'll simulate QR code generation
    const codes = {
      store: `/api/qr/generate?url=${encodeURIComponent(`https://kfar.market/store/${vendorId}`)}`,
      whatsapp: `/api/qr/generate?url=${encodeURIComponent(`https://wa.me/972501234567`)}`,
      menu: `/api/qr/generate?url=${encodeURIComponent(`https://kfar.market/store/${vendorId}/menu`)}`
    };
    setQrCodes(codes);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const storeUrl = `https://kfar.market/store/${vendorId}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Check out our store on KFAR Marketplace! ${storeUrl}`)}`;

  const materials: MarketingMaterial[] = [
    {
      id: 'qr-table-tent',
      name: 'QR Code Table Tent',
      description: 'Perfect for restaurant tables and counters',
      type: 'qr',
      format: 'PDF',
      size: '10x15cm',
      preview: '/images/marketing/table-tent-preview.png',
      downloadUrl: '#'
    },
    {
      id: 'window-poster',
      name: 'Window Poster with QR',
      description: 'Eye-catching poster for your storefront window',
      type: 'poster',
      format: 'PDF',
      size: 'A3 (29.7x42cm)',
      preview: '/images/marketing/window-poster-preview.png',
      downloadUrl: '#'
    },
    {
      id: 'social-media-pack',
      name: 'Social Media Pack',
      description: 'Instagram and Facebook ready images',
      type: 'social',
      format: 'PNG',
      size: '1080x1080px',
      preview: '/images/marketing/social-pack-preview.png',
      downloadUrl: '#'
    },
    {
      id: 'business-card-qr',
      name: 'Business Card QR Stickers',
      description: 'Small QR codes for business cards',
      type: 'qr',
      format: 'PDF',
      size: '3x3cm',
      preview: '/images/marketing/qr-sticker-preview.png',
      downloadUrl: '#'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-leaf-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/vendor/dashboard?vendorId=${vendorId}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Marketing Materials</h1>
            </div>
            
            <img
              src="/images/logos/kfar_logo_primary_horizontal.png"
              alt="KFAR Marketplace"
              className="h-8"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Store Links Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Your Store Links
            </h2>
            
            <div className="space-y-4">
              {/* Store URL */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Store Page</p>
                  <p className="text-sm text-gray-600 font-mono">{storeUrl}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(storeUrl, 'store')}
                  className="flex items-center gap-2 px-4 py-2 text-leaf-green hover:bg-leaf-green hover:text-white border border-leaf-green rounded-lg transition-colors"
                >
                  {copied === 'store' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Share */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Share Link</p>
                  <p className="text-sm text-gray-600">Pre-filled message to share your store</p>
                </div>
                <a
                  href={whatsappShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* QR Codes Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Your QR Codes
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Store QR */}
              <div className="text-center">
                <div className="bg-gray-100 p-8 rounded-lg mb-3">
                  <QrCode className="w-32 h-32 mx-auto text-leaf-green" />
                </div>
                <h3 className="font-semibold mb-1">Store QR Code</h3>
                <p className="text-sm text-gray-600 mb-3">Links to your store page</p>
                <button className="text-leaf-green hover:text-leaf-green-dark flex items-center gap-1 mx-auto">
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </div>

              {/* WhatsApp QR */}
              <div className="text-center">
                <div className="bg-gray-100 p-8 rounded-lg mb-3">
                  <QrCode className="w-32 h-32 mx-auto text-green-500" />
                </div>
                <h3 className="font-semibold mb-1">WhatsApp QR Code</h3>
                <p className="text-sm text-gray-600 mb-3">Direct WhatsApp contact</p>
                <button className="text-leaf-green hover:text-leaf-green-dark flex items-center gap-1 mx-auto">
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </div>

              {/* Menu QR */}
              <div className="text-center">
                <div className="bg-gray-100 p-8 rounded-lg mb-3">
                  <QrCode className="w-32 h-32 mx-auto text-earth-flame" />
                </div>
                <h3 className="font-semibold mb-1">Menu QR Code</h3>
                <p className="text-sm text-gray-600 mb-3">Quick menu access</p>
                <button className="text-leaf-green hover:text-leaf-green-dark flex items-center gap-1 mx-auto">
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Marketing Materials Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Ready-to-Print Materials
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {material.type === 'qr' && <QrCode className="w-24 h-24 text-gray-400" />}
                    {material.type === 'poster' && <FileText className="w-24 h-24 text-gray-400" />}
                    {material.type === 'social' && <ImageIcon className="w-24 h-24 text-gray-400" />}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{material.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{material.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{material.format}</span>
                      <span>{material.size}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-leaf-green text-white rounded hover:bg-leaf-green-dark transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Marketing Tips
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Place QR codes at eye level for maximum visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Include a call-to-action like "Scan for Menu" or "Order Now"</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Update your social media profiles with your KFAR store link</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Print materials on quality paper for a professional look</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}