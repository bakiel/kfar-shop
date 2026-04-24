'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SimplifiedChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show tooltip after 3 seconds
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        // Hide tooltip after 5 seconds
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          backgroundColor: '#3a3a1d',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99998,
          maxWidth: '200px',
          animation: 'fadeIn 0.3s ease'
        }}>
          Need help? Chat with our AI assistant!
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            right: '30px',
            width: '12px',
            height: '12px',
            backgroundColor: '#3a3a1d',
            transform: 'rotate(45deg)'
          }} />
        </div>
      )}

      {/* Chat Button - Professional Design */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          backgroundColor: '#478c0b',
          border: '3px solid white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered 
            ? '0 8px 24px rgba(71, 140, 11, 0.4), 0 0 0 4px rgba(71, 140, 11, 0.1)' 
            : '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 99999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image
            src="/images/kfar-chat-icon.png"
            alt="KFAR Chat"
            width={36}
            height={36}
            style={{
              filter: 'brightness(0) invert(1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
        
        {/* Pulse animation */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '50%',
            border: '3px solid #478c0b',
            opacity: 0.3,
            animation: 'pulse 2s infinite'
          }} />
        )}
      </button>

      {/* Chat Window - Professional UI */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '20px',
          width: '380px',
          height: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header with Brand Colors */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #478c0b 0%, #5fa513 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image
                  src="/images/kfar-chat-icon.png"
                  alt="KFAR"
                  width={24}
                  height={24}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>KFAR Assistant</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#fef9ef',
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(207, 231, 193, 0.1) 0%, transparent 50%)',
          }}>
            {/* Welcome Message */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #478c0b'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#3a3a1d' }}>
                שלום! Welcome to KFAR Marketplace 🌱
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                I'm here to help you discover authentic vegan products from the Village of Peace community. 
                How can I assist you today?
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px',
              marginTop: '16px' 
            }}>
              {[
                { icon: '🛍️', text: 'Browse Products' },
                { icon: '🏪', text: 'Find Vendors' },
                { icon: '📦', text: 'Track Order' },
                { icon: '💬', text: 'Get Support' }
              ].map((action, index) => (
                <button
                  key={index}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#3a3a1d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
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
                  <span style={{ fontSize: '16px' }}>{action.icon}</span>
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px 20px 20px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            backgroundColor: 'white'
          }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Message sent:', message);
              setMessage('');
            }} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '24px',
                  border: '2px solid #e5e7eb',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  backgroundColor: '#fef9ef'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#478c0b'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: message.trim() ? '#478c0b' : '#e5e7eb',
                  color: message.trim() ? 'white' : '#999',
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
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

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}