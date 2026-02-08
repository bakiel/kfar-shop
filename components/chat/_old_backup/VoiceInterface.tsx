import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import WaveformVisualizer from './WaveformVisualizer';
import { Message } from '@/hooks/useHybridChat';

interface VoiceInterfaceProps {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  assistant: string;
  language: string;
}

export default function VoiceInterface({
  messages,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  assistant,
  language
}: VoiceInterfaceProps) {
  const holdTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      onStartListening();
    }, 200);
  };

  const handleMouseUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (isListening) {
      onStopListening();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Voice Activity Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6">
          {/* Avatar with status */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${
              assistant === 'yaakov' 
                ? 'from-blue-400 to-blue-600' 
                : 'from-purple-400 to-purple-600'
            } flex items-center justify-center text-white text-4xl font-bold`}>
              {assistant === 'yaakov' ? 'Y' : 'D'}
            </div>
            
            {/* Status indicator */}
            {(isListening || isSpeaking) && (
              <div className="absolute inset-0 -m-2">
                <div className={`w-36 h-36 rounded-full border-4 ${
                  isListening ? 'border-blue-400' : 'border-green-400'
                } opacity-50 animate-ping`} />
              </div>
            )}
          </div>

          {/* Waveform */}
          <WaveformVisualizer
            isActive={isListening || isSpeaking}
            type={isListening ? 'input' : 'output'}
            color={assistant === 'yaakov' ? '#3B82F6' : '#A855F7'}
          />

          {/* Status text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isListening && 'Listening...'}
              {isSpeaking && 'Speaking...'}
              {!isListening && !isSpeaking && 'Ready'}
            </p>
            {messages.length > 0 && (
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {messages[messages.length - 1].text.substring(0, 100)}
                {messages[messages.length - 1].text.length > 100 && '...'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Push-to-Talk Button */}
      <div className="p-6 bg-gray-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={isSpeaking}
          className={`w-full py-4 rounded-full font-medium text-white transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <MicrophoneIcon className="h-6 w-6 inline mr-2" />
          {isListening ? 'Release to Send' : 'Hold to Talk'}
        </motion.button>
      </div>
    </div>
  );
}