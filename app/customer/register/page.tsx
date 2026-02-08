'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Camera, 
  QrCode, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload
} from 'lucide-react'

export default function CustomerRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    
    // Photo for AI Avatar
    photo: null as File | null,
    photoPreview: '',
    
    // Preferences
    language: 'en',
    currency: 'ILS',
    
    // Dietary
    dietary: [] as string[],
    
    // Location
    address: '',
    deliveryNotes: '',
    
    // Community
    role: 'resident'
  })

  const dietaryOptions = [
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { value: 'kosher', label: 'Kosher', emoji: '✡️' },
    { value: 'halal', label: 'Halal', emoji: '☪️' },
    { value: 'gluten-free', label: 'Gluten Free', emoji: '🌾' },
    { value: 'dairy-free', label: 'Dairy Free', emoji: '🥛' },
    { value: 'nut-free', label: 'Nut Free', emoji: '🥜' },
    { value: 'sugar-free', label: 'Sugar Free', emoji: '🍬' }
  ]

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      })
    }
  }

  const toggleDietary = (value: string) => {
    setFormData({
      ...formData,
      dietary: formData.dietary.includes(value)
        ? formData.dietary.filter(d => d !== value)
        : [...formData.dietary, value]
    })
  }

  const handleSubmit = async () => {
    // TODO: Submit to Supabase and generate QR code
    router.push('/customer/welcome')
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Welcome to KFAR!</h2>
              <p className="text-gray-600 mt-2">Let's get you started with your smart shopping profile</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+972 50 123 4567"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Camera className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Add Your Photo</h2>
              <p className="text-gray-600 mt-2">We'll use AI to create your personalized avatar</p>
            </div>

            <div className="max-w-xs mx-auto">
              <div className="relative">
                {formData.photoPreview ? (
                  <div className="relative">
                    <img 
                      src={formData.photoPreview} 
                      alt="Profile preview" 
                      className="w-48 h-48 rounded-full mx-auto object-cover"
                    />
                    <button
                      onClick={() => setFormData({...formData, photo: null, photoPreview: ''})}
                      className="absolute top-0 right-1/4 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="w-48 h-48 rounded-full mx-auto bg-gray-100 border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer flex items-center justify-center transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Upload Photo</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Your photo will be analyzed by AI to create a unique avatar and help with personalization
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(3)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Set Your Preferences</h2>
              <p className="text-gray-600 mt-2">Customize your shopping experience</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="he">עברית (Hebrew)</option>
                <option value="am">አማርኛ (Amharic)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ILS">₪ Israeli Shekel</option>
                <option value="USD">$ US Dollar</option>
                <option value="EUR">€ Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role in the Community
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="resident">Village Resident</option>
                <option value="volunteer">Volunteer</option>
                <option value="visitor">Visitor</option>
                <option value="tourist">Tourist</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Utensils className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Dietary Preferences</h2>
              <p className="text-gray-600 mt-2">Help us recommend the right products for you</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleDietary(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dietary.includes(option.value)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                You can update these preferences anytime in your profile
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
              <p className="text-gray-600 mt-2">Where should we deliver your orders?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full address or collection point"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Notes (Optional)
              </label>
              <textarea
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({...formData, deliveryNotes: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special instructions for delivery?"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Village residents can choose community collection points for easier pickup
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-md mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderStep()}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            ) : (
              <Link
                href="/join-kfar"
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Cancel
              </Link>
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.name || !formData.email || !formData.phone))
                }
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate My QR Code
              </button>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support at{' '}
          <a href="mailto:support@kfar.com" className="text-green-600 hover:underline">
            support@kfar.com
          </a>
        </p>
      </div>
    </div>
  )
}

// Add missing import
import { X } from 'lucide-react'
