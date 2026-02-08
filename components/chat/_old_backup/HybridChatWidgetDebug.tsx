'use client';

import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// Debug: Import components one by one
console.log('Loading HybridChatWidget...');

// Test basic imports first
try {
  const { motion } = require('framer-motion');
  console.log('✓ framer-motion loaded');
} catch (e) {
  console.error('✗ framer-motion failed:', e);
}

// Test hook import
try {
  const { useHybridChat } = require('@/hooks/useHybridChat');
  console.log('✓ useHybridChat loaded');
} catch (e) {
  console.error('✗ useHybridChat failed:', e);
}

// Test component imports
try {
  const VoiceInterface = require('./VoiceInterface').default;
  console.log('✓ VoiceInterface loaded');
} catch (e) {
  console.error('✗ VoiceInterface failed:', e);
}

try {
  const TextInterface = require('./TextInterface').default;
  console.log('✓ TextInterface loaded');
} catch (e) {
  console.error('✗ TextInterface failed:', e);
}

try {
  const AssistantSelector = require('./AssistantSelector').default;
  console.log('✓ AssistantSelector loaded');
} catch (e) {
  console.error('✗ AssistantSelector failed:', e);
}

export default function HybridChatWidgetDebug() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg flex items-center justify-center"
        aria-label="Toggle chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
      </button>
      
      {isOpen && (
        <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg">
          <p>HybridChatWidget Debug Mode</p>
          <p className="text-sm text-gray-500">Check console for import status</p>
        </div>
      )}
    </>
  );
}