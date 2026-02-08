'use client';

import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function HybridChatWidgetSimple() {
  return (
    <button
      className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg flex items-center justify-center"
      aria-label="Open chat"
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
    </button>
  );
}