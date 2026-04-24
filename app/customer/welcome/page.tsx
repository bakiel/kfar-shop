'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  QrCode, 
  Gift, 
  Download, 
  Share2, 
  Smartphone,
  ChevronRight,
  Star,
  Trophy,
  ShoppingBag,
  Mic,
  CheckCircle
} from 'lucide-react'

export default function CustomerWelcome() {
  const [showConfetti, setShowConfetti] = useState(true)
  
  // Mock customer data - would come from registration
  const customerData = {
    name: "Sarah",
    customerId: "KFAR-2024-0001",
    qrCode: "KFAR:CUSTOMER:0001:BRONZE:500",
    points: 500,
    tier: "Bronze"
  }

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const nextSteps = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Save to Phone",
      description: "Add QR to your phone for quick access",
      action: "Add to Wallet"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Start Shopping",
      description: "Browse products from local vendors",
      action: "Explore Market",
      link: "/marketplace"
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Try Voice Shopping",
      description: "Order using voice commands",
      action: "Voice Demo",
      link: "/voice-demo"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Earn More Points",
      description: "Complete your first purchase",
      action: "View Rewards",
      link: "/customer/rewards"
    }
  ]

  const tierBenefits = {
    Bronze: [
      "5% discount on all purchases",
      "Birthday bonus points",
      "Welcome gift on first order",
      "Access to community events"
    ],
    Silver: [
      "10% discount on all purchases",
      "Free shipping on orders over ₪50",
      "Early access to new products",
      "Priority customer support"
    ],
    Gold: [
      "15% discount on all purchases",
      "Free shipping on all orders",
      "Exclusive vendor previews",
      "Personal shopping assistant"
    ],
    Platinum: [
      "20% discount on all purchases",
      "VIP event invitations",
      "Personal shopper service",
      "Custom product requests"
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#478c0b', '#f6af0d', '#c23c09', '#3a3a1d'][Math.floor(Math.random() * 4)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome to KFAR, {customerData.name}!
        </h1>
        <p className="text-lg text-gray-600">
          Your smart shopping journey begins now
        </p>
      </div>

      {/* QR Code Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            {/* QR Code Display */}
            <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Personal QR Code
              </h2>
              <div className="inline-block p-6 bg-white rounded-xl shadow-lg mb-4">
                <QrCode className="h-48 w-48 text-gray-800" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Customer ID: {customerData.customerId}
              </p>
              <div className="flex gap-3 justify-center">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Welcome Rewards */}
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Your Welcome Rewards
              </h2>
              
              {/* Points Balance */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Welcome Bonus</p>
                    <p className="text-3xl font-bold text-gray-900">500 Points</p>
                  </div>
                  <Gift className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-sm text-gray-600">
                  You're already on your way to Silver tier!
                </div>
              </div>

              {/* Current Tier */}
              <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Bronze Member</h3>
                    <p className="text-sm text-gray-600">Your starting tier</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tierBenefits.Bronze.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What's Next?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-green-600 mb-4">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                {step.link ? (
                  <Link 
                    href={step.link}
                    className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    {step.action}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <button className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                    {step.action}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Pro Tips for New Members
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Show your QR code at any vendor for instant checkout and automatic points
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Leave reviews on your purchases to earn 50-200 bonus points per review
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Try voice shopping by saying "Hey KFAR" followed by your request
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">4</span>
              </div>
              <p className="text-sm text-gray-700">
                Refer friends to earn 500 points when they make their first purchase
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/marketplace"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Start Shopping
            <ShoppingBag className="ml-2 h-5 w-5" />
          </Link>
          <Link 
            href="/customer/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  )
}
