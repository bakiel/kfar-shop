/**
 * Shopping Assistant Hook
 * Manages chat state, API communication, and voice features
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCart } from '@/lib/context/CartContext';
import type { ConversationMessage, ProductResult } from '@/lib/ai/events/shopping-events';
import type { CartItem } from '@/lib/ai/agents/cart-agent';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// Chat message interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: ProductResult[];
  suggestions?: string[];
  isLoading?: boolean;
}

interface UseShoppingAssistantOptions {
  language?: 'en' | 'he';
  onProductClick?: (product: ProductResult) => void;
  onCartUpdate?: () => void;
}

export function useShoppingAssistant(options: UseShoppingAssistantOptions = {}) {
  const { language = 'en', onProductClick, onCartUpdate } = options;

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const activeAudioRef = useRef<{ audio: HTMLAudioElement; url: string } | null>(null);
  const cachedVoiceRef = useRef<{ en: SpeechSynthesisVoice | null; he: SpeechSynthesisVoice | null }>({ en: null, he: null });

  // Cart integration
  const cart = useCart();

  // Session ID for conversation continuity
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert cart items to the format expected by the API
  const getCartItems = useCallback((): CartItem[] => {
    return cart.items.map(item => ({
      id: item.id,
      name: item.name,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      originalPrice: item.originalPrice,
    }));
  }, [cart.items]);

  // Convert messages to conversation history format (last 10 for efficiency)
  const getConversationHistory = useCallback((): ConversationMessage[] => {
    return messages
      .filter(m => !m.isLoading)
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));
  }, [messages]);

  // Send message to API
  const sendMessage = useCallback(async (message: string, isVoice = false) => {
    if (!message.trim() || isLoading) return;

    // Stop any ongoing TTS when user sends a new message
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.audio.pause();
      URL.revokeObjectURL(activeAudioRef.current.url);
      activeAudioRef.current = null;
    }
    setIsSpeaking(false);

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add loading placeholder for assistant
    const loadingMessage: ChatMessage = {
      id: `msg_${Date.now()}_loading`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          language,
          isVoice,
          sessionId: sessionIdRef.current,
          conversationHistory: getConversationHistory(),
          cart: getCartItems(),
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Replace loading message with actual response
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response.text,
        timestamp: new Date(),
        products: data.response.products,
        suggestions: data.response.suggestions,
      };

      setMessages(prev =>
        prev.filter(m => m.id !== loadingMessage.id).concat(assistantMessage)
      );

      // Handle cart updates from response
      if (data.response.intent === 'add_to_cart' && data.response.products?.[0]) {
        const product = data.response.products[0];
        cart.addToCart({
          id: product.id,
          name: product.name,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          price: product.price,
          quantity: 1,
          image: product.image,
          originalPrice: product.originalPrice,
        });
        onCartUpdate?.();
      }

      // Speak response if voice mode (skip TTS when showing product results - visual answers)
      if (isVoice && data.response.text && !data.response.products?.length) {
        speakResponse(data.response.text);
      }

    } catch (err) {
      // Ignore aborted requests
      if (err instanceof DOMException && err.name === 'AbortError') return;

      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');

      // Replace loading with error message
      setMessages(prev =>
        prev.filter(m => m.id !== loadingMessage.id).concat({
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: language === 'he'
            ? 'מצטער, משהו השתבש. אנא נסה שוב.'
            : "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        })
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [language, isLoading, getConversationHistory, getCartItems, cart, onCartUpdate]);

  // Helper to convert base64 to Blob (defined first as it's used by speakResponse)
  const base64ToBlob = useCallback((base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }, []);

  // Browser TTS with server-provided config (defined before speakResponse)
  const speakWithBrowserConfig = useCallback((text: string, config: { lang: string; rate: number; pitch: number }) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Browser TTS fallback with consistent voice selection (cached to prevent voice changes)
  const speakWithBrowser = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
    utterance.rate = language === 'he' ? 0.95 : 1.0;
    utterance.pitch = language === 'he' ? 1.0 : 0.9; // Lower pitch for warmth
    utterance.volume = 1.0;

    const selectAndCacheVoice = () => {
      // Use cached voice if available
      const cached = cachedVoiceRef.current[language];
      if (cached) {
        utterance.voice = cached;
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (language === 'en') {
        const preferredVoiceNames = [
          'Daniel', 'Aaron', 'James', 'Thomas', 'Alex', 'Fred',
          'Google US English', 'Samantha', 'Karen'
        ];
        selectedVoice = voices.find(v =>
          preferredVoiceNames.some(name => v.name.includes(name)) &&
          v.lang.startsWith('en')
        ) || null;
      } else {
        selectedVoice = voices.find(v => v.lang.includes('he')) || null;
      }

      if (selectedVoice) {
        cachedVoiceRef.current[language] = selectedVoice;
        utterance.voice = selectedVoice;
      }
    };

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        selectAndCacheVoice();
        window.speechSynthesis.speak(utterance);
      };
    } else {
      selectAndCacheVoice();
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Text-to-speech with speed optimization:
  // - Short text (< 100 chars): use browser TTS for instant playback
  // - Longer text: use Gemini 2.5 Flash TTS for higher quality
  const speakResponse = useCallback(async (text: string) => {
    if (typeof window === 'undefined') return;

    setIsSpeaking(true);

    // For short responses, use browser TTS immediately (no API latency)
    if (text.length < 100) {
      speakWithBrowser(text);
      return;
    }

    try {
      // Try Gemini TTS for longer conversational responses
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          emotion: 'helpful',
        }),
      });

      const data = await response.json();

      // If we got audio from Gemini TTS
      if (data.success && data.audioBase64 && data.mimeType) {
        // Clean up previous audio if any
        if (activeAudioRef.current) {
          activeAudioRef.current.audio.pause();
          URL.revokeObjectURL(activeAudioRef.current.url);
          activeAudioRef.current = null;
        }

        const audioBlob = base64ToBlob(data.audioBase64, data.mimeType);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        activeAudioRef.current = { audio, url: audioUrl };

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          activeAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          activeAudioRef.current = null;
          speakWithBrowser(text);
        };

        await audio.play();
        return;
      }

      // Fall back to browser TTS with config from server
      if (data.fallbackConfig) {
        speakWithBrowserConfig(text, data.fallbackConfig);
      } else {
        speakWithBrowser(text);
      }

    } catch (error) {
      console.error('TTS error, falling back to browser:', error);
      speakWithBrowser(text);
    }
  }, [language, base64ToBlob, speakWithBrowser, speakWithBrowserConfig]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript, true);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_e) { /* may not be active */ }
        recognitionRef.current = null;
      }
    };
  }, [language, sendMessage]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.audio.pause();
        URL.revokeObjectURL(activeAudioRef.current.url);
        activeAudioRef.current = null;
      }
    };
  }, []);

  // Start voice recognition with race condition guard
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isLoading) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // Already started or not available - reset state
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  }, [isListening, isLoading]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Stop speaking (both browser TTS and Gemini audio)
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.audio.pause();
      URL.revokeObjectURL(activeAudioRef.current.url);
      activeAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Toggle chat panel - clean up voice/audio when closing
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        // Closing: stop listening, speaking, cancel requests
        if (recognitionRef.current && isListening) {
          try { recognitionRef.current.stop(); } catch (_e) { /* noop */ }
          setIsListening(false);
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (activeAudioRef.current) {
          activeAudioRef.current.audio.pause();
          URL.revokeObjectURL(activeAudioRef.current.url);
          activeAudioRef.current = null;
        }
        setIsSpeaking(false);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      }
      return !prev;
    });
  }, [isListening]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Handle product click
  const handleProductClick = useCallback((product: ProductResult) => {
    onProductClick?.(product);
  }, [onProductClick]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Add to cart from chat
  const addToCartFromChat = useCallback((product: ProductResult) => {
    cart.addToCart({
      id: product.id,
      name: product.name,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      price: product.price,
      quantity: 1,
      image: product.image,
      originalPrice: product.originalPrice,
    });
    onCartUpdate?.();

    // Use Hebrew name when available and in Hebrew mode
    const displayName = language === 'he' && product.nameHe ? product.nameHe : product.name;

    // Add confirmation message
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}_cart`,
      role: 'assistant',
      content: language === 'he'
        ? `${displayName} נוסף לסל!`
        : `Added ${displayName} to cart!`,
      timestamp: new Date(),
    }]);
  }, [cart, language, onCartUpdate]);

  return {
    // State
    messages,
    isLoading,
    isOpen,
    error,
    isListening,
    isSpeaking,

    // Actions
    sendMessage,
    toggleChat,
    clearChat,
    startListening,
    stopListening,
    stopSpeaking,
    handleProductClick,
    handleSuggestionClick,
    addToCartFromChat,
  };
}
