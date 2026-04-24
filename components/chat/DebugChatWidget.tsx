'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DebugChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('DebugChatWidget mounted');
    
    // Check if there are any errors
    try {
      // Test if we can access window
      if (typeof window === 'undefined') {
        setError('Window is undefined');
      }
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gray-300 animate-pulse" />
    );
  }

  return (
    <>
      {/* Debug Info Box */}
      <div className="fixed top-4 right-4 bg-yellow-100 border-2 border-yellow-500 p-4 rounded-lg shadow-lg z-50 max-w-sm">
        <h3 className="font-bold text-sm mb-2">Chat Widget Debug Info</h3>
        <ul className="text-xs space-y-1">
          <li>Mounted: {mounted ? '✅' : '❌'}</li>
          <li>Error: {error || 'None'}</li>
          <li>Is Open: {isOpen ? '✅' : '❌'}</li>
          <li>Window available: {typeof window !== 'undefined' ? '✅' : '❌'}</li>
        </ul>
      </div>

      {/* Floating Button - Simplified version */}
      <button
        onClick={() => {
          console.log('Chat button clicked');
          setIsOpen(true);
        }}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform ${
          isOpen ? 'hidden' : 'block'
        }`}
        style={{
          // Force styles to ensure visibility
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          display: isOpen ? 'none' : 'flex'
        }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
      </button>

      {/* Simple Chat Interface */}
      {isOpen && (
        <div 
          className="fixed bottom-0 right-0 w-full sm:w-96 h-96 bg-white shadow-2xl flex flex-col z-50"
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            zIndex: 9999
          }}
        >
          <div className="bg-green-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Debug Chat</h3>
            <button
              onClick={() => {
                console.log('Close button clicked');
                setIsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 p-4 bg-gray-50">
            <p className="text-center text-gray-500">Chat interface is working!</p>
          </div>
        </div>
      )}
    </>
  );
}