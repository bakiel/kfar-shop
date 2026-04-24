'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

interface VoiceButtonCustomizableProps {
  style?: 'default' | 'brand' | 'dark' | 'light';
  onClick: () => void;
  isOpen: boolean;
}

export default function VoiceButtonCustomizable({ 
  style = 'default', 
  onClick, 
  isOpen 
}: VoiceButtonCustomizableProps) {
  const styles = {
    default: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.2)',
      hoverBackground: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)'
    },
    brand: {
      background: '#1a4d2e',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.9), 0 0 0 6px rgba(246, 175, 13, 0.5)',
      hoverBackground: '#246b3a'
    },
    dark: {
      background: '#000000',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 255, 255, 1)',
      hoverBackground: '#1a1a1a'
    },
    light: {
      background: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(0, 0, 0, 0.1)',
      hoverBackground: '#f3f4f6',
      iconColor: '#000000'
    }
  };

  const currentStyle = styles[style];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center ${
        isOpen ? 'hidden' : 'block'
      }`}
      style={{ 
        zIndex: 99999,
        background: isHovered && currentStyle.hoverBackground ? currentStyle.hoverBackground : currentStyle.background,
        boxShadow: currentStyle.boxShadow,
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s ease'
      }}
      aria-label="Open voice shopping"
    >
      <MicrophoneIcon 
        className="h-8 w-8" 
        style={{ 
          color: currentStyle.iconColor || '#ffffff',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }} 
      />
    </motion.button>
  );
}