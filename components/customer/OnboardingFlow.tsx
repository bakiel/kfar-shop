'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import CustomerQRCode from './CustomerQRCode';
import Image from 'next/image';

interface OnboardingFlowProps {
  onComplete?: (customerProfile: any) => void;
  className?: string;
}

export default function OnboardingFlow({ onComplete, className = '' }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null as File | null,
    avatarPreview: '',
    dietary_restrictions: [] as string[],
    shopping_frequency: 'weekly',
    location: '',
    language_preference: 'en',
    marketing_consent: true
  });

  const dietaryOptions = [
    { id: 'vegan', label: '🌱 Vegan', description: 'No animal products' },
    { id: 'gluten-free', label: '🌾 Gluten-Free', description: 'No gluten' },
    { id: 'organic', label: '🌿 Organic Only', description: 'Certified organic' },
    { id: 'raw', label: '🥬 Raw Food', description: 'Raw and living foods' },
    { id: 'nut-free', label: '🥜 Nut-Free', description: 'No tree nuts' },
    { id: 'soy-free', label: '🌱 Soy-Free', description: 'No soy products' }
  ];

  const shoppingFrequencies = [
    { value: 'daily', label: 'Daily', icon: '🏃' },
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'bi-weekly', label: 'Bi-Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDietaryToggle = (dietId: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(dietId)
        ? prev.dietary_restrictions.filter(d => d !== dietId)
        : [...prev.dietary_restrictions, dietId]
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive"
          });
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 2:
        if (formData.dietary_restrictions.length === 0) {
          toast({
            title: "Select Preferences",
            description: "Please select at least one dietary preference",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.location) {
          toast({
            title: "Location Required",
            description: "Please select your location",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('dietary_restrictions', JSON.stringify(formData.dietary_restrictions));
      submitData.append('preferences', JSON.stringify({
        favoriteCategories: [],
        shoppingFrequency: formData.shopping_frequency,
        dietaryRestrictions: formData.dietary_restrictions
      }));
      submitData.append('location', formData.location);
      submitData.append('language_preference', formData.language_preference);
      submitData.append('marketing_consent', formData.marketing_consent.toString());
      
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      // Create customer profile
      const response = await fetch('/api/customers/onboard', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const data = await response.json();
      setCustomerProfile(data.customer);
      setCurrentStep(4); // Move to completion step

      toast({
        title: "Welcome to KFAR!",
        description: "Your profile has been created successfully",
      });

      // Trigger onComplete callback if provided
      if (onComplete) {
        onComplete(data.customer);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Basic Info</span>
          <span>Preferences</span>
          <span>Location</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Welcome to KFAR Marketplace!
            </h2>
            <p className="text-gray-600 mb-6">
              Let's get you started with your personalized shopping experience
            </p>

            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="text-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 mx-auto mb-4 cursor-pointer group"
                >
                  {formData.avatarPreview ? (
                    <Image
                      src={formData.avatarPreview}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                      <i className="fas fa-camera text-white text-3xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="fas fa-camera text-white text-2xl" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">Click to upload photo (optional)</p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+972 50 123 4567"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Next Step
                <i className="fas fa-arrow-right ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Dietary Preferences */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Dietary Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Help us personalize your shopping experience
            </p>

            <div className="space-y-6">
              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select all that apply to you *
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {dietaryOptions.map((option) => (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDietaryToggle(option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.dietary_restrictions.includes(option.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {option.description}
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.dietary_restrictions.includes(option.id)
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.dietary_restrictions.includes(option.id) && (
                            <i className="fas fa-check text-white text-xs" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Shopping Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  How often do you shop?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {shoppingFrequencies.map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setFormData(prev => ({ ...prev, shopping_frequency: freq.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.shopping_frequency === freq.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{freq.icon}</div>
                      <div className="text-sm font-medium">{freq.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                <i className="fas fa-arrow-left mr-2" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Next Step
                <i className="fas fa-arrow-right ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Location & Preferences */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
              Almost Done!
            </h2>
            <p className="text-gray-600 mb-6">
              Just a few more details to complete your profile
            </p>

            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select your location</option>
                  <option value="Dimona">Dimona - Village of Peace</option>
                  <option value="Tel Aviv">Tel Aviv</option>
                  <option value="Jerusalem">Jerusalem</option>
                  <option value="Eilat">Eilat</option>
                  <option value="Beer Sheva">Beer Sheva</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'en', label: 'English', flag: '🇬🇧' },
                    { value: 'he', label: 'עברית', flag: '🇮🇱' },
                    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setFormData(prev => ({ ...prev, language_preference: lang.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.language_preference === lang.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-sm font-medium">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Marketing Consent */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketing_consent: e.target.checked }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-700">
                      Stay Updated
                    </div>
                    <div className="text-sm text-gray-600">
                      Receive personalized offers, new product alerts, and community updates
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                <i className="fas fa-arrow-left mr-2" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <i className="fas fa-check" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success & QR Code */}
        {currentStep === 4 && customerProfile && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <i className="fas fa-check text-green-600 text-3xl" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Welcome to KFAR, {customerProfile.name}!
            </h2>
            <p className="text-gray-600 mb-8">
              Your profile has been created successfully. Here's your unique QR code:
            </p>

            <div className="mb-8">
              <CustomerQRCode 
                profile={customerProfile}
                variant="card"
              />
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-3 text-green-800">
                🎉 Welcome Bonus!
              </h3>
              <p className="text-green-700 mb-4">
                You've earned <span className="font-bold">100 welcome points</span>!
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-green-800">Current Tier</div>
                  <div className="text-gray-600">Bronze</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-green-800">Points Balance</div>
                  <div className="text-gray-600">100 pts</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-green-800">Next Tier</div>
                  <div className="text-gray-600">1,900 pts to Silver</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/customer/dashboard'}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Go to Dashboard
                <i className="fas fa-arrow-right ml-2" />
              </button>
              
              <button
                onClick={() => window.location.href = '/shop'}
                className="w-full py-4 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all"
              >
                Start Shopping
                <i className="fas fa-shopping-cart ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}