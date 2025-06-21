'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { SmartQRGenerator } from '@/components/qr/SmartQRGenerator';
import { SmartQRScanner } from '@/components/qr/SmartQRScanner';
import { NFCReader } from '@/components/nfc/NFCReader';
import { CollectionPointPicker } from '@/components/collection/CollectionPointPicker';
import { P2POrderTracker } from '@/components/p2p/P2POrderTracker';
import { AI } from '@/lib/services/ai';
import { FaQrcode, FaWifi, FaBrain, FaMapMarkerAlt, FaHandshake, FaCamera } from 'react-icons/fa';

export default function QRNFCDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>('qr-generator');
  const [scanResult, setScanResult] = useState<any>(null);
  const [nfcResult, setNFCResult] = useState<any>(null);
  const [collectionResult, setCollectionResult] = useState<any>(null);
  const [aiResult, setAIResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Demo data
  const demoProduct = {
    id: 'demo-001',
    name: 'Organic Tahini',
    price: 25,
    vendorId: 'teva-deli',
    vendorName: 'Teva Deli'
  };

  const demoOrder = {
    id: 'order-demo-123',
    buyerId: 'buyer-001',
    sellerId: 'seller-001'
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      const result = await AI.analyzeProduct(imageData);
      setAIResult(result);
    };
    reader.readAsDataURL(file);
  };

  const testAISearch = async () => {
    const result = await AI.search({
      text: "I want vegan cheese that's good for pizza",
      context: {
        preferences: ['vegan', 'kosher']
      }
    });
    setAIResult(result);
  };

  const demos = [
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      icon: FaQrcode,
      description: 'Generate AI-enhanced QR codes for products, vendors, and orders'
    },
    {
      id: 'qr-scanner',
      title: 'QR Scanner',
      icon: FaQrcode,
      description: 'Scan QR codes with camera or upload images'
    },
    {
      id: 'nfc-reader',
      title: 'NFC Reader',
      icon: FaWifi,
      description: 'Read NFC tags for instant product info and payments'
    },
    {
      id: 'collection-points',
      title: 'Collection Points',
      icon: FaMapMarkerAlt,
      description: 'Smart collection point management with QR/NFC access'
    },
    {
      id: 'p2p-tracking',
      title: 'P2P Exchange',
      icon: FaHandshake,
      description: 'Peer-to-peer order tracking and verification'
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: FaBrain,
      description: 'Vision analysis, smart search, and recommendations'
    }
  ];

  const getDemoColor = (id: string) => {
    const colors: { [key: string]: string } = {
      'qr-generator': '#478c0b',
      'qr-scanner': '#f6af0d',
      'nfc-reader': '#c23c09',
      'collection-points': '#5C6BC0',
      'p2p-tracking': '#00897B',
      'ai-features': '#E91E63'
    };
    return colors[id] || '#666';
  };

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section */}
        <section className="py-16 text-white" style={{ background: 'linear-gradient(135deg, #478c0b, #f6af0d)' }}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Intelligent QR & NFC System Demo
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Experience the future of smart marketplace interactions with AI-powered QR codes, 
              NFC technology, and intelligent collection systems
            </p>
          </div>
        </section>

        {/* Demo Navigation */}
        <section className="py-8 bg-white shadow-sm sticky top-24 z-30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      activeDemo === demo.id
                        ? 'text-white shadow-lg transform -translate-y-1'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: activeDemo === demo.id ? getDemoColor(demo.id) : undefined
                    }}
                  >
                    <Icon className="text-2xl mx-auto mb-2" />
                    <p className="text-sm font-medium">{demo.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Demo Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Demo Description */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
                  {demos.find(d => d.id === activeDemo)?.title}
                </h2>
                <p className="text-gray-600">
                  {demos.find(d => d.id === activeDemo)?.description}
                </p>
              </div>

              {/* QR Generator Demo */}
              {activeDemo === 'qr-generator' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <SmartQRGenerator
                    type="product"
                    data={demoProduct}
                    size={300}
                  />
                  <SmartQRGenerator
                    type="vendor"
                    data={{ id: 'teva-deli', name: 'Teva Deli' }}
                    size={300}
                    color={{ dark: '#2E7D32', light: '#FFFFFF' }}
                  />
                </div>
              )}

              {/* QR Scanner Demo */}
              {activeDemo === 'qr-scanner' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <FaCamera className="inline mr-2" />
                      Open QR Scanner
                    </button>
                  </div>

                  {scanResult && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold mb-2">Scan Result:</h3>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(scanResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  {showScanner && (
                    <SmartQRScanner
                      onScan={(data) => {
                        setScanResult(data);
                        setShowScanner(false);
                      }}
                      onClose={() => setShowScanner(false)}
                    />
                  )}
                </div>
              )}

              {/* NFC Reader Demo */}
              {activeDemo === 'nfc-reader' && (
                <div className="space-y-6">
                  <NFCReader
                    onRead={(data) => setNFCResult(data)}
                    acceptedTypes={['product', 'vendor', 'payment']}
                  />

                  {nfcResult && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold mb-2">NFC Read Result:</h3>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(nfcResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Collection Points Demo */}
              {activeDemo === 'collection-points' && (
                <div className="space-y-6">
                  <CollectionPointPicker
                    onSelect={(point, slot) => {
                      setCollectionResult({ point, slot });
                    }}
                    orderType="standard"
                    showSlots={true}
                  />

                  {collectionResult && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="font-semibold text-green-800 mb-2">
                        Selected Collection Point:
                      </h3>
                      <p><strong>Location:</strong> {collectionResult.point.name}</p>
                      {collectionResult.slot && (
                        <>
                          <p><strong>Date:</strong> {collectionResult.slot.date.toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {collectionResult.slot.startTime} - {collectionResult.slot.endTime}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* P2P Tracking Demo */}
              {activeDemo === 'p2p-tracking' && (
                <P2POrderTracker
                  orderId={demoOrder.id}
                  userRole="buyer"
                  onComplete={() => console.log('P2P exchange completed')}
                />
              )}

              {/* AI Features Demo */}
              {activeDemo === 'ai-features' && (
                <div className="space-y-6">
                  {/* AI Search */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Smart Search</h3>
                    <button
                      onClick={testAISearch}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <FaBrain className="inline mr-2" />
                      Test AI Search: "Vegan cheese for pizza"
                    </button>
                  </div>

                  {/* Vision Analysis */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Vision Analysis</h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Upload a product image to analyze it with AI
                    </p>
                  </div>

                  {/* AI Results */}
                  {aiResult && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold mb-2">AI Analysis Result:</h3>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(aiResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Technical Info */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                Technical Implementation
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-3">AI Services</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• DeepSeek for natural language processing</li>
                    <li>• Google Gemini for vision analysis</li>
                    <li>• Smart QR content generation</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Security Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Digitally signed QR codes</li>
                    <li>• Time-based expiration</li>
                    <li>• One-time use codes</li>
                    <li>• Secure NFC protocols</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Hardware Support</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Web NFC API (Chrome Android)</li>
                    <li>• Camera-based QR scanning</li>
                    <li>• NTAG213/215/216 chips</li>
                    <li>• Smart locker integration</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Use Cases</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Instant product information</li>
                    <li>• Contactless payments</li>
                    <li>• Order pickup verification</li>
                    <li>• P2P secure exchanges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}