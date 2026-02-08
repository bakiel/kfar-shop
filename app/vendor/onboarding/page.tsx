'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/styles/kfar-style-system.css';

export default function VendorOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiMessage, setAiMessage] = useState("Welcome! I'm your AI assistant. I'll help you set up your store on KFAR Marketplace.");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Store data
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeNameHe: '',
    category: '',
    description: '',
    descriptionHe: '',
    logo: null as string | null,
    banner: null as string | null,
    phone: '',
    email: '',
    password: '',
    address: '',
    deliveryOptions: [] as string[],
    businessHours: {
      sunday: { open: '09:00', close: '18:00', closed: false },
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '14:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: true },
    },
    aboutOwner: ''
  });

  interface Product {
    id: string;
    name: string;
    nameHe: string;
    description: string;
    descriptionHe: string;
    price: number;
    category: string;
    image: string | null;
    isVegan: boolean;
    isKosher: boolean;
    inStock: boolean;
    isAnalyzing?: boolean;
    aiEnhanced?: boolean;
    vopCompliance?: {
      isCompliant: boolean;
      issues?: string[];
    };
  }

  const [products, setProducts] = useState<Product[]>([]);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Store name and category', icon: 'fa-store' },
    { id: 2, title: 'Branding', description: 'Logo and banner', icon: 'fa-palette' },
    { id: 3, title: 'Details', description: 'Contact and delivery', icon: 'fa-info-circle' },
    { id: 4, title: 'Products', description: 'Your catalog', icon: 'fa-box' },
    { id: 5, title: 'Review', description: 'Launch store', icon: 'fa-rocket' },
  ];

  const getAIMessage = (step: number) => {
    const messages: Record<number, string> = {
      1: "Let's start with your store name. Choose something memorable that reflects your brand.",
      2: "Time to make your store visually appealing! Upload a square logo and a wide banner.",
      3: "Add your contact details and delivery options to help customers reach you.",
      4: "Now add your products! Upload images and we'll help enhance them with AI.",
      5: "Review everything and launch your store when you're ready!"
    };
    return messages[step] || "I'm here to help!";
  };

  useEffect(() => {
    setAiMessage(getAIMessage(currentStep));
  }, [currentStep]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'product', productId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (type === 'logo') {
        setStoreData({ ...storeData, logo: imageData });
        setAiMessage("✅ Logo uploaded! Your store is looking professional.");
      } else if (type === 'banner') {
        setStoreData({ ...storeData, banner: imageData });
        setAiMessage("✅ Banner uploaded! Great visual appeal for your store.");
      } else if (type === 'product' && productId) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, image: imageData, isAnalyzing: true } : p
        ));
        setAiMessage("🤖 Analyzing product image with AI...");
        
        // Trigger AI analysis for product
        await analyzeProductWithAI(imageData, productId);
      }
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now().toString(),
      name: '',
      nameHe: '',
      description: '',
      price: 0,
      category: '',
      image: null,
      isVegan: true,
      isKosher: true,
      inStock: true
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // AI Product Analysis Function
  const analyzeProductWithAI = async (imageData: string, productId: string) => {
    try {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;
      
      // Call AI analyzer API
      const response = await fetch('/api/vendor/products/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          currentData: {
            name: currentProduct.name,
            category: currentProduct.category
          }
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.product) {
        const enhanced = result.product;
        
        // Update product with AI enhancements
        setProducts(products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              name: enhanced.name || p.name,
              nameHe: enhanced.translations?.nameHe || p.nameHe,
              description: enhanced.description || p.description,
              category: enhanced.category || p.category,
              price: enhanced.pricing?.suggested || p.price,
              isVegan: enhanced.vopCompliance?.isCompliant ?? p.isVegan,
              vopCompliance: enhanced.vopCompliance,
              image: imageData,
              isAnalyzing: false,
              aiEnhanced: true
            };
          }
          return p;
        }));
        
        // Provide AI feedback
        if (enhanced.vopCompliance?.isCompliant) {
          setAiMessage(`✅ AI Analysis Complete! "${enhanced.name}" is VOP compliant. Suggested price: ₪${enhanced.pricing?.suggested}. The product looks great!`);
        } else {
          const issues = enhanced.vopCompliance?.issues?.join(', ') || 'compliance issues';
          setAiMessage(`⚠️ AI Analysis: "${enhanced.name}". Note: ${issues}. Please review VOP guidelines.`);
        }
      } else {
        // Remove analyzing state even if analysis failed
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isAnalyzing: false } : p
        ));
        setAiMessage("Product uploaded! AI enhancement unavailable, but you can enter details manually.");
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isAnalyzing: false } : p
      ));
      setAiMessage("Product uploaded! Please enter details manually.");
    }
  };

  // Auto-translate function for store names and descriptions
  const translateText = async (text: string, targetLang: 'he' | 'en', context: string = 'store_name') => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang,  // Fixed: using correct parameter name
          context
        }),
      });
      
      const result = await response.json();
      return result.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return storeData.storeName && storeData.category;
      case 2:
        return storeData.logo && storeData.banner;
      case 3:
        return storeData.phone && storeData.email && storeData.address;
      case 4:
        return products.length > 0 && products.every(p => p.name && p.price);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const completeOnboarding = async () => {
    console.log('Starting vendor onboarding...');
    
    const missingFields = [];
    if (!storeData.storeName) missingFields.push('Store Name');
    if (!storeData.email) missingFields.push('Email');
    if (!storeData.password) missingFields.push('Password');
    if (!storeData.phone) missingFields.push('Phone');
    if (!storeData.address) missingFields.push('Address');
    if (products.length === 0) missingFields.push('At least one product');
    
    if (missingFields.length > 0) {
      alert('Please complete: ' + missingFields.join(', '));
      return;
    }
    
    try {
      setAiMessage("🚀 Creating your vendor account...");

      // Call the API route to create vendor
      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeData.storeName,
          storeNameHe: storeData.storeNameHe || storeData.storeName,
          category: storeData.category,
          description: storeData.description,
          descriptionHe: storeData.descriptionHe || storeData.description,
          logo: storeData.logo,
          banner: storeData.banner,
          phone: storeData.phone,
          email: storeData.email,
          password: storeData.password,
          address: storeData.address,
          deliveryOptions: storeData.deliveryOptions || ['pickup', 'delivery'],
          businessHours: storeData.businessHours,
          products: products
        })
      });
      const result = await response.json();
      
      if (result.success && result.vendorId) {
        localStorage.setItem('vendorId', result.vendorId);
        localStorage.setItem('userRole', 'vendor');
        localStorage.setItem('customerName', storeData.storeName);
        
        setAiMessage('✅ Success! Your store is live. Redirecting to your dashboard...');
        
        setTimeout(() => {
          router.push('/vendor/dashboard?vendorId=' + result.vendorId);
        }, 2000);
      } else {
        const errorMessage = result.error || 'Could not connect to database';
        setAiMessage(`❌ ${errorMessage}`);
        alert(`Failed to create vendor account: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setAiMessage('⚠️ Network error. Please check your connection and try again.');
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex kfar-bg-cream">
      {/* Desktop Sidebar */}
      <aside className={`${showAIAssistant ? 'w-80' : 'w-0'} hidden lg:block transition-all duration-300 kfar-gradient-primary text-white relative overflow-hidden`}>
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center z-10 kfar-text-leaf-green"
        >
          <i className={`fas fa-chevron-${showAIAssistant ? 'left' : 'right'} text-xs`}></i>
        </button>

        {showAIAssistant && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">AI Assistant</h3>
              <p className="text-sm opacity-80 mt-1">Your onboarding guide</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-sm">{aiMessage}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {(isMobile || isTablet) && (
          <div className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">KFAR Marketplace</span>
                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="w-8 h-8 bg-leaf-green/10 text-leaf-green rounded-full flex items-center justify-center"
                >
                  <i className="fas fa-robot text-sm"></i>
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-leaf-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Step {currentStep} of 5</span>
                <span className="text-sm font-semibold">{steps[currentStep - 1]?.title}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile AI Assistant Bottom Sheet */}
        {showAIAssistant && (isMobile || isTablet) && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowAIAssistant(false)}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
              <div className="p-4">
                <div className="bg-leaf-green/5 rounded-lg p-3">
                  <p className="text-sm">{aiMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && !isTablet && (
          <header className="bg-white shadow-md px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome to KFAR Marketplace!</h1>
                <p className="text-gray-600 mt-1">Let's set up your store</p>
              </div>
              <Link href="/">
                <button className="text-gray-600 hover:text-gray-800">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </Link>
            </div>
          </header>
        )}

        {/* Progress Steps */}
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-leaf-green text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <i className={`fas ${step.icon} text-sm`}></i>
                  </div>
                  {!isMobile && (
                    <span className={`mt-2 text-xs font-medium ${
                      currentStep >= step.id ? 'text-leaf-green' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-leaf-green' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Basic Store Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Store Name (English) * 
                      <span className="ml-2 text-xs text-green-600">AI will auto-translate</span>
                    </label>
                    <input
                      type="text"
                      value={storeData.storeName}
                      onChange={async (e) => {
                        const newName = e.target.value;
                        setStoreData({ ...storeData, storeName: newName });
                        // Auto-translate to Hebrew
                        if (newName.length > 2) {
                          const hebrewName = await translateText(newName, 'he');
                          setStoreData(prev => ({ ...prev, storeNameHe: hebrewName }));
                        }
                      }}
                      placeholder="e.g., Sarah's Vegan Delights"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-leaf-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Store Name (Hebrew)
                      <span className="ml-2 text-xs text-green-600">AI will auto-translate</span>
                    </label>
                    <input
                      type="text"
                      value={storeData.storeNameHe}
                      onChange={async (e) => {
                        const newNameHe = e.target.value;
                        setStoreData({ ...storeData, storeNameHe: newNameHe });
                        // Auto-translate to English
                        if (newNameHe.length > 2) {
                          const englishName = await translateText(newNameHe, 'en');
                          setStoreData(prev => ({ ...prev, storeName: englishName }));
                        }
                      }}
                      placeholder="שם החנות בעברית"
                      className="w-full px-4 py-2 border rounded-lg text-right"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Store Category *</label>
                    <select
                      value={storeData.category}
                      onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a category</option>
                      <option value="food">Food & Beverages</option>
                      <option value="bakery">Bakery & Desserts</option>
                      <option value="clothing">Clothing & Accessories</option>
                      <option value="wellness">Health & Wellness</option>
                      <option value="crafts">Arts & Crafts</option>
                      <option value="services">Services</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Brief Description (English)</label>
                      <textarea
                        value={storeData.description}
                        onChange={async (e) => {
                          const newDescription = e.target.value;
                          setStoreData({ ...storeData, description: newDescription });
                          
                          // Auto-translate to Hebrew
                          if (newDescription.length > 5) {
                            try {
                              const translated = await translateText(newDescription, 'he', 'description');
                              setStoreData(prev => ({ ...prev, descriptionHe: translated }));
                            } catch (error) {
                              console.error('Translation error:', error);
                            }
                          }
                        }}
                        placeholder="Tell customers what makes your store special..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">תיאור קצר (עברית)</label>
                      <textarea
                        value={storeData.descriptionHe}
                        onChange={async (e) => {
                          const newDescriptionHe = e.target.value;
                          setStoreData({ ...storeData, descriptionHe: newDescriptionHe });
                          
                          // Auto-translate to English
                          if (newDescriptionHe.length > 5) {
                            try {
                              const translated = await translateText(newDescriptionHe, 'en', 'description');
                              setStoreData(prev => ({ ...prev, description: translated }));
                            } catch (error) {
                              console.error('Translation error:', error);
                            }
                          }
                        }}
                        placeholder="ספרו ללקוחות מה מיוחד בחנות שלכם..."
                        rows={3}
                        dir="rtl"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Store Branding</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Store Logo</h3>
                    {storeData.logo ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img src={storeData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={() => setStoreData({ ...storeData, logo: null })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-leaf-green">
                        <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                        <span className="text-xs text-gray-500">Upload Logo</span>
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, 'logo')}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Store Banner</h3>
                    {storeData.banner ? (
                      <div className="relative w-full" style={{ aspectRatio: '3/1' }}>
                        <img src={storeData.banner} alt="Banner" className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={() => setStoreData({ ...storeData, banner: null })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-leaf-green" style={{ aspectRatio: '3/1', minHeight: '100px' }}>
                        <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                        <span className="text-xs text-gray-500">Upload Banner</span>
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, 'banner')}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Store Details */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Contact & Delivery Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={storeData.phone}
                      onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                      placeholder="+972-XX-XXX-XXXX"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={storeData.email}
                      onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                      placeholder="store@example.com"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      value={storeData.password}
                      onChange={(e) => setStoreData({ ...storeData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Store Address *</label>
                    <input
                      type="text"
                      value={storeData.address}
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      placeholder="Village of Peace, Dimona"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Delivery Options</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {['pickup', 'local-delivery', 'shipping'].map((option) => (
                      <label key={option} className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
                        storeData.deliveryOptions.includes(option) ? 'border-leaf-green bg-leaf-green/10' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={storeData.deliveryOptions.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStoreData({ ...storeData, deliveryOptions: [...storeData.deliveryOptions, option] });
                            } else {
                              setStoreData({ ...storeData, deliveryOptions: storeData.deliveryOptions.filter(o => o !== option) });
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">
                          {option === 'pickup' && 'Store Pickup'}
                          {option === 'local-delivery' && 'Local Delivery'}
                          {option === 'shipping' && 'Shipping'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Products */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add Your Products</h2>
                  <button
                    onClick={addProduct}
                    className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Product
                  </button>
                </div>

                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-box-open text-4xl mb-4"></i>
                      <p>No products added yet. Click "Add Product" to start!</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className={`border-2 rounded-lg p-4 relative transition-all ${
                        product.isAnalyzing ? 'border-yellow-400 bg-yellow-50' : 
                        product.aiEnhanced ? 'border-green-500 bg-green-50' : 
                        'border-gray-200 hover:border-gray-300'
                      }`}>
                        {/* AI Status Badge */}
                        {(product.isAnalyzing || product.aiEnhanced) && (
                          <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                            product.isAnalyzing ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {product.isAnalyzing ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                AI Analyzing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-magic"></i>
                                AI Enhanced
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* VOP Compliance Badge */}
                        {product.vopCompliance && !product.isAnalyzing && (
                          <div className="absolute -top-3 left-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                              product.vopCompliance.isCompliant 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              <i className={`fas ${product.vopCompliance.isCompliant ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                              {product.vopCompliance.isCompliant ? 'VOP Compliant' : 'Review Required'}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            {product.image ? (
                              <div className="relative w-24 h-24">
                                <img src={product.image} alt="Product" className="w-full h-full object-cover rounded" />
                                {product.isAnalyzing && (
                                  <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin text-white text-xl"></i>
                                  </div>
                                )}
                                <button
                                  onClick={() => updateProduct(product.id, { image: null, aiEnhanced: false, vopCompliance: undefined })}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full"
                                  disabled={product.isAnalyzing}
                                >
                                  <i className="fas fa-times text-xs"></i>
                                </button>
                              </div>
                            ) : (
                              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-green-500">
                                <i className="fas fa-camera text-gray-400"></i>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileSelect(e, 'product', product.id)}
                                  accept="image/*"
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <div className="grid md:grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                                  placeholder="Product Name"
                                  className={`px-3 py-2 border rounded w-full ${product.isAnalyzing ? 'bg-gray-100' : ''}`}
                                  disabled={product.isAnalyzing}
                                />
                                {product.nameHe && (
                                  <p className="text-xs text-gray-500 mt-1 text-right" dir="rtl">{product.nameHe}</p>
                                )}
                              </div>
                              <input
                                type="number"
                                value={product.price}
                                onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                                placeholder="Price (₪)"
                                className={`px-3 py-2 border rounded ${product.isAnalyzing ? 'bg-gray-100' : ''}`}
                                disabled={product.isAnalyzing}
                              />
                            </div>
                            {/* Product Description with Translation */}
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm font-medium">Description (English)</label>
                                <textarea
                                  value={product.description || ''}
                                  onChange={async (e) => {
                                    const newDescription = e.target.value;
                                    updateProduct(product.id, { description: newDescription });
                                    
                                    // Auto-translate to Hebrew
                                    if (newDescription.length > 3) {
                                      try {
                                        const translated = await translateText(newDescription, 'he');
                                        updateProduct(product.id, { descriptionHe: translated });
                                      } catch (error) {
                                        console.error('Translation error:', error);
                                      }
                                    }
                                  }}
                                  placeholder="Product description..."
                                  rows={2}
                                  className={`px-3 py-2 border rounded w-full ${product.isAnalyzing ? 'bg-gray-100' : ''}`}
                                  disabled={product.isAnalyzing}
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">תיאור (עברית)</label>
                                <textarea
                                  value={product.descriptionHe || ''}
                                  onChange={async (e) => {
                                    const newDescriptionHe = e.target.value;
                                    updateProduct(product.id, { descriptionHe: newDescriptionHe });
                                    
                                    // Auto-translate to English
                                    if (newDescriptionHe.length > 3) {
                                      try {
                                        const translated = await translateText(newDescriptionHe, 'en');
                                        updateProduct(product.id, { description: translated });
                                      } catch (error) {
                                        console.error('Translation error:', error);
                                      }
                                    }
                                  }}
                                  placeholder="תיאור המוצר..."
                                  rows={2}
                                  dir="rtl"
                                  className={`px-3 py-2 border rounded w-full ${product.isAnalyzing ? 'bg-gray-100' : ''}`}
                                  disabled={product.isAnalyzing}
                                />
                              </div>
                              
                              {product.aiEnhanced && product.description && (
                                <div className="p-2 bg-green-50 rounded text-xs text-green-700">
                                  <i className="fas fa-magic mr-1"></i>
                                  AI enhanced description
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={product.isVegan}
                                  onChange={(e) => updateProduct(product.id, { isVegan: e.target.checked })}
                                />
                                <span className="text-sm">Vegan</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={product.isKosher}
                                  onChange={(e) => updateProduct(product.id, { isKosher: e.target.checked })}
                                />
                                <span className="text-sm">Kosher</span>
                              </label>
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="ml-auto text-red-500"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Review Your Store</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="font-semibold mb-3">Store Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {storeData.storeName}</p>
                      <p><strong>Category:</strong> {storeData.category}</p>
                      <p><strong>Phone:</strong> {storeData.phone}</p>
                      <p><strong>Email:</strong> {storeData.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Store Stats</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Products:</strong> {products.length}</p>
                      <p><strong>Delivery Options:</strong> {storeData.deliveryOptions.length}</p>
                      <p><strong>Logo:</strong> {storeData.logo ? 'Uploaded' : 'Not uploaded'}</p>
                      <p><strong>Banner:</strong> {storeData.banner ? 'Uploaded' : 'Not uploaded'}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={completeOnboarding}
                    className="px-8 py-3 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark text-lg font-semibold"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    Launch My Store
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={`${
          isMobile || isTablet 
            ? 'fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-30' 
            : 'px-8 py-4 bg-white border-t'
        }`}>
          <div className="flex gap-3 justify-between max-w-4xl mx-auto">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
            )}
            {currentStep < 5 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className={`px-4 py-2 rounded-lg ml-auto ${
                  isStepValid()
                    ? 'bg-leaf-green text-white hover:bg-leaf-green-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}