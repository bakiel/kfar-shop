'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageCropper from '@/components/vendor/ImageCropper';
import ImageGuidelines from '@/components/vendor/ImageGuidelines';
import ImageManager, { ManagedImage } from '@/components/vendor/ImageManager';
import { useTranslation } from '@/hooks/useTranslation';
import { processImageClientSide } from '@/lib/utils/client-image-processor';
import '@/styles/kfar-style-system.css';

// Image size limits and specifications
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const LOGO_SIZE = 800; // 800x800 for logo
const BANNER_WIDTH = 1200; // 1200x400 for banner
const BANNER_HEIGHT = 400;
const PRODUCT_SIZE = 800; // 800x800 for products
const LOGO_ASPECT_RATIO = 1; // 1:1 square
const BANNER_ASPECT_RATIO = 3; // 3:1 wide
const PRODUCT_ASPECT_RATIO = 1; // 1:1 square

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface StoreData {
  storeName: string;
  storeNameHe: string;
  category: string;
  description: string;
  descriptionHe: string;
  logo: string | null;
  banner: string | null;
  phone: string;
  email: string;
  address: string;
  deliveryOptions: string[];
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
}

interface Product {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isVegan: boolean;
  isKosher: boolean;
  inStock: boolean;
  isAnalyzing?: boolean;
  aiEnhanced?: boolean;
}

export default function VendorOnboardingEnhanced() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiMessage, setAiMessage] = useState("Welcome! I'm your AI assistant. I'll help you set up your store on KFAR Marketplace. Let's start with your basic information. Pro tip: When you type in English or Hebrew, I'll automatically translate to the other language!");
  const [cropperData, setCropperData] = useState<{
    image: string;
    type: 'logo' | 'banner' | 'product';
    productId?: string;
    imageId?: string;
  } | null>(null);
  
  // Translation hook
  const { translate, isTranslating } = useTranslation();
  const [translationTimeout, setTranslationTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Image guidelines state
  const [showImageGuidelines, setShowImageGuidelines] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  // Image management state
  const [managedImages, setManagedImages] = useState<ManagedImage[]>([]);

  // Store data
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: '',
    storeNameHe: '',
    category: '',
    description: '',
    descriptionHe: '',
    logo: null,
    banner: null,
    phone: '',
    email: '',
    address: '',
    deliveryOptions: [],
    businessHours: {
      sunday: { open: '09:00', close: '18:00', closed: false },
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '14:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: true },
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [bulkImportMode, setBulkImportMode] = useState(false);

  // Auto-translate helper function with debounce
  const handleAutoTranslate = async (
    text: string,
    fromField: string,
    toField: string,
    targetLang: 'he' | 'en',
    context?: 'store_name' | 'description' | 'product_name'
  ) => {
    // Clear existing timeout
    if (translationTimeout) {
      clearTimeout(translationTimeout);
    }

    // Don't translate if text is empty or too short
    if (!text || text.length < 2) {
      return;
    }

    // Set new timeout for debounced translation
    const timeout = setTimeout(async () => {
      try {
        const translatedText = await translate(text, targetLang, context);
        
        // Update the appropriate field based on what we're translating
        if (fromField.includes('storeName')) {
          setStoreData(prev => ({ ...prev, [toField]: translatedText }));
        } else if (fromField.includes('description')) {
          setStoreData(prev => ({ ...prev, [toField]: translatedText }));
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    }, 500); // 500ms debounce

    setTranslationTimeout(timeout);
  };

  // Image management functions
  const addManagedImage = (image: ManagedImage) => {
    setManagedImages(prev => [...prev, image]);
  };

  const updateManagedImage = (imageId: string, updates: Partial<ManagedImage>) => {
    setManagedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  const removeManagedImage = (imageId: string) => {
    setManagedImages(prev => prev.filter(img => img.id !== imageId));
    
    // Also remove from store data or products
    const image = managedImages.find(img => img.id === imageId);
    if (image) {
      if (image.type === 'logo') {
        setStoreData(prev => ({ ...prev, logo: null }));
      } else if (image.type === 'banner') {
        setStoreData(prev => ({ ...prev, banner: null }));
      } else if (image.type === 'product' && image.productId) {
        setProducts(prev => prev.map(p => 
          p.id === image.productId ? { ...p, image: null } : p
        ));
      }
    }
  };

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Basic Information', description: 'Store name and category', icon: 'fa-store' },
    { id: 2, title: 'Branding', description: 'Logo and banner images', icon: 'fa-palette' },
    { id: 3, title: 'Store Details', description: 'Contact and delivery info', icon: 'fa-info-circle' },
    { id: 4, title: 'Add Products', description: 'Your product catalog', icon: 'fa-box' },
    { id: 5, title: 'Review & Launch', description: 'Final review', icon: 'fa-rocket' },
  ];

  // AI Assistant messages
  const getAIMessage = (step: number) => {
    const messages: Record<number, string> = {
      1: "Great! Let's start with your store name. Choose something memorable that reflects your brand. You can add both English and Hebrew names.",
      2: "Time to make your store visually appealing! Upload a square logo (1:1 ratio) and a wide banner (3:1 ratio). I'll help you crop them perfectly!",
      3: "Almost there! Add your contact details and delivery options. This helps customers know how to reach you and receive their orders.",
      4: "Now for the exciting part - your products! You can add them one by one or import multiple products at once. I'll ensure all images are properly sized.",
      5: "Excellent work! Review everything and make sure it looks perfect. Once you're ready, launch your store and start selling! Yah Khai!"
    };
    return messages[step] || "I'm here to help!";
  };

  // Update AI message when step changes
  React.useEffect(() => {
    setAiMessage(getAIMessage(currentStep));
  }, [currentStep]);

  // Handle file selection with automatic processing
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'product', productId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setAiMessage(`📸 File too large! I'll help you compress it. Images should be under ${MAX_FILE_SIZE / 1024 / 1024}MB for fast loading.`);
      // Continue processing anyway, we'll compress it
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create managed image entry
    const imageId = `${type}-${Date.now()}`;
    const newImage: ManagedImage = {
      id: imageId,
      type,
      productId,
      originalUrl: '',
      status: 'uploading',
    };

    addManagedImage(newImage);
    setProcessingImage(true);
    setAiMessage(`🎨 Processing your ${type} image... I'll make sure it's the perfect size and format!`);

    // Read file and process
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      
      try {
        // Update with original URL
        updateManagedImage(imageId, { 
          originalUrl: imageData,
          status: 'processing'
        });

        // Process image client-side first for preview
        const processedData = await processImageClientSide(
          imageData,
          type === 'banner' ? { width: BANNER_WIDTH, height: BANNER_HEIGHT } : { width: type === 'logo' ? LOGO_SIZE : PRODUCT_SIZE, height: type === 'logo' ? LOGO_SIZE : PRODUCT_SIZE }
        );

        updateManagedImage(imageId, { 
          status: 'cropping'
        });

        setCropperData({
          image: processedData,
          type,
          productId,
          imageId
        });
        
        setAiMessage(`✨ Perfect! Your ${type} is ready to crop. ${type === 'product' ? 'All products will be displayed as 800x800 JPEG images.' : ''}`);
      } catch (error) {
        console.error('Image processing error:', error);
        updateManagedImage(imageId, { 
          status: 'error',
          error: 'Failed to process image'
        });
        // Fallback to original image
        setCropperData({
          image: imageData,
          type,
          productId,
          imageId
        });
      } finally {
        setProcessingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle crop complete with final processing
  const handleCropComplete = async (croppedImage: string) => {
    if (!cropperData) return;

    const imageId = cropperData.imageId || `${cropperData.type}-${Date.now()}`;
    
    // Update or create managed image
    if (cropperData.imageId) {
      updateManagedImage(imageId, { 
        croppedUrl: croppedImage,
        status: 'processing'
      });
    } else {
      const newImage: ManagedImage = {
        id: imageId,
        type: cropperData.type,
        productId: cropperData.productId,
        originalUrl: croppedImage,
        croppedUrl: croppedImage,
        status: 'processing'
      };
      addManagedImage(newImage);
    }

    setProcessingImage(true);
    setAiMessage("🔧 Finalizing your image with perfect quality...");

    try {
      // Send to server for final JPEG processing
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: croppedImage,
          type: cropperData.type,
          dimensions: cropperData.type === 'banner' 
            ? { width: BANNER_WIDTH, height: BANNER_HEIGHT }
            : { width: cropperData.type === 'logo' ? LOGO_SIZE : PRODUCT_SIZE, height: cropperData.type === 'logo' ? LOGO_SIZE : PRODUCT_SIZE }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const processedImage = result.processedImage || result.image;
        
        // Update managed image
        updateManagedImage(imageId, {
          processedUrl: processedImage,
          status: 'ready',
          metadata: result.metadata
        });

        // Update store data or product
        if (cropperData.type === 'logo') {
          setStoreData({ ...storeData, logo: processedImage });
          setAiMessage("✅ Perfect! Your logo is now a crisp 800x800 JPEG. Let's add your banner next.");
        } else if (cropperData.type === 'banner') {
          setStoreData({ ...storeData, banner: processedImage });
          setAiMessage("✅ Excellent! Your banner is optimized at 1200x400. Your store is looking professional!");
        } else if (cropperData.type === 'product' && cropperData.productId) {
          // Update product image
          setProducts(products.map(p => 
            p.id === cropperData.productId ? { ...p, image: processedImage } : p
          ));
          setAiMessage("✅ Product image perfect! 800x800 JPEG format ensures fast loading and consistent display.");
          
          // Trigger AI analysis for product
          analyzeProductWithAI(processedImage, cropperData.productId);
        }
      } else {
        // Fallback to original cropped image
        updateManagedImage(imageId, {
          processedUrl: croppedImage,
          status: 'ready',
          error: 'Server processing failed, using client-side image'
        });

        if (cropperData.type === 'logo') {
          setStoreData({ ...storeData, logo: croppedImage });
          setAiMessage("✅ Logo saved! Note: For best results, use 800x800 JPEG images.");
        } else if (cropperData.type === 'banner') {
          setStoreData({ ...storeData, banner: croppedImage });
          setAiMessage("✅ Banner saved! Note: Optimal size is 1200x400 pixels.");
        } else if (cropperData.type === 'product' && cropperData.productId) {
          setProducts(products.map(p => 
            p.id === cropperData.productId ? { ...p, image: croppedImage } : p
          ));
          setAiMessage("✅ Product image saved!");
        }
      }
    } catch (error) {
      console.error('Image processing error:', error);
      // Use original image as fallback
      updateManagedImage(imageId, {
        processedUrl: croppedImage,
        status: 'error',
        error: 'Failed to process image'
      });

      if (cropperData.type === 'logo') {
        setStoreData({ ...storeData, logo: croppedImage });
      } else if (cropperData.type === 'banner') {
        setStoreData({ ...storeData, banner: croppedImage });
      } else if (cropperData.type === 'product' && cropperData.productId) {
        setProducts(products.map(p => 
          p.id === cropperData.productId ? { ...p, image: croppedImage } : p
        ));
      }
    } finally {
      setProcessingImage(false);
      setCropperData(null);
    }
  };

  // Image management handlers
  const handleEditImage = (imageId: string) => {
    const image = managedImages.find(img => img.id === imageId);
    if (!image) return;

    setCropperData({
      image: image.originalUrl,
      type: image.type,
      productId: image.productId,
      imageId: image.id
    });
  };

  const handleRemoveImage = (imageId: string) => {
    removeManagedImage(imageId);
    setAiMessage("Image removed. You can upload a new one anytime.");
  };

  const handleRetryImage = (imageId: string) => {
    const image = managedImages.find(img => img.id === imageId);
    if (!image || !image.croppedUrl) return;

    // Retry processing
    handleCropComplete(image.croppedUrl);
  };

  // Analyze product image with Vision AI
  const analyzeProductWithAI = async (imageData: string, productId: string) => {
    try {
      // Set analyzing state
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isAnalyzing: true } : p
      ));
      setAiMessage("🤖 Analyzing your product with AI... This will enhance the name, description, and check VOP compliance!");
      
      // Find the current product data
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;
      
      // Call Vision AI analyzer
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
              image: imageData,
              isAnalyzing: false,
              aiEnhanced: true
            };
          }
          return p;
        }));
        
        // Provide feedback based on analysis
        if (enhanced.vopCompliance?.isCompliant) {
          setAiMessage(`✅ Product analyzed! "${enhanced.name}" is VOP compliant. We've enhanced the description and suggested a price of ₪${enhanced.pricing?.suggested}. Feel free to adjust as needed!`);
        } else {
          const issues = enhanced.vopCompliance?.issues?.join(', ') || 'compliance issues';
          setAiMessage(`⚠️ Product analyzed: "${enhanced.name}". Note: ${issues}. Please ensure this product meets VOP dietary guidelines.`);
        }
      } else {
        // Remove analyzing state even if analysis failed
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isAnalyzing: false } : p
        ));
        setAiMessage("Product image uploaded! You can manually enter the product details.");
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Remove analyzing state on error
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isAnalyzing: false } : p
      ));
      setAiMessage("Product image uploaded! AI enhancement unavailable, but you can enter details manually.");
    }
  };

  // Add new product
  const addProduct = () => {
    const newProduct: Product = {
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

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
    
    // Auto-translate product names
    if (updates.name && !updates.nameHe) {
      const timeout = setTimeout(async () => {
        try {
          const translatedName = await translate(updates.name!, 'he', 'product_name');
          setProducts(prev => prev.map(p => 
            p.id === id ? { ...p, nameHe: translatedName } : p
          ));
        } catch (error) {
          console.error('Product translation error:', error);
        }
      }, 500);
    } else if (updates.nameHe && !updates.name) {
      const timeout = setTimeout(async () => {
        try {
          const translatedName = await translate(updates.nameHe!, 'en', 'product_name');
          setProducts(prev => prev.map(p => 
            p.id === id ? { ...p, name: translatedName } : p
          ));
        } catch (error) {
          console.error('Product translation error:', error);
        }
      }, 500);
    }
  };

  // Remove product
  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    // Also remove associated images
    setManagedImages(prev => prev.filter(img => img.productId !== id));
  };

  // Validate current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return storeData.storeName && storeData.category;
      case 2:
        return storeData.logo && storeData.banner;
      case 3:
        return storeData.phone && storeData.email && storeData.address;
      case 4:
        return products.length > 0 && products.every(p => p.name && p.price && p.image);
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    console.log('Store data:', storeData);
    console.log('Products:', products);
    
    try {
      // Prepare the complete form data
      const formData = {
        ...storeData,
        products: products,
        policies: {
          returnPolicy: '30-day return policy for all items',
          shippingPolicy: 'Free shipping on orders over ₪100',
          privacyPolicy: 'We respect your privacy and protect your data'
        }
      };
      
      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store vendor ID and data for future use
        localStorage.setItem('vendorId', result.vendorId);
        localStorage.setItem(`vendor_${result.vendorId}`, JSON.stringify(formData));
        
        // Show success message
        setAiMessage("🎉 Congratulations! Your store is now live on KiFar Marketplace. HalleluYah! Redirecting to your new store page...");
        
        // Redirect to the new store page after delay
        setTimeout(() => {
          router.push(`/store/${result.vendorId}`);
        }, 3000);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex kfar-bg-cream">
      {/* AI Assistant Sidebar */}
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
              <Image
                src="/images/logos/kfar_logo_white_on_green.png"
                alt="KFAR"
                width={120}
                height={30}
                className="h-8 w-auto mb-4 opacity-90"
              />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-xl"></i>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold">AI Assistant</h3>
                  <p className="text-body-sm opacity-80">Your onboarding guide</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-body-sm leading-relaxed">{aiMessage}</p>
            </div>

            {/* Quick Tips */}
            <div className="space-y-4">
              <h4 className="text-h6 font-semibold">Quick Tips:</h4>
              {currentStep === 1 && (
                <ul className="text-body-sm space-y-2 opacity-90">
                  <li>• Choose a unique store name</li>
                  <li>• Add Hebrew translation for local customers</li>
                  <li>• Select the most relevant category</li>
                </ul>
              )}
              {currentStep === 2 && (
                <ul className="text-body-sm space-y-2 opacity-90">
                  <li>• Logo: 800x800 pixels (auto-converted to JPEG)</li>
                  <li>• Banner: 1200x400 pixels (landscape format)</li>
                  <li>• All images automatically processed</li>
                  <li>• No distortion - smart cropping applied</li>
                  <li>• PNG transparency converted to white</li>
                </ul>
              )}
              {currentStep === 3 && (
                <ul className="text-body-sm space-y-2 opacity-90">
                  <li>• Provide accurate contact info</li>
                  <li>• Set realistic delivery options</li>
                  <li>• Configure your business hours</li>
                </ul>
              )}
              {currentStep === 4 && (
                <ul className="text-body-sm space-y-2 opacity-90">
                  <li>• Product images: 800x800 JPEG</li>
                  <li>• AI analyzes images for better descriptions</li>
                  <li>• Names auto-translate English ↔ Hebrew</li>
                  <li>• Set competitive prices in ₪</li>
                  <li>• Mark vegan/kosher options</li>
                </ul>
              )}
            </div>

            {/* Progress */}
            <div className="mt-8">
              <h4 className="text-h6 font-semibold mb-3">Your Progress</h4>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > step.id ? 'bg-white kfar-text-leaf-green' :
                      currentStep === step.id ? 'bg-white/20 text-white border-2 border-white' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {currentStep > step.id ? <i className="fas fa-check"></i> : step.id}
                    </div>
                    <span className={`text-body-sm ${currentStep >= step.id ? 'opacity-100' : 'opacity-60'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile AI Assistant Button */}
      <button
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-leaf-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-leaf-green-dark transition-colors"
      >
        <i className={`fas fa-${showAIAssistant ? 'times' : 'robot'} text-xl`}></i>
      </button>

      {/* Mobile AI Assistant Modal */}
      {showAIAssistant && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowAIAssistant(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-leaf-green to-leaf-green-dark text-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <Image
                src="/images/logos/kfar_logo_white_on_green.png"
                alt="KFAR"
                width={120}
                height={30}
                className="h-8 w-auto mb-4 opacity-90"
              />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-xl"></i>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold">AI Assistant</h3>
                  <p className="text-body-sm opacity-80">Your onboarding guide</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-body-sm leading-relaxed">{aiMessage}</p>
            </div>
            
            {/* Quick Tips */}
            <div className="space-y-4">
              <h4 className="text-h6 font-semibold">Quick Tips:</h4>
              {currentStep === 1 && (
                <ul className="text-body-sm space-y-2 opacity-90">
                  <li>• Choose a unique store name</li>
                  <li>• Add Hebrew translation for local customers</li>
                  <li>• Select the most relevant category</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white kfar-shadow-md px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <Image
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR Marketplace"
                width={180}
                height={45}
                className="h-8 sm:h-10 lg:h-12 w-auto"
              />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-h1 kfar-text-soil">
                  Welcome to KFAR Marketplace!
                </h1>
                <p className="text-sm sm:text-base lg:text-body-lg kfar-text-gray-600 mt-1 sm:mt-2">Let's set up your store in just a few minutes</p>
              </div>
            </div>
            <Link href="/">
              <button className="kfar-text-gray-600 hover:kfar-text-gray-800">
                <i className="fas fa-times text-xl"></i>
              </button>
            </Link>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? 'kfar-bg-leaf-green text-white kfar-shadow-lg'
                      : 'kfar-bg-gray-200 kfar-text-gray-500'
                  }`}>
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <span className={`mt-2 text-body-sm font-medium ${
                    currentStep >= step.id ? 'kfar-text-leaf-green' : 'kfar-text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'kfar-bg-leaf-green' : 'kfar-bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <div className="card fade-in">
                <h2 className="text-h2 mb-6 kfar-text-soil">
                  Basic Store Information
                </h2>
                
                {/* Auto-translation notice */}
                <div className="mb-6 p-4 rounded-lg kfar-bg-herbal-mint/20 border border-leaf-green/20">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-language text-leaf-green text-xl"></i>
                    <p className="text-body-sm">
                      <strong>Auto-Translation Active:</strong> Type in English or Hebrew, and we'll automatically translate to the other language for you!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Store Name (English) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={storeData.storeName}
                        onChange={(e) => {
                          setStoreData({ ...storeData, storeName: e.target.value });
                          // Auto-translate to Hebrew
                          handleAutoTranslate(e.target.value, 'storeName', 'storeNameHe', 'he', 'store_name');
                        }}
                        placeholder="e.g., Sarah's Vegan Delights"
                        className="input"
                      />
                      {isTranslating && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <i className="fas fa-language text-leaf-green animate-pulse"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Store Name (Hebrew)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={storeData.storeNameHe}
                        onChange={(e) => {
                          setStoreData({ ...storeData, storeNameHe: e.target.value });
                          // Auto-translate to English
                          handleAutoTranslate(e.target.value, 'storeNameHe', 'storeName', 'en', 'store_name');
                        }}
                        placeholder="שם החנות בעברית"
                        className="input text-right"
                        dir="rtl"
                      />
                      {isTranslating && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <i className="fas fa-language text-leaf-green animate-pulse"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Store Category *
                    </label>
                    <select
                      value={storeData.category}
                      onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
                      className="input"
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

                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Brief Description (English)
                    </label>
                    <div className="relative">
                      <textarea
                        value={storeData.description}
                        onChange={(e) => {
                          setStoreData({ ...storeData, description: e.target.value });
                          // Auto-translate to Hebrew
                          handleAutoTranslate(e.target.value, 'description', 'descriptionHe', 'he', 'description');
                        }}
                        placeholder="Tell customers what makes your store special..."
                        rows={3}
                        className="input"
                      />
                      {isTranslating && (
                        <div className="absolute right-3 top-3">
                          <i className="fas fa-language text-leaf-green animate-pulse"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Brief Description (Hebrew)
                    </label>
                    <div className="relative">
                      <textarea
                        value={storeData.descriptionHe}
                        onChange={(e) => {
                          setStoreData({ ...storeData, descriptionHe: e.target.value });
                          // Auto-translate to English
                          handleAutoTranslate(e.target.value, 'descriptionHe', 'description', 'en', 'description');
                        }}
                        placeholder="תיאור קצר בעברית..."
                        rows={3}
                        className="input text-right"
                        dir="rtl"
                      />
                      {isTranslating && (
                        <div className="absolute left-3 top-3">
                          <i className="fas fa-language text-leaf-green animate-pulse"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="card fade-in">
                <h2 className="text-h2 mb-6 kfar-text-soil">
                  Store Branding
                </h2>

                {/* Image Guidelines Button */}
                <div className="mb-6 p-4 rounded-lg kfar-bg-herbal-mint/20 border border-leaf-green/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-camera text-leaf-green text-xl"></i>
                      <div>
                        <p className="text-body-sm font-semibold">
                          Image Requirements
                        </p>
                        <p className="text-caption kfar-text-gray-600">
                          Logo: 800x800 JPEG • Banner: 1200x400 JPEG • All images auto-processed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowImageGuidelines(!showImageGuidelines)}
                      className="btn btn-sm kfar-bg-leaf-green text-white hover:kfar-bg-leaf-green-dark"
                    >
                      <i className={`fas fa-${showImageGuidelines ? 'times' : 'info-circle'} mr-2`}></i>
                      {showImageGuidelines ? 'Hide' : 'View'} Guidelines
                    </button>
                  </div>
                </div>

                {/* Image Guidelines Component */}
                {showImageGuidelines && (
                  <div className="mb-6">
                    <ImageGuidelines />
                  </div>
                )}

                {/* Image Manager for branding images */}
                {managedImages.filter(img => img.type === 'logo' || img.type === 'banner').length > 0 && (
                  <div className="mb-6">
                    <ImageManager
                      images={managedImages.filter(img => img.type === 'logo' || img.type === 'banner')}
                      onEdit={handleEditImage}
                      onRemove={handleRemoveImage}
                      onRetry={handleRetryImage}
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div>
                    <h3 className="text-h4 font-semibold mb-4">Store Logo</h3>
                    <div className="relative">
                      {storeData.logo ? (
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                          <Image
                            src={storeData.logo}
                            alt="Store logo"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const logoImage = managedImages.find(img => img.type === 'logo');
                              if (logoImage) {
                                handleRemoveImage(logoImage.id);
                              }
                              setStoreData({ ...storeData, logo: null });
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 kfar-bg-earth-flame text-white rounded-full flex items-center justify-center hover:kfar-bg-earth-flame-dark"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <label className="w-32 h-32 sm:w-40 sm:h-40 mx-auto border-2 border-dashed kfar-border-leaf-green rounded-lg flex flex-col items-center justify-center cursor-pointer hover:kfar-bg-gray-50 transition-colors">
                          <i className="fas fa-camera text-3xl mb-2 kfar-text-leaf-green"></i>
                          <span className="text-body-sm kfar-text-gray-600">Upload Logo</span>
                          <span className="text-caption kfar-text-gray-500 mt-1">800x800 JPEG</span>
                          {processingImage && (
                            <div className="mt-2">
                              <i className="fas fa-spinner fa-spin text-leaf-green"></i>
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileSelect(e, 'logo')}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <h3 className="text-h4 font-semibold mb-4">Store Banner</h3>
                    <p className="text-body-sm kfar-text-gray-600 mb-3">
                      Upload your banner or use our professional default design
                    </p>
                    <div className="relative">
                      {storeData.banner ? (
                        <div className="relative w-full h-24 sm:h-32">
                          <Image
                            src={storeData.banner}
                            alt="Store banner"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const bannerImage = managedImages.find(img => img.type === 'banner');
                              if (bannerImage) {
                                handleRemoveImage(bannerImage.id);
                              }
                              setStoreData({ ...storeData, banner: null });
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 kfar-bg-earth-flame text-white rounded-full flex items-center justify-center hover:kfar-bg-earth-flame-dark"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-24 sm:h-32 border-2 border-dashed kfar-border-leaf-green rounded-lg flex flex-col items-center justify-center cursor-pointer hover:kfar-bg-gray-50 transition-colors">
                          <i className="fas fa-image text-3xl mb-2 kfar-text-leaf-green"></i>
                          <span className="text-body-sm kfar-text-gray-600">Upload Banner</span>
                          <span className="text-caption kfar-text-gray-500 mt-1">1200x400 JPEG</span>
                          {processingImage && (
                            <div className="mt-2">
                              <i className="fas fa-spinner fa-spin text-leaf-green"></i>
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileSelect(e, 'banner')}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    {/* Use Default Banner Option */}
                    {!storeData.banner && (
                      <button
                        onClick={() => setStoreData({ ...storeData, banner: '/images/default-store-banner.svg' })}
                        className="mt-3 w-full py-2 px-4 border-2 border-leaf-green/20 rounded-lg text-body-sm kfar-text-leaf-green hover:kfar-bg-leaf-green/10 transition-colors"
                      >
                        <i className="fas fa-magic mr-2"></i>
                        Use Professional Default Banner
                      </button>
                    )}
                  </div>
                </div>

                {/* Brand Colors Preview */}
                <div className="mt-8 p-6 rounded-lg kfar-bg-cream cultural-pattern relative">
                  <div className="relative z-10">
                    <h3 className="text-h5 font-semibold mb-4">Your Store Preview</h3>
                    <div className="bg-white rounded-lg kfar-shadow-sm p-4">
                      <div className="flex items-center gap-4 mb-3">
                        {storeData.logo && (
                          <div className="relative w-12 h-12">
                            <Image
                              src={storeData.logo}
                              alt="Logo preview"
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-h5 font-bold">{storeData.storeName || 'Your Store Name'}</h4>
                          <p className="text-body-sm kfar-text-gray-600">{storeData.description || 'Your store description'}</p>
                        </div>
                      </div>
                      {storeData.banner && (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden">
                          <Image
                            src={storeData.banner}
                            alt="Banner preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Store Details */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto">
              <div className="card fade-in">
                <h2 className="text-h2 mb-6 kfar-text-soil">
                  Contact & Delivery Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={storeData.phone}
                      onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                      placeholder="+972-XX-XXX-XXXX"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={storeData.email}
                      onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                      placeholder="store@example.com"
                      className="input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-body font-medium kfar-text-gray-700 mb-2">
                      Store Address *
                    </label>
                    <input
                      type="text"
                      value={storeData.address}
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      placeholder="Village of Peace, Dimona, Israel"
                      className="input"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mt-8">
                  <h3 className="text-h4 font-semibold mb-4">Delivery Options</h3>
                  <div className="space-y-3">
                    {['pickup', 'local-delivery', 'shipping'].map((option) => (
                      <label key={option} className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:kfar-border-leaf-green transition-colors">
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
                          className="w-5 h-5 kfar-text-leaf-green rounded focus-visible"
                        />
                        <div>
                          <p className="text-body font-medium">
                            {option === 'pickup' && 'Store Pickup'}
                            {option === 'local-delivery' && 'Local Delivery (Dimona area)'}
                            {option === 'shipping' && 'Nationwide Shipping'}
                          </p>
                          <p className="text-body-sm kfar-text-gray-600">
                            {option === 'pickup' && 'Customers can pick up orders from your location'}
                            {option === 'local-delivery' && 'Deliver within Dimona and nearby areas'}
                            {option === 'shipping' && 'Ship products throughout Israel'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-8">
                  <h3 className="text-h4 font-semibold mb-4">Business Hours</h3>
                  <div className="space-y-3">
                    {Object.entries(storeData.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-body font-medium capitalize w-28">{day}</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => setStoreData({
                              ...storeData,
                              businessHours: {
                                ...storeData.businessHours,
                                [day]: { ...hours, closed: !e.target.checked }
                              }
                            })}
                            className="w-5 h-5 kfar-text-leaf-green rounded focus-visible"
                          />
                          {!hours.closed && (
                            <>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => setStoreData({
                                  ...storeData,
                                  businessHours: {
                                    ...storeData.businessHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                className="px-3 py-1 border rounded focus-visible"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => setStoreData({
                                  ...storeData,
                                  businessHours: {
                                    ...storeData.businessHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                className="px-3 py-1 border rounded focus-visible"
                              />
                            </>
                          )}
                          {hours.closed && <span className="kfar-text-gray-500">Closed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Add Products */}
          {currentStep === 4 && (
            <div className="max-w-6xl mx-auto">
              <div className="card fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h2 kfar-text-soil">
                    Add Your Products
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBulkImportMode(!bulkImportMode)}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-file-import mr-2"></i>
                      {bulkImportMode ? 'Single Add' : 'Bulk Import'}
                    </button>
                    <button
                      onClick={addProduct}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Product Image Manager */}
                {managedImages.filter(img => img.type === 'product').length > 0 && (
                  <div className="mb-6">
                    <ImageManager
                      images={managedImages.filter(img => img.type === 'product')}
                      onEdit={handleEditImage}
                      onRemove={handleRemoveImage}
                      onRetry={handleRetryImage}
                    />
                  </div>
                )}

                {bulkImportMode ? (
                  <div className="text-center py-12">
                    <i className="fas fa-file-csv text-6xl mb-4 kfar-text-leaf-green"></i>
                    <p className="text-h4 mb-4">Upload a CSV file with your products</p>
                    <p className="text-body kfar-text-gray-600 mb-6">
                      File should include: Name, Name (Hebrew), Description, Price, Category
                    </p>
                    <button className="btn btn-primary">
                      <i className="fas fa-upload mr-2"></i>
                      Choose CSV File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <div className="text-center py-12 kfar-text-gray-500">
                        <i className="fas fa-box-open text-4xl mb-4"></i>
                        <p className="text-body">No products added yet. Click "Add Product" to start!</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className={`border-2 rounded-lg p-6 transition-all relative ${
                          product.isAnalyzing ? 'kfar-border-sun-gold' : 
                          product.aiEnhanced ? 'kfar-border-leaf-green' : 
                          'hover:kfar-border-leaf-green'
                        }`}>
                          {/* AI Status Badge */}
                          {(product.isAnalyzing || product.aiEnhanced) && (
                            <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                              product.isAnalyzing ? 'kfar-bg-sun-gold text-white' : 'kfar-bg-leaf-green text-white'
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
                          
                          <div className="grid md:grid-cols-4 gap-4">
                            {/* Product Image */}
                            <div>
                              {product.image ? (
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                                  <Image
                                    src={product.image}
                                    alt={product.name || "Image"}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                  {product.isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                      <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      updateProduct(product.id, { image: null, aiEnhanced: false });
                                      // Remove associated managed image
                                      const productImage = managedImages.find(img => img.productId === product.id);
                                      if (productImage) {
                                        handleRemoveImage(productImage.id);
                                      }
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 kfar-bg-earth-flame text-white rounded-full flex items-center justify-center hover:kfar-bg-earth-flame-dark text-xs"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ) : (
                                <label className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed kfar-border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:kfar-border-leaf-green transition-colors">
                                  <i className="fas fa-camera text-2xl kfar-text-gray-400 mb-1"></i>
                                  <span className="text-caption kfar-text-gray-500">800x800</span>
                                  {processingImage && (
                                    <i className="fas fa-spinner fa-spin text-leaf-green text-sm mt-1"></i>
                                  )}
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileSelect(e, 'product', product.id)}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="md:col-span-3 grid md:grid-cols-2 gap-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                                  placeholder="Product Name (English)"
                                  className={`input ${product.isAnalyzing ? 'opacity-50' : ''}`}
                                  disabled={product.isAnalyzing}
                                />
                                {isTranslating && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <i className="fas fa-language text-leaf-green animate-pulse text-sm"></i>
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={product.nameHe}
                                  onChange={(e) => updateProduct(product.id, { nameHe: e.target.value })}
                                  placeholder="שם המוצר (עברית)"
                                  className={`input text-right ${product.isAnalyzing ? 'opacity-50' : ''}`}
                                  disabled={product.isAnalyzing}
                                  dir="rtl"
                                />
                                {isTranslating && (
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <i className="fas fa-language text-leaf-green animate-pulse text-sm"></i>
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <textarea
                                  value={product.description}
                                  onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                                  placeholder="Product description..."
                                  rows={2}
                                  className={`input ${product.isAnalyzing ? 'opacity-50' : ''}`}
                                  disabled={product.isAnalyzing}
                                />
                              </div>
                              <div>
                                <div className="flex gap-2">
                                  <span className="px-3 py-2 kfar-bg-gray-100 rounded-l-lg">₪</span>
                                  <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                                    placeholder="Price"
                                    className={`input rounded-l-none ${product.isAnalyzing ? 'opacity-50' : ''}`}
                                    disabled={product.isAnalyzing}
                                  />
                                </div>
                              </div>
                              <div>
                                <select
                                  value={product.category}
                                  onChange={(e) => updateProduct(product.id, { category: e.target.value })}
                                  className={`input ${product.isAnalyzing ? 'opacity-50' : ''}`}
                                  disabled={product.isAnalyzing}
                                >
                                  <option value="">Select Category</option>
                                  <option value="main">Main Dishes</option>
                                  <option value="desserts">Desserts</option>
                                  <option value="beverages">Beverages</option>
                                  <option value="snacks">Snacks</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="md:col-span-2 flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={product.isVegan}
                                    onChange={(e) => updateProduct(product.id, { isVegan: e.target.checked })}
                                    className="w-4 h-4 kfar-text-leaf-green rounded focus-visible"
                                  />
                                  <span className="text-body-sm">Vegan</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={product.isKosher}
                                    onChange={(e) => updateProduct(product.id, { isKosher: e.target.checked })}
                                    className="w-4 h-4 kfar-text-leaf-green rounded focus-visible"
                                  />
                                  <span className="text-body-sm">Kosher</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={product.inStock}
                                    onChange={(e) => updateProduct(product.id, { inStock: e.target.checked })}
                                    className="w-4 h-4 kfar-text-leaf-green rounded focus-visible"
                                  />
                                  <span className="text-body-sm">In Stock</span>
                                </label>
                                <button
                                  onClick={() => removeProduct(product.id)}
                                  className="ml-auto kfar-text-earth-flame hover:kfar-text-earth-flame-dark"
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
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Launch */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto">
              <div className="card fade-in">
                <h2 className="text-h2 mb-6 kfar-text-soil">
                  Review Your Store
                </h2>

                {/* Store Preview */}
                <div className="mb-8">
                  <h3 className="text-h3 font-semibold mb-4">Store Preview</h3>
                  <div className="border-2 rounded-lg overflow-hidden">
                    {storeData.banner && (
                      <div className="relative h-48">
                        <Image
                          src={storeData.banner}
                          alt="Store banner"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 flex items-center gap-4">
                          {storeData.logo && (
                            <div className="relative w-20 h-20 bg-white rounded-full p-1">
                              <Image
                                src={storeData.logo}
                                alt="Store logo"
                                fill
                                className="object-cover rounded-full"
                              />
                            </div>
                          )}
                          <div className="text-white">
                            <h3 className="text-h3 font-bold">{storeData.storeName}</h3>
                            <p className="opacity-90">{storeData.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-h4 font-semibold mb-3">Store Information</h3>
                    <div className="space-y-2 text-body">
                      <p><strong>Name:</strong> {storeData.storeName}</p>
                      <p><strong>Category:</strong> {storeData.category}</p>
                      <p><strong>Phone:</strong> {storeData.phone}</p>
                      <p><strong>Email:</strong> {storeData.email}</p>
                      <p><strong>Address:</strong> {storeData.address}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-h4 font-semibold mb-3">Store Stats</h3>
                    <div className="space-y-2 text-body">
                      <p><strong>Products:</strong> {products.length}</p>
                      <p><strong>Delivery Options:</strong> {storeData.deliveryOptions.length}</p>
                      <p><strong>Business Days:</strong> {Object.values(storeData.businessHours).filter(h => !h.closed).length} days/week</p>
                      <p><strong>Images Uploaded:</strong> {managedImages.filter(img => img.status === 'ready').length}</p>
                    </div>
                  </div>
                </div>

                {/* All Images Summary */}
                {managedImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-h4 font-semibold mb-3">All Uploaded Images</h3>
                    <ImageManager
                      images={managedImages}
                      onEdit={handleEditImage}
                      onRemove={handleRemoveImage}
                      onRetry={handleRetryImage}
                    />
                  </div>
                )}

                {/* Launch Button */}
                <div className="text-center p-8 rounded-lg kfar-bg-cream cultural-pattern relative">
                  <div className="relative z-10">
                    <i className="fas fa-rocket text-6xl mb-4 kfar-text-leaf-green pulse"></i>
                    <h3 className="text-h2 font-bold mb-2">Ready to Launch!</h3>
                    <p className="text-body-lg kfar-text-gray-600 mb-6">
                      Your store is ready to go live. Once launched, you can manage everything from your vendor dashboard.
                    </p>
                    <div className="heritage-badge mb-6">
                      <i className="fas fa-star"></i>
                      Village of Peace Marketplace
                    </div>
                    <button
                      onClick={completeOnboarding}
                      className="btn btn-primary text-h5 px-8 py-4 kfar-shadow-xl"
                    >
                      <i className="fas fa-rocket mr-2"></i>
                      Launch My Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 max-w-4xl mx-auto">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn btn-outline"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
            )}
            {currentStep < 5 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className={`ml-auto ${
                  isStepValid()
                    ? 'btn btn-primary'
                    : 'btn kfar-bg-gray-300 kfar-text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Image Cropper Modal */}
      {cropperData && (
        <ImageCropper
          image={cropperData.image}
          aspectRatio={
            cropperData.type === 'banner' ? BANNER_ASPECT_RATIO : 
            cropperData.type === 'logo' ? LOGO_ASPECT_RATIO : 
            PRODUCT_ASPECT_RATIO
          }
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperData(null)}
        />
      )}
    </div>
  );
}