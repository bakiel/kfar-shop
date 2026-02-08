'use client';

import React, { useState, useEffect } from 'react';
import { FaQrcode, FaWifi, FaMobileAlt, FaCheckCircle, FaShoppingCart, FaBox, FaCreditCard } from 'react-icons/fa';

export default function QRNFCAnimation() {
  const [activeDemo, setActiveDemo] = useState<'qr-payment' | 'qr-product' | 'nfc-tap' | 'nfc-locker'>('qr-payment');
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        const maxSteps = activeDemo.startsWith('qr') ? 4 : 3;
        if (prev >= maxSteps) {
          // Move to next demo
          const demos: Array<typeof activeDemo> = ['qr-payment', 'qr-product', 'nfc-tap', 'nfc-locker'];
          const currentIndex = demos.indexOf(activeDemo);
          const nextIndex = (currentIndex + 1) % demos.length;
          setActiveDemo(demos[nextIndex]);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeDemo, isPlaying]);

  const renderQRPaymentAnimation = () => {
    // Mobile version - single phone view
    if (isMobile) {
      return (
        <div className="relative h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 p-4 flex items-center justify-center">
            <div className={`transition-all duration-1000 ${
              animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="w-32 h-56 bg-gray-800 rounded-2xl p-1 shadow-2xl">
                <div className="w-full h-full bg-white rounded-xl p-3 overflow-hidden">
                  <p className="text-xs font-bold text-gray-800 mb-1">KFAR Checkout</p>
                  {animationStep >= 1 && (
                    <div className={`transition-all duration-500 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="w-20 h-20 bg-gray-100 rounded-lg p-1 mx-auto">
                        <div className="w-full h-full bg-white rounded flex items-center justify-center">
                          <FaQrcode className="text-2xl animate-pulse" style={{ color: '#478c0b' }} />
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-600">Scan to Pay</p>
                    </div>
                  )}
                  {animationStep >= 3 && (
                    <div className={`mt-2 transition-all duration-500 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <FaCheckCircle className="text-3xl text-green-500 mx-auto" />
                      <p className="text-xs text-center font-bold text-green-600">Payment Success!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop version - dual phone view
    return (
      <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 p-8">
          {/* Phone with checkout */}
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ${
              animationStep >= 0 ? 'translate-x-12 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            <div className="w-48 h-80 bg-gray-800 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl p-4 overflow-hidden">
                <p className="text-xs font-bold text-gray-800 mb-2">KFAR Checkout</p>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                {animationStep >= 1 && (
                  <div className={`transition-all duration-500 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <div className="w-32 h-32 bg-gray-100 rounded-lg p-2 mx-auto">
                      <div className="w-full h-full bg-white rounded flex items-center justify-center">
                        <FaQrcode className="text-5xl animate-pulse" style={{ color: '#478c0b' }} />
                      </div>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-600">Scan to Pay</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank App Phone */}
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ${
              animationStep >= 2 ? '-translate-x-12 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            <div className="w-48 h-80 bg-gray-800 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl p-4 overflow-hidden">
                <p className="text-xs font-bold text-blue-600 mb-2">Bank App</p>
                {animationStep >= 3 && (
                  <div className={`transition-all duration-500 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs font-semibold">Payment Request</p>
                      <p className="text-lg font-bold" style={{ color: '#478c0b' }}>₪125.00</p>
                      <p className="text-xs text-gray-600">KiFar Marketplace</p>
                    </div>
                    <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg mt-2">
                      Approve Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connection Line */}
          {animationStep >= 2 && animationStep < 4 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-0.5 bg-green-500 animate-pulse"></div>
            </div>
          )}

          {/* Success Checkmark */}
          {animationStep >= 4 && (
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              animationStep >= 4 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="bg-green-500 rounded-full p-8 animate-bounce">
                <FaCheckCircle className="text-6xl text-white" />
              </div>
            </div>
          )}

          {/* Step Labels */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            {['Generate QR', 'Scan', 'Approve', 'Done!'].map((label, i) => (
              <div 
                key={i}
                className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                  animationStep >= i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}. {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQRProductAnimation = () => {
    // Mobile version
    if (isMobile) {
      return (
        <div className="relative h-64 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
            {/* Product Card */}
            <div className={`transition-all duration-1000 ${
              animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="bg-white rounded-lg shadow-lg p-3 w-40">
                <div className="w-full h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg mb-2 flex items-center justify-center">
                  <FaBox className="text-2xl text-orange-600" />
                </div>
                <h3 className="font-bold text-xs mb-1">Organic Tahini</h3>
                {animationStep >= 1 && (
                  <div className={`w-16 h-16 mx-auto transition-all duration-500 ${
                    animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}>
                    <div className="w-full h-full bg-gray-100 rounded p-1">
                      <div className="w-full h-full bg-white rounded flex items-center justify-center">
                        <FaQrcode className="text-xl" style={{ color: '#f6af0d' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Success indicator */}
            {animationStep >= 3 && (
              <div className={`mt-4 transition-all duration-500 ${
                animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <div className="bg-green-500 rounded-full p-2">
                  <FaShoppingCart className="text-xl text-white" />
                </div>
                <p className="text-xs font-bold text-green-600 mt-1">Added to Cart!</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Desktop version
    return (
      <div className="relative h-96 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 p-8">
          {/* Product Card */}
          <div className={`absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
            animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <div className="bg-white rounded-xl shadow-xl p-4 w-48">
              <div className="w-full h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                <FaBox className="text-4xl text-orange-600" />
              </div>
              <h3 className="font-bold text-sm mb-1">Organic Tahini</h3>
              <p className="text-xs text-gray-600 mb-2">Premium quality</p>
              {animationStep >= 1 && (
                <div className={`w-20 h-20 mx-auto transition-all duration-500 ${
                  animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}>
                  <div className="w-full h-full bg-gray-100 rounded p-1">
                    <div className="w-full h-full bg-white rounded flex items-center justify-center">
                      <FaQrcode className="text-3xl" style={{ color: '#f6af0d' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone scanning */}
          <div className={`absolute right-1/4 top-1/2 -translate-y-1/2 transition-all duration-1000 ${
            animationStep >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
          }`}>
            <div className="w-48 h-80 bg-gray-800 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                {animationStep >= 2 && animationStep < 3 && (
                  <div className="h-full bg-black flex items-center justify-center relative">
                    <div className="absolute inset-4 border-2 border-white rounded-lg"></div>
                    <div className="absolute w-full h-0.5 bg-red-500 scanning-line"></div>
                    <p className="absolute bottom-8 text-white text-xs">Scanning...</p>
                  </div>
                )}
                {animationStep >= 3 && (
                  <div className={`p-4 transition-all duration-500 ${
                    animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <p className="text-xs font-bold text-gray-800 mb-2">Product Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Name:</span>
                        <span className="font-semibold">Organic Tahini</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Price:</span>
                        <span className="font-semibold" style={{ color: '#478c0b' }}>₪25</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Vendor:</span>
                        <span className="font-semibold">Teva Deli</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#478c0b' }}>
                      <FaShoppingCart className="inline mr-2" />
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Animation */}
          {animationStep >= 4 && (
            <div className={`absolute bottom-8 right-8 transition-all duration-500 ${
              animationStep >= 4 ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-180 opacity-0'
            }`}>
              <div className="bg-green-500 rounded-full p-4">
                <FaShoppingCart className="text-3xl text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNFCTapAnimation = () => {
    // Mobile version
    if (isMobile) {
      return (
        <div className="relative h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
            {/* NFC Terminal */}
            <div className={`transition-all duration-1000 ${
              animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="w-32 h-20 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                <FaWifi className="text-2xl text-white" />
              </div>
              <p className="text-xs font-semibold mt-1">Payment Terminal</p>
            </div>
            
            {/* Phone tapping */}
            {animationStep >= 1 && (
              <div className={`mt-4 transition-all duration-1000 ${
                animationStep >= 2 ? 'scale-110' : 'scale-100'
              } ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-20 h-32 bg-gray-800 rounded-xl p-1 shadow-lg">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <FaMobileAlt className="text-xl text-gray-600" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Success */}
            {animationStep >= 3 && (
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <div className="bg-green-500 rounded-full p-4 shadow-lg">
                  <FaCheckCircle className="text-3xl text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Desktop version
    return (
      <div className="relative h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 p-8">
          {/* NFC Terminal */}
          <div className={`absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
            animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <div className="w-48 h-32 bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center">
              <div className="w-40 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                <FaWifi className="text-4xl text-white" />
              </div>
            </div>
            <p className="text-center mt-2 text-sm font-semibold">Payment Terminal</p>
          </div>

          {/* Phone approaching */}
          {animationStep >= 1 && (
            <div className={`absolute left-1/2 bottom-1/3 -translate-x-1/2 transition-all duration-1000 ${
              animationStep >= 2 ? '-translate-y-20' : 'translate-y-10'
            } ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-32 h-56 bg-gray-800 rounded-2xl p-1 shadow-xl">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <FaMobileAlt className="text-3xl text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* NFC Waves */}
          {animationStep >= 2 && animationStep < 3 && (
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
              <div className="nfc-wave nfc-wave-1"></div>
              <div className="nfc-wave nfc-wave-2"></div>
              <div className="nfc-wave nfc-wave-3"></div>
            </div>
          )}

          {/* Success */}
          {animationStep >= 3 && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
              animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="bg-green-500 rounded-full p-8 shadow-2xl animate-bounce">
                <FaCheckCircle className="text-6xl text-white" />
              </div>
              <p className="mt-4 text-lg font-bold" style={{ color: '#478c0b' }}>
                Payment Complete!
              </p>
            </div>
          )}

          {/* Timer */}
          <div className="absolute top-4 right-4">
            <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
              {animationStep >= 3 ? '0.8s' : '...'}
            </div>
            <p className="text-xs text-gray-600">Transaction Time</p>
          </div>
        </div>
      </div>
    );
  };

  const renderNFCLockerAnimation = () => {
    // Mobile version
    if (isMobile) {
      return (
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
            {/* Smart Locker Grid */}
            <div className={`transition-all duration-1000 ${
              animationStep >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded shadow-md flex items-center justify-center transition-all duration-500 ${
                      animationStep >= 3 && i === 4 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {i === 4 && animationStep >= 1 && (
                      <FaWifi className="text-xs text-white" />
                    )}
                    {i === 4 && animationStep >= 3 && (
                      <FaBox className="text-xs text-white animate-bounce" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold mt-2">Smart Lockers</p>
            </div>
            
            {/* Phone */}
            {animationStep >= 1 && animationStep < 3 && (
              <div className={`mt-4 transition-all duration-1000 ${
                animationStep >= 2 ? 'scale-110' : 'scale-100'
              } ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-16 h-28 bg-gray-800 rounded-xl p-0.5 shadow-lg">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <FaMobileAlt className="text-lg text-gray-600" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {animationStep >= 3 && (
              <div className={`mt-4 transition-all duration-500 ${
                animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-xs">
                  <FaCheckCircle className="inline mr-1" />
                  Locker #5 Opened!
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Desktop version
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 p-8">
          {/* Smart Locker */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
            animationStep >= 0 ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-lg shadow-md flex items-center justify-center transition-all duration-500 ${
                    animationStep >= 3 && i === 4 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {i === 4 && animationStep >= 1 && (
                    <FaWifi className="text-2xl text-white" />
                  )}
                  {i === 4 && animationStep >= 3 && (
                    <div className="absolute animate-bounce">
                      <FaBox className="text-2xl text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center mt-4 font-semibold">Smart Collection Lockers</p>
          </div>

          {/* Phone tapping */}
          {animationStep >= 1 && animationStep < 3 && (
            <div className={`absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-1000 ${
              animationStep >= 2 ? '-translate-x-20' : '-translate-x-32'
            } ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-32 h-56 bg-gray-800 rounded-2xl p-1 shadow-xl">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <FaMobileAlt className="text-3xl text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* NFC Connection */}
          {animationStep >= 2 && animationStep < 3 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-4 border-blue-400 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Success Message */}
          {animationStep >= 3 && (
            <div className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-500 ${
              animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
                <FaCheckCircle className="inline mr-2" />
                Locker #5 Opened - Collect Your Order!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const demos = [
    {
      id: 'qr-payment' as const,
      title: 'QR Payment',
      description: 'Scan QR code at checkout for instant payment',
      icon: FaCreditCard,
      color: '#478c0b'
    },
    {
      id: 'qr-product' as const,
      title: 'Product Info',
      description: 'Scan product QR for details and quick add to cart',
      icon: FaBox,
      color: '#f6af0d'
    },
    {
      id: 'nfc-tap' as const,
      title: 'NFC Tap & Pay',
      description: 'Tap your phone for contactless payment',
      icon: FaWifi,
      color: '#c23c09'
    },
    {
      id: 'nfc-locker' as const,
      title: 'Smart Lockers',
      description: 'Tap to open your collection locker instantly',
      icon: FaBox,
      color: '#478c0b'
    }
  ];

  return (
    <>
      <style jsx>{`
        .scanning-line {
          animation: scan 2s linear infinite;
        }
        
        @keyframes scan {
          0% { transform: translateY(-40px); }
          50% { transform: translateY(40px); }
          100% { transform: translateY(-40px); }
        }
        
        .nfc-wave {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px solid #f6af0d;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: wave 1.5s ease-out infinite;
        }
        
        .nfc-wave-1 { animation-delay: 0s; }
        .nfc-wave-2 { animation-delay: 0.5s; }
        .nfc-wave-3 { animation-delay: 1s; }
        
        @keyframes wave {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center" style={{ color: '#3a3a1d' }}>
          See It In Action
        </h3>

        {/* Demo Selector */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <button
                key={demo.id}
                onClick={() => {
                  setActiveDemo(demo.id);
                  setAnimationStep(0);
                }}
                className={`p-2 md:p-4 rounded-lg md:rounded-xl transition-all ${
                  activeDemo === demo.id
                    ? 'shadow-lg transform -translate-y-0.5 md:-translate-y-1'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: activeDemo === demo.id ? demo.color : '#f3f4f6',
                  color: activeDemo === demo.id ? 'white' : '#374151'
                }}
              >
                <Icon className="text-lg md:text-2xl mx-auto mb-1 md:mb-2" />
                <p className="font-semibold text-xs md:text-sm">{demo.title}</p>
              </button>
            );
          })}
        </div>

        {/* Animation Display */}
        <div className="mb-4 md:mb-6">
          {activeDemo === 'qr-payment' && renderQRPaymentAnimation()}
          {activeDemo === 'qr-product' && renderQRProductAnimation()}
          {activeDemo === 'nfc-tap' && renderNFCTapAnimation()}
          {activeDemo === 'nfc-locker' && renderNFCLockerAnimation()}
        </div>

        {/* Description */}
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 px-2">
            {demos.find(d => d.id === activeDemo)?.description}
          </p>
          
          {/* Play/Pause Control */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all"
            style={{ 
              backgroundColor: isPlaying ? '#e5e7eb' : '#478c0b',
              color: isPlaying ? '#374151' : 'white'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
        </div>
      </div>
    </>
  );
}