'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/lib/context/CartContext';
import { useVoiceCommerce } from '@/hooks/useVoiceCommerce';
import { VOICE_CONFIG } from '@/config/voice';

interface VoiceQuickBuyProps {
  productId?: string;
  productName?: string;
  price?: number;
  onSuccess?: () => void;
}

export default function VoiceQuickBuy({ 
  productId, 
  productName, 
  price,
  onSuccess 
}: VoiceQuickBuyProps) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success'>('idle');
  
  // Handle missing cart context
  let cartContext;
  try {
    cartContext = useCart();
  } catch (e) {
    cartContext = { addToCart: () => {} };
  }
  const { addToCart } = cartContext;
  
  const { speak } = useVoiceCommerce();
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceResponse(transcript);
      };

      recognition.onerror = () => {
        setStatus('idle');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceResponse = async (transcript: string) => {
    setStatus('processing');
    
    // Check for positive responses
    const positiveResponses = ['yes', 'yeah', 'sure', 'ok', 'okay', 'add', 'buy', 'כן', 'בסדר', 'نعم'];
    const negativeResponses = ['no', 'nope', 'cancel', 'לא', 'לا'];
    
    if (positiveResponses.some(response => transcript.includes(response))) {
      // Add to cart
      if (productId && productName && price) {
        addToCart({
          id: productId,
          name: productName,
          price: price,
          quantity: 1,
          vendor: '', // Would be passed in real implementation
          vendorId: '',
          image: ''
        });
        
        setStatus('success');
        await speak(`Great! Added ${productName} to your cart.`, 'daniella');
        
        setTimeout(() => {
          setStatus('idle');
          onSuccess?.();
        }, 2000);
      }
    } else if (negativeResponses.some(response => transcript.includes(response))) {
      setStatus('idle');
      await speak('No problem! Let me know if you change your mind.', 'daniella');
    } else {
      setStatus('idle');
      await speak('Sorry, I didn\'t catch that. Say "yes" to add to cart or "no" to cancel.', 'daniella');
    }
  };

  const startQuickBuy = async () => {
    if (!productName) return;
    
    setStatus('listening');
    setIsListening(true);
    
    // Ask the question
    await speak(`Would you like to add ${productName} to your cart for ${price} shekels?`, 'daniella');
    
    // Start listening after speaking
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }, 100);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={startQuickBuy}
      disabled={status !== 'idle'}
      className={`
        relative px-6 py-3 rounded-full font-medium text-white 
        flex items-center gap-2 transition-all shadow-lg
        ${status === 'idle' ? 'bg-gradient-to-r from-kfar-gold to-sun-gold-light hover:shadow-xl' : ''}
        ${status === 'listening' ? 'bg-gradient-to-r from-earth-flame to-earth-flame-light animate-pulse' : ''}
        ${status === 'processing' ? 'bg-gray-400' : ''}
        ${status === 'success' ? 'bg-leaf-green' : ''}
        disabled:cursor-not-allowed
      `}
    >
      {status === 'idle' && (
        <>
          <MicrophoneIcon className="h-5 w-5" />
          <span>Voice Buy</span>
        </>
      )}
      
      {status === 'listening' && (
        <>
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" />
            <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-150" />
          </div>
          <span>Listening...</span>
        </>
      )}
      
      {status === 'processing' && (
        <>
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          <span>Processing...</span>
        </>
      )}
      
      {status === 'success' && (
        <>
          <ShoppingBagIcon className="h-5 w-5" />
          <span>Added!</span>
        </>
      )}
    </motion.button>
  );
}

// Standalone Quick Buy Button for product cards
export function VoiceQuickBuyMini({ 
  productId, 
  productName, 
  price 
}: VoiceQuickBuyProps) {
  const [isActive, setIsActive] = useState(false);
  
  // Handle missing cart context
  let cartContext;
  try {
    cartContext = useCart();
  } catch (e) {
    cartContext = { addToCart: () => {} };
  }
  const { addToCart } = cartContext;
  
  const { speak } = useVoiceCommerce();

  const handleQuickBuy = async () => {
    setIsActive(true);
    
    // Quick add with voice confirmation
    if (productId && productName && price) {
      addToCart({
        id: productId,
        name: productName,
        price: price,
        quantity: 1,
        vendor: '',
        vendorId: '',
        image: ''
      });
      
      await speak(`Added ${productName} to cart!`, 'daniella');
      
      setTimeout(() => {
        setIsActive(false);
      }, 1500);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleQuickBuy}
      className={`
        p-2 rounded-full transition-all
        ${isActive 
          ? 'bg-leaf-green text-white' 
          : 'bg-kfar-gold/20 text-kfar-gold hover:bg-kfar-gold hover:text-white'
        }
      `}
      title="Quick voice buy"
    >
      <MicrophoneIcon className="h-4 w-4" />
    </motion.button>
  );
}