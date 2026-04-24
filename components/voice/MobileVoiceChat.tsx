'use client';

import React from 'react';
import VoiceFirstChat from './VoiceFirstChat';

interface MobileVoiceChatProps {
  language?: 'en' | 'he' | 'ar';
  defaultVoice?: 'yaakov' | 'daniella';
  cartItems?: any[];
  onCartUpdate?: (items: any[]) => void;
}

const MobileVoiceChat: React.FC<MobileVoiceChatProps> = (props) => {
  return (
    <>
      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Ensure voice chat doesn't go under mobile navigation */
          .voice-chat-wrapper {
            position: fixed;
            bottom: env(safe-area-inset-bottom, 0);
            right: 0;
            left: 0;
            z-index: 50;
          }
          
          /* Adjust for iOS safe areas */
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .voice-chat-wrapper {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
          
          /* Make quick actions scrollable on mobile */
          .quick-actions-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .quick-actions-container::-webkit-scrollbar {
            display: none;
          }
          
          /* Optimize text input for mobile */
          input[type="text"] {
            font-size: 16px !important; /* Prevent zoom on iOS */
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          /* Ensure buttons are touch-friendly */
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Optimize product cards for mobile */
          .chat-product-card {
            touch-action: pan-y;
            -webkit-tap-highlight-color: transparent;
          }
        }
        
        /* Landscape mode adjustments */
        @media (max-height: 500px) and (orientation: landscape) {
          .voice-chat-container {
            max-height: calc(100vh - 60px) !important;
          }
          
          .chat-header {
            padding: 8px 16px !important;
          }
          
          .chat-content {
            height: calc(100% - 100px) !important;
          }
        }
      `}</style>
      
      <div className="voice-chat-wrapper">
        <VoiceFirstChat {...props} />
      </div>
    </>
  );
};

export default MobileVoiceChat;