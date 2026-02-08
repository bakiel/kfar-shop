'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  MicrophoneIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon 
} from '@heroicons/react/24/outline';
import { useCart } from '@/lib/context/CartContext';
import { useVoiceCommerce } from '@/hooks/useVoiceCommerce';
import { parseVoiceCommand, CommandIntent } from '@/lib/voice/voiceCommandParser';

export default function VoiceCartManager() {
  // Handle missing cart context gracefully
  let cartContext;
  try {
    cartContext = useCart();
  } catch (e) {
    // Cart context not available, provide defaults
    cartContext = {
      cart: [],
      updateQuantity: () => {},
      removeFromCart: () => {},
      getCartTotal: () => 0
    };
  }
  
  const { cart = [], updateQuantity, removeFromCart, getCartTotal } = cartContext;
  const { speak } = useVoiceCommerce();
  const [isListening, setIsListening] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [cart]);

  const handleVoiceCommand = async (transcript: string) => {
    const command = transcript.toLowerCase();
    
    // Cart summary
    if (command.includes('what\'s in') || command.includes('show cart') || command.includes('total')) {
      await announceCart();
      return;
    }
    
    // Remove item
    if (command.includes('remove') || command.includes('delete')) {
      const item = cart?.find(item => 
        command.includes(item.name.toLowerCase())
      );
      
      if (item) {
        removeFromCart(item.id);
        await speak(`Removed ${item.name} from your cart.`, 'daniella');
      } else {
        await speak('Which item would you like to remove?', 'daniella');
      }
      return;
    }
    
    // Update quantity
    if (command.includes('change') || command.includes('update')) {
      const numbers = command.match(/\d+/);
      if (numbers && selectedItem) {
        const newQuantity = parseInt(numbers[0]);
        updateQuantity(selectedItem, newQuantity);
        const item = cart?.find(i => i.id === selectedItem);
        await speak(`Updated ${item?.name} quantity to ${newQuantity}.`, 'daniella');
      }
      return;
    }
    
    // Clear cart
    if (command.includes('clear') || command.includes('empty')) {
      cart?.forEach(item => removeFromCart(item.id));
      await speak('Your cart has been cleared.', 'daniella');
      return;
    }
    
    // Checkout
    if (command.includes('checkout') || command.includes('pay')) {
      await speak(`Your total is ${getCartTotal()} shekels. Proceeding to checkout.`, 'daniella');
      // Trigger checkout navigation
      window.location.href = '/checkout';
      return;
    }
    
    await speak('Sorry, I didn\'t understand. Try saying "show cart" or "remove item".', 'daniella');
  };

  const announceCart = async () => {
    if (!cart || cart.length === 0) {
      await speak('Your cart is empty. Start shopping to add items!', 'daniella');
      return;
    }
    
    const total = getCartTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let message = `You have ${itemCount} items in your cart. `;
    
    // Announce first few items
    cart.slice(0, 3).forEach(item => {
      message += `${item.quantity} ${item.name}, `;
    });
    
    if (cart.length > 3) {
      message += `and ${cart.length - 3} more items. `;
    }
    
    message += `Total: ${total} shekels.`;
    
    await speak(message, 'daniella');
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      speak('How can I help with your cart?', 'daniella');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-soil-brown flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          Voice Cart Manager
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startListening}
          className={`p-2 rounded-full transition-all ${
            isListening 
              ? 'bg-earth-flame text-white' 
              : 'bg-kfar-gold/20 text-kfar-gold hover:bg-kfar-gold hover:text-white'
          }`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Voice Status */}
      {isListening && (
        <div className="mb-4 p-3 bg-kfar-gold/10 rounded-lg flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-kfar-gold rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-kfar-gold rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-kfar-gold rounded-full animate-bounce delay-200" />
          </div>
          <span className="text-sm text-soil-brown">Listening for cart commands...</span>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {!cart || cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Your cart is empty. Use voice to add items!
            </p>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer transition-all ${
                  selectedItem === item.id ? 'ring-2 ring-kfar-gold' : ''
                }`}
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-soil-brown">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    ₪{item.price} × {item.quantity} = ₪{item.price * item.quantity}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, Math.max(1, item.quantity - 1));
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Cart Summary */}
      {cart && cart.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-soil-brown">Total:</span>
            <span className="text-xl font-bold text-kfar-gold">₪{getCartTotal()}</span>
          </div>
          
          {/* Voice Commands Help */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Voice commands:</p>
            <ul className="list-disc list-inside">
              <li>"Show cart" - Hear cart summary</li>
              <li>"Remove [item]" - Remove an item</li>
              <li>"Clear cart" - Empty cart</li>
              <li>"Checkout" - Proceed to payment</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}