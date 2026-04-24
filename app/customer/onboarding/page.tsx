'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  User, 
  Camera, 
  Globe, 
  ShoppingBag,
  MapPin,
  Check,
  QrCode,
  Download,
  Share2
} from 'lucide-react';
import SafeQR from '@/components/qr/SafeQR';
// customerAuth removed - using API route directly

interface OnboardingStep {
  id: string;
  title: string;
  icon: React.ElementType;
}

const steps: OnboardingStep[] = [
  { id: 'phone', title: 'Quick Start', icon: Phone },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'preferences', title: 'Preferences', icon: Globe },
  { id: 'complete', title: 'Your QR Code', icon: QrCode }
];

export default function CustomerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    avatar: null as File | null,
    language: 'he',
    currency: 'ILS',
    dietary: [] as string[],
    address: {
      street: '',
      city: '',
      postalCode: ''
    }
  });
  const [qrCode, setQrCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call customer onboarding API
      const response = await fetch('/api/customer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          name: formData.name,
          email: formData.email,
          language: formData.language,
          currency: formData.currency,
          dietary: formData.dietary,
          address: formData.address.street ? formData.address : undefined
        })
      });
      const result = await response.json();

      if (result.success && result.customer) {
        setQrCode(result.customer.qrCode);
        setCustomerId(result.customerId);

        // Store in localStorage for session
        localStorage.setItem('customerId', result.customerId);
        localStorage.setItem('userRole', 'customer');
        localStorage.setItem('customerName', formData.name);
        localStorage.setItem('customerQR', result.customer.qrCode);

        setCurrentStep(1);
      } else {
        const errorMessage = result.error || 'Could not connect to database';
        alert(`Failed to create customer account: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleComplete = () => {
    router.push('/customer/dashboard');
  };

  const downloadQR = () => {
    // In production, implement QR download
    console.log('Downloading QR code...');
  };

  const shareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My KFAR QR Code',
        text: 'Scan this code at any KFAR shop for instant access!',
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${
                        index <= currentStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }
                    `}
                  >
                    {index < currentStep ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <h2 className="text-2xl font-bold text-center" style={{ color: '#3a3a1d' }}>
            {steps[currentStep].title}
          </h2>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 0 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="054-123-4567"
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#478c0b', color: 'white' }}
              >
                Get Started
              </button>

              <p className="text-center text-sm text-gray-600">
                Join instantly and earn 500 welcome points!
              </p>
            </form>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    {formData.avatar ? (
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({ ...formData, avatar: e.target.files[0] });
                      }
                    }}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#478c0b', color: 'white' }}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                  >
                    <option value="he">עברית</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                  >
                    <option value="ILS">₪ ILS</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dietary Preferences
                </label>
                <div className="space-y-2">
                  {['Kosher', 'Vegetarian', 'Vegan', 'Gluten-Free'].map((diet) => (
                    <label key={diet} className="flex items-center">
                      <input
                        type="checkbox"
                        value={diet.toLowerCase()}
                        checked={formData.dietary.includes(diet.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              dietary: [...formData.dietary, diet.toLowerCase()]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              dietary: formData.dietary.filter(d => d !== diet.toLowerCase())
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      {diet}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#478c0b', color: 'white' }}
                >
                  Complete Setup
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="inline-block p-8 bg-gray-50 rounded-lg">
                <SafeQR value={qrCode} size={200} />
              </div>

              <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                Welcome to KFAR!
              </h3>

              <p className="text-gray-600">
                Your unique QR code is ready. Show this at any KFAR shop for instant access to your account and rewards.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  🎉 You earned 500 welcome points!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <Download className="h-5 w-5" />
                  Download QR
                </button>
                <button
                  onClick={shareQR}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#478c0b', color: 'white' }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
