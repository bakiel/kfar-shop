'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EnhancedChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Show tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div 
          className="fixed bottom-24 right-6 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-lg z-[99998] max-w-[200px] animate-fadeIn"
          style={{ backgroundColor: '#3a3a1d' }}
        >
          Need help? Chat with our AI assistant!
          <div 
            className="absolute bottom-[-6px] right-8 w-3 h-3 transform rotate-45"
            style={{ backgroundColor: '#3a3a1d' }}
          />
        </div>
      )}

      {/* Chat Button - Always visible with high z-index */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full border-4 border-white cursor-pointer flex items-center justify-center shadow-lg hover:shadow-xl z-[99999] transition-all duration-300 transform hover:scale-110"
        style={{ backgroundColor: '#478c0b' }}
        aria-label="Open chat assistant"
      >
        <div className="relative w-9 h-9 flex items-center justify-center">
          {!imageError ? (
            <Image
              src="/images/kfar-chat-icon.png"
              alt="KFAR Chat"
              width={36}
              height={36}
              className="filter brightness-0 invert"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-2xl">💬</span>
          )}
        </div>
        
        {/* Pulse animation */}
        {!isOpen && (
          <div 
            className="absolute inset-[-3px] rounded-full border-2 opacity-30 animate-pulse"
            style={{ borderColor: '#478c0b' }}
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl z-[99999] flex flex-col overflow-hidden animate-slideIn">
          {/* Header */}
          <div 
            className="p-5 text-white"
            style={{ background: 'linear-gradient(to right, #478c0b, #5fa513)' }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {!imageError ? (
                    <Image
                      src="/images/kfar-chat-icon.png"
                      alt="KFAR"
                      width={24}
                      height={24}
                      className="filter brightness-0 invert"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-lg">🌱</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">KFAR Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 p-5 overflow-y-auto"
            style={{ backgroundColor: '#fef9ef' }}
          >
            {/* Welcome Message */}
            <div 
              className="bg-white p-4 rounded-xl shadow-sm border-l-4 mb-4"
              style={{ borderLeftColor: '#478c0b' }}
            >
              <p className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                שלום! Welcome to KFAR Marketplace 🌱
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                I'm here to help you discover authentic vegan products from the Village of Peace community. 
                How can I assist you today?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🛍️', text: 'Browse Products' },
                { icon: '🏪', text: 'Find Vendors' },
                { icon: '📦', text: 'Track Order' },
                { icon: '💬', text: 'Get Support' }
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:text-white text-sm font-medium flex items-center gap-2 transition-all duration-200"
                  style={{ color: '#3a3a1d' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#478c0b';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#478c0b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#3a3a1d';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <span className="text-base">{action.icon}</span>
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Message sent:', message);
              setMessage('');
            }} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none text-sm"
                style={{ backgroundColor: '#fef9ef' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#478c0b'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: message.trim() ? '#478c0b' : '#e5e7eb',
                  color: message.trim() ? 'white' : '#9ca3af',
                  cursor: message.trim() ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (message.trim()) {
                    e.currentTarget.style.backgroundColor = '#3a7509';
                  }
                }}
                onMouseLeave={(e) => {
                  if (message.trim()) {
                    e.currentTarget.style.backgroundColor = '#478c0b';
                  }
                }}
              >
                Send
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}