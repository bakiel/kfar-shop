'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Download, Share2, Store, Package, Users, Calendar, Printer, Eye } from 'lucide-react';
import { useMarketPricing } from '@/hooks/useMarketPricing';

interface VendorQRGeneratorProps {
  vendorId: string;
  vendorData: {
    storeName: string;
    storeNameHe?: string;
    description?: string;
    descriptionHe?: string;
    logo?: string;
    category: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
}

type QRType = 'store' | 'products' | 'contact' | 'special-offer' | 'event';

interface QRDesign {
  id: string;
  name: string;
  preview: string;
  bgColor: string;
  fgColor: string;
  logo: boolean;
}

const QR_DESIGNS: QRDesign[] = [
  { id: 'kfar-classic', name: 'KFAR Classic', preview: '🍃', bgColor: '#ffffff', fgColor: '#478c0b', logo: true },
  { id: 'sun-gold', name: 'Sun Gold', preview: '☀️', bgColor: '#ffffff', fgColor: '#f6af0d', logo: true },
  { id: 'earth-flame', name: 'Earth Flame', preview: '🔥', bgColor: '#ffffff', fgColor: '#c23c09', logo: true },
  { id: 'minimal', name: 'Minimal', preview: '⚪', bgColor: '#ffffff', fgColor: '#000000', logo: false },
  { id: 'inverted', name: 'Inverted', preview: '⚫', bgColor: '#000000', fgColor: '#ffffff', logo: false }
];

export default function VendorQRGenerator({ vendorId, vendorData, products = [] }: VendorQRGeneratorProps) {
  const [selectedType, setSelectedType] = useState<QRType>('store');
  const [selectedDesign, setSelectedDesign] = useState<QRDesign>(QR_DESIGNS[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [specialOfferText, setSpecialOfferText] = useState('');
  const [eventDetails, setEventDetails] = useState({ title: '', date: '', time: '' });
  const [generatedQRData, setGeneratedQRData] = useState<string>('');
  
  // Get market insights for special offers
  const { data: marketData } = useMarketPricing(vendorData.category);
  
  // Generate QR data based on type
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kfar-marketplace.com';
    let qrData = '';
    
    switch (selectedType) {
      case 'store':
        qrData = `${baseUrl}/store/${vendorId}`;
        break;
        
      case 'products':
        qrData = `${baseUrl}/store/${vendorId}#products`;
        break;
        
      case 'contact':
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${vendorData.storeName}
ORG:${vendorData.storeName}
TEL:${vendorData.phone || ''}
EMAIL:${vendorData.email || ''}
ADR:${vendorData.address || ''}
URL:${baseUrl}/store/${vendorId}
END:VCARD`;
        qrData = vCard;
        break;
        
      case 'special-offer':
        qrData = `${baseUrl}/store/${vendorId}?offer=${encodeURIComponent(specialOfferText)}&utm_source=qr&utm_campaign=special_offer`;
        break;
        
      case 'event':
        qrData = `${baseUrl}/store/${vendorId}/event?title=${encodeURIComponent(eventDetails.title)}&date=${eventDetails.date}&time=${eventDetails.time}`;
        break;
    }
    
    setGeneratedQRData(qrData);
  }, [selectedType, vendorId, vendorData, specialOfferText, eventDetails]);
  
  // Download QR code as image
  const downloadQR = (format: 'png' | 'svg' | 'pdf') => {
    const qrElement = document.getElementById('vendor-qr-code');
    if (!qrElement) return;
    
    if (format === 'svg') {
      const svgData = qrElement.querySelector('svg')?.outerHTML;
      if (svgData) {
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${vendorData.storeName.replace(/\s+/g, '-')}-qr-${selectedType}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else if (format === 'png') {
      // Convert SVG to PNG
      const svg = qrElement.querySelector('svg');
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${vendorData.storeName.replace(/\s+/g, '-')}-qr-${selectedType}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };
  
  // Share QR code
  const shareQR = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${vendorData.storeName} - KFAR Marketplace`,
        text: `Visit ${vendorData.storeName} on KFAR Marketplace`,
        url: generatedQRData.startsWith('http') ? generatedQRData : `https://kfar-marketplace.com/store/${vendorId}`
      });
    }
  };
  
  const qrTypes = [
    { id: 'store', label: 'Store Page', icon: Store, description: 'Link to your main store page' },
    { id: 'products', label: 'Product Catalog', icon: Package, description: 'Direct link to your products' },
    { id: 'contact', label: 'Contact vCard', icon: Users, description: 'Save contact info to phone' },
    { id: 'special-offer', label: 'Special Offer', icon: Calendar, description: 'Promote a special deal' },
    { id: 'event', label: 'Event/Demo', icon: Calendar, description: 'Promote an upcoming event' }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark p-6">
        <h3 className="text-2xl font-bold text-white mb-2">QR Code Generator</h3>
        <p className="text-white/80">Create QR codes for marketing materials and customer engagement</p>
      </div>
      
      <div className="p-6">
        {/* QR Type Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Select QR Code Type</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {qrTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as QRType)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === type.id
                      ? 'border-leaf-green bg-leaf-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    selectedType === type.id ? 'text-leaf-green' : 'text-gray-500'
                  }`} />
                  <p className="text-sm font-medium">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Type-specific Options */}
        {selectedType === 'special-offer' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium mb-2">Special Offer Text</label>
            <input
              type="text"
              value={specialOfferText}
              onChange={(e) => setSpecialOfferText(e.target.value)}
              placeholder="e.g., 20% off all organic products this week!"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {marketData && (
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Your average price is ₪{marketData.marketStats.avgPrice}. 
                Consider offering 10-15% off to attract new customers.
              </p>
            )}
          </div>
        )}
        
        {selectedType === 'event' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                value={eventDetails.title}
                onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                placeholder="e.g., Vegan Cooking Workshop"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={eventDetails.time}
                  onChange={(e) => setEventDetails({ ...eventDetails, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Design Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Choose Design</h4>
          <div className="flex gap-3 flex-wrap">
            {QR_DESIGNS.map((design) => (
              <button
                key={design.id}
                onClick={() => setSelectedDesign(design)}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  selectedDesign.id === design.id
                    ? 'border-leaf-green bg-leaf-green/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{design.preview}</span>
                <span className="text-sm font-medium">{design.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* QR Code Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">QR Code Preview</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-leaf-green hover:text-leaf-green-dark flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Marketing Preview
            </button>
          </div>
          
          <div className="flex justify-center">
            <div 
              id="vendor-qr-code" 
              className="p-8 bg-white rounded-lg shadow-lg"
              style={{ backgroundColor: selectedDesign.bgColor }}
            >
              <QRCode
                value={generatedQRData}
                size={256}
                level="H"
                fgColor={selectedDesign.fgColor}
                bgColor={selectedDesign.bgColor}
              />
              <div className="text-center mt-4">
                <p className="font-semibold" style={{ color: selectedDesign.fgColor }}>
                  {vendorData.storeName}
                </p>
                <p className="text-sm text-gray-600">Scan to visit</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Marketing Preview */}
        {showPreview && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Marketing Material Preview</h4>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-soil-brown mb-2">{vendorData.storeName}</h2>
                {vendorData.storeNameHe && (
                  <p className="text-xl text-gray-600" dir="rtl">{vendorData.storeNameHe}</p>
                )}
                <p className="text-gray-600 mt-2">{vendorData.description}</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <QRCode
                    value={generatedQRData}
                    size={200}
                    level="H"
                    fgColor={selectedDesign.fgColor}
                    bgColor={selectedDesign.bgColor}
                  />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Visit us at KFAR Marketplace</p>
                <p className="text-gray-600">Village of Peace, Dimona</p>
                {vendorData.phone && <p className="text-gray-600">📞 {vendorData.phone}</p>}
              </div>
              
              {selectedType === 'special-offer' && specialOfferText && (
                <div className="mt-6 p-4 bg-sun-gold/20 rounded-lg text-center">
                  <p className="text-lg font-bold text-earth-flame">🎉 {specialOfferText}</p>
                  <p className="text-sm text-gray-600 mt-1">Show this QR code to redeem</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadQR('png')}
            className="flex-1 px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PNG
          </button>
          
          <button
            onClick={() => downloadQR('svg')}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download SVG
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2 bg-sun-gold text-white rounded-lg hover:bg-sun-gold-dark transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
          
          {navigator.share && (
            <button
              onClick={shareQR}
              className="flex-1 px-4 py-2 bg-earth-flame text-white rounded-lg hover:bg-earth-flame-dark transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          )}
        </div>
        
        {/* Usage Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-800 mb-2">💡 QR Code Usage Tips</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Print on business cards, flyers, and product packaging</li>
            <li>• Display at your physical store or market stall</li>
            <li>• Share on social media to drive traffic</li>
            <li>• Include in email signatures and newsletters</li>
            <li>• Track scans to measure marketing effectiveness</li>
          </ul>
        </div>
      </div>
    </div>
  );
}