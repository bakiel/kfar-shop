'use client';

/**
 * KFAR Shopping Assistant - Premium AI Chat Interface
 * Beautiful branded design with KFAR brand colors and assets
 * Supports Hebrew/English with proper RTL
 * Features: voice I/O, product cards, cart integration, quick actions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Send,
  Mic,
  VolumeX,
  Trash2,
  Loader2,
  ChevronRight,
  Leaf,
  Plus,
  ShoppingCart,
  Check,
  Store,
  UtensilsCrossed,
  IceCream,
  Shirt,
  ArrowDown,
} from 'lucide-react';
import { useShoppingAssistant, ChatMessage } from '@/hooks/useShoppingAssistant';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useCart } from '@/lib/context/CartContext';
import type { ProductResult } from '@/lib/ai/events/shopping-events';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// KFAR Brand Colors
const BRAND = {
  green: '#478c0b',
  greenDark: '#3a7209',
  greenLight: '#5ba30f',
  gold: '#f6af0d',
  goldLight: '#ffc942',
  flame: '#c23c09',
  cream: '#fef9ef',
  creamDark: '#f5edd8',
  soil: '#3a3a1d',
  mint: '#cfe7c1',
};

// ─── Animation Variants ─────────────────────────────────────────

const floatingButtonVariants = {
  initial: { scale: 0, opacity: 0, rotate: -180 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.5 },
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 20px 40px rgba(71, 140, 11, 0.35)',
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

const panelVariants = {
  closed: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 30 },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

const productCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
  hover: {
    y: -6,
    boxShadow: '0 16px 32px rgba(71, 140, 11, 0.2)',
    transition: { duration: 0.2 },
  },
};

// ─── Sub-Components ─────────────────────────────────────────────

// Loading Animation - KFAR themed with accessible label
const LoadingAnimation = ({ language }: { language: string }) => (
  <div className="flex items-center gap-2 py-1" role="status" aria-label={language === 'he' ? 'חושב...' : 'Thinking...'}>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: BRAND.green }}
          animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeOut' as const }}
        />
      ))}
    </div>
    <span className="text-xs text-gray-500">
      {language === 'he' ? 'חושב...' : 'Thinking...'}
    </span>
  </div>
);

// Voice Visualizer - Premium waveform
const VoiceVisualizer = ({ isActive }: { isActive: boolean }) => (
  <div className="flex items-center justify-center gap-[3px] h-5 w-8">
    {[...Array(4)].map((_, i) => (
      <motion.span
        key={i}
        className="w-[3px] rounded-full"
        style={{ backgroundColor: isActive ? BRAND.flame : BRAND.green }}
        animate={isActive ? {
          height: ['6px', '16px', '6px'],
          opacity: [0.6, 1, 0.6],
        } : { height: '6px', opacity: 0.4 }}
        transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.08, ease: 'easeOut' as const }}
      />
    ))}
  </div>
);

// Cart Added Toast
const CartToast = ({ productName, isRTL }: { productName: string; isRTL: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg"
    style={{ backgroundColor: BRAND.green, color: 'white' }}
    dir={isRTL ? 'rtl' : 'ltr'}
  >
    <Check className="w-4 h-4 stroke-[2] flex-shrink-0" />
    <span className="text-xs font-medium truncate max-w-[200px]">
      {isRTL ? `${productName} נוסף לסל` : `${productName} added`}
    </span>
  </motion.div>
);

// ─── Product Card ───────────────────────────────────────────────

const ProductCard = ({
  product,
  index,
  onAddToCart,
  onViewProduct,
  isRTL,
  language,
}: {
  product: ProductResult;
  index: number;
  onAddToCart: (product: ProductResult) => void;
  onViewProduct: (product: ProductResult) => void;
  isRTL: boolean;
  language: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const displayName = language === 'he' && product.nameHe ? product.nameHe : product.name;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      custom={index}
      variants={productCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="flex-shrink-0 w-[150px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 cursor-pointer group"
      onClick={() => onViewProduct(product)}
    >
      {/* Image */}
      <div className="relative h-[110px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="150px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <Leaf className="w-10 h-10 text-green-200 stroke-[1.5]" />
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm"
            style={{ backgroundColor: BRAND.flame }}
          >
            -{discount}%
          </span>
        )}

        {/* Badge */}
        {product.badge && !discount && (
          <span
            className="absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full shadow-sm"
            style={{ backgroundColor: BRAND.gold }}
          >
            {product.badge}
          </span>
        )}

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAdd}
          className="absolute bottom-2 right-2 p-1.5 rounded-full shadow-lg cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: justAdded ? '#22c55e' : BRAND.green,
            opacity: justAdded ? 1 : undefined,
          }}
          aria-label={isRTL ? 'הוסף לסל' : 'Add to cart'}
        >
          {justAdded ? (
            <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-white stroke-[2]" />
          )}
        </motion.button>

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
              {isRTL ? 'אזל' : 'Sold out'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <p
          className="text-xs font-medium line-clamp-2 leading-snug mb-1.5 min-h-[2.5em]"
          style={{ color: BRAND.soil }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {displayName}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold" style={{ color: BRAND.green }}>
              {'\u20AA'}{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-gray-400 line-through">
                {'\u20AA'}{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {product.vendorName && (
          <p className="text-[9px] text-gray-400 mt-1 truncate">
            {product.vendorName}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Message Component ──────────────────────────────────────────

const Message = ({
  message,
  onAddToCart,
  onViewProduct,
  onSuggestionClick,
  isRTL,
  language,
}: {
  message: ChatMessage;
  onAddToCart: (product: ProductResult) => void;
  onViewProduct: (product: ProductResult) => void;
  onSuggestionClick: (suggestion: string) => void;
  isRTL: boolean;
  language: string;
}) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenLight})` }}
        >
          <img
            src="/images/logos/kfar_icon_leaf_white_on_green.png"
            alt=""
            width={16}
            height={16}
            className="drop-shadow-sm"
          />
        </div>
      )}

      <div
        className={`max-w-[82%] ${
          isUser
            ? 'rounded-2xl rounded-br-sm'
            : 'rounded-2xl rounded-bl-sm'
        } px-4 py-3`}
        style={{
          backgroundColor: isUser ? BRAND.green : 'white',
          color: isUser ? 'white' : BRAND.soil,
          boxShadow: isUser
            ? '0 4px 12px rgba(71, 140, 11, 0.25)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {message.isLoading ? (
          <LoadingAnimation language={language} />
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Product Carousel */}
            {message.products && message.products.length > 0 && (
              <div className="mt-3 -mx-4 px-4">
                <div
                  className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {message.products.slice(0, 8).map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      onAddToCart={onAddToCart}
                      onViewProduct={onViewProduct}
                      isRTL={isRTL}
                      language={language}
                    />
                  ))}
                </div>
                {message.products.length > 4 && (
                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    {isRTL ? `גלול לעוד ${message.products.length - 4} מוצרים` : `Scroll for ${message.products.length - 4} more`}
                  </p>
                )}
              </div>
            )}

            {/* Suggestion Chips */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {message.suggestions.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 + 0.15 }}
                    whileHover={{ scale: 1.03, backgroundColor: BRAND.mint }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 cursor-pointer transition-colors"
                    style={{ color: BRAND.soil }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Welcome Screen ─────────────────────────────────────────────

const WelcomeScreen = ({
  language,
  onSuggestionClick,
  onQuickAction,
}: {
  language: 'en' | 'he';
  onSuggestionClick: (suggestion: string) => void;
  onQuickAction: (action: string) => void;
}) => {
  const isRTL = language === 'he';

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = language === 'he'
    ? hour < 12 ? 'בוקר טוב!' : hour < 17 ? 'צהריים טובים!' : 'ערב טוב!'
    : hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good evening!';

  // Quick action categories
  const quickActions = language === 'he'
    ? [
        { icon: UtensilsCrossed, label: 'אוכל', query: 'הראה לי אוכל טבעוני', color: '#478c0b' },
        { icon: IceCream, label: 'קינוחים', query: 'מה יש בקינוחים?', color: '#c23c09' },
        { icon: Store, label: 'חנויות', query: 'הראה לי את כל החנויות', color: '#f6af0d' },
        { icon: Shirt, label: 'ביגוד', query: 'מוצרי ביגוד ואביזרים', color: '#6366f1' },
      ]
    : [
        { icon: UtensilsCrossed, label: 'Food', query: 'Show me vegan food', color: '#478c0b' },
        { icon: IceCream, label: 'Desserts', query: 'What desserts do you have?', color: '#c23c09' },
        { icon: Store, label: 'Vendors', query: 'Show me all vendors', color: '#f6af0d' },
        { icon: Shirt, label: 'Apparel', query: 'Show me clothing and accessories', color: '#6366f1' },
      ];

  // Conversation starters
  const starters = language === 'he'
    ? [
        'מה הכי נמכר היום?',
        'אני מחפש משהו לארוחת ערב',
        'יש לכם משהו ללא גלוטן?',
      ]
    : [
        "What's popular today?",
        "I'm looking for a dinner idea",
        'Do you have gluten-free options?',
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex flex-col h-full px-5 py-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hero */}
      <div className="text-center mb-6">
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenLight} 100%)`,
          }}
          animate={{
            boxShadow: [
              '0 8px 30px rgba(71, 140, 11, 0.3)',
              '0 8px 40px rgba(71, 140, 11, 0.5)',
              '0 8px 30px rgba(71, 140, 11, 0.3)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <img
            src="/images/logos/kfar_icon_leaf_white_on_green.png"
            alt="KFAR"
            width={36}
            height={36}
            className="drop-shadow-sm"
          />
        </motion.div>

        <h2 className="text-lg font-bold mb-1" style={{ color: BRAND.soil }}>
          {greeting}
        </h2>
        <p className="text-sm text-gray-500">
          {language === 'he'
            ? 'אני כאן לעזור לך למצוא הכל בשוק'
            : "I'm here to help you find anything in the marketplace"}
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickAction(action.query)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-100 shadow-sm cursor-pointer transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${action.color}12` }}
            >
              <action.icon className="w-4.5 h-4.5 stroke-[1.5]" style={{ color: action.color }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: BRAND.soil }}>
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          {language === 'he' ? 'או שאל אותי' : 'Or ask me'}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Conversation Starters */}
      <div className="space-y-2 flex-1">
        {starters.map((starter, i) => (
          <motion.button
            key={starter}
            initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.08 }}
            whileHover={{ x: isRTL ? -3 : 3, backgroundColor: BRAND.mint }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(starter)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all text-left"
            style={{ color: BRAND.soil }}
          >
            <span className="text-sm">{starter}</span>
            <ChevronRight
              className={`w-4 h-4 text-gray-300 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`}
              strokeWidth={1.5}
            />
          </motion.button>
        ))}
      </div>

      {/* Community tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-center"
      >
        <span className="text-[10px] text-gray-400">
          {language === 'he'
            ? '6 חנויות, 113 מוצרים טבעוניים, קהילה אחת'
            : '6 vendors, 113 vegan products, one community'}
        </span>
      </motion.div>
    </motion.div>
  );
};

// ─── Rotating Placeholder Hook ──────────────────────────────────

function useRotatingPlaceholder(language: 'en' | 'he') {
  const [index, setIndex] = useState(0);

  const placeholders = language === 'he'
    ? ['מה תרצה למצוא?', 'חפש מוצרים...', 'שאל אותי הכל...', 'מה לארוחת ערב?']
    : ['What are you looking for?', 'Search products...', 'Ask me anything...', "What's for dinner?"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return placeholders[index];
}

// ─── Main Component ─────────────────────────────────────────────

export default function ShoppingAssistant() {
  const router = useRouter();
  const { language } = useLanguage();
  const cart = useCart();
  const shouldReduceMotion = useReducedMotion();
  const [inputValue, setInputValue] = useState('');
  const [toastProduct, setToastProduct] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRTL = language === 'he';
  const placeholder = useRotatingPlaceholder(language);

  const {
    messages,
    isLoading,
    isOpen,
    isListening,
    isSpeaking,
    sendMessage,
    toggleChat,
    clearChat,
    startListening,
    stopListening,
    stopSpeaking,
    handleSuggestionClick,
    addToCartFromChat,
  } = useShoppingAssistant({
    language,
    onProductClick: (product) => {
      router.push(`/product/${product.id}`);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages, shouldReduceMotion]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Scroll detection for "scroll down" indicator
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleViewProduct = (product: ProductResult) => {
    if (!product?.id) return;
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: ProductResult) => {
    addToCartFromChat(product);
    setToastProduct(product.name);
    setTimeout(() => setToastProduct(null), 2000);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const cartCount = cart.getCartCount();

  return (
    <>
      {/* ─── Floating Button ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={floatingButtonVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full shadow-2xl flex items-center justify-center cursor-pointer overflow-visible"
            style={{
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDark} 100%)`,
            }}
            aria-label={isRTL ? 'פתח עוזר קניות' : 'Open shopping assistant'}
          >
            {/* Icon */}
            <img
              src="/images/logos/kfar_icon_leaf_white_on_green.png"
              alt=""
              width={32}
              height={32}
              className="drop-shadow-sm relative z-10"
            />

            {/* Cart Count Badge */}
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center z-20 shadow-md"
                style={{ backgroundColor: BRAND.flame }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}

            {/* Pulse Ring */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${BRAND.gold}` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed z-50 flex flex-col overflow-hidden
              bottom-0 right-0 w-full h-full
              sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-w-[calc(100vw-32px)] sm:h-[640px] sm:max-h-[calc(100vh-100px)] sm:rounded-2xl"
            style={{
              backgroundColor: BRAND.cream,
              border: `1px solid ${BRAND.mint}`,
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* ─── Header ─── */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDark} 100%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <img
                    src="/images/logos/kfar_icon_leaf_white_on_green.png"
                    alt="KFAR"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide">
                    KFAR Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <p className="text-[11px] text-white/80">
                      {language === 'he' ? 'מוכן לעזור' : 'Ready to help'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Cart shortcut */}
                {cartCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.push('/checkout')}
                    className="p-2 rounded-full cursor-pointer transition-colors relative"
                    aria-label={isRTL ? 'לתשלום' : 'Checkout'}
                  >
                    <ShoppingCart className="w-4 h-4 text-white/90 stroke-[1.5]" />
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: BRAND.gold }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  className="p-2 rounded-full cursor-pointer transition-colors"
                  aria-label={isRTL ? 'נקה שיחה' : 'Clear chat'}
                >
                  <Trash2 className="w-4 h-4 text-white/90 stroke-[1.5]" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChat}
                  className="p-2 rounded-full cursor-pointer transition-colors"
                  aria-label={isRTL ? 'סגור' : 'Close'}
                >
                  <X className="w-4 h-4 text-white/90 stroke-[1.5]" />
                </motion.button>
              </div>
            </div>

            {/* ─── Messages Area ─── */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 relative"
              style={{ backgroundColor: BRAND.cream }}
            >
              {messages.length === 0 ? (
                <WelcomeScreen
                  language={language}
                  onSuggestionClick={handleSuggestionClick}
                  onQuickAction={handleQuickAction}
                />
              ) : (
                <>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      onAddToCart={handleAddToCart}
                      onViewProduct={handleViewProduct}
                      onSuggestionClick={handleSuggestionClick}
                      isRTL={isRTL}
                      language={language}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Scroll Down Indicator */}
            <AnimatePresence>
              {showScrollDown && messages.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-[76px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer z-10 border border-gray-200"
                >
                  <ArrowDown className="w-4 h-4 text-gray-500 stroke-[1.5]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Cart Toast */}
            <div className="absolute bottom-[80px] left-0 right-0 flex justify-center pointer-events-none z-20">
              <AnimatePresence>
                {toastProduct && (
                  <CartToast productName={toastProduct} isRTL={isRTL} />
                )}
              </AnimatePresence>
            </div>

            {/* ─── Input Area ─── */}
            <form
              onSubmit={handleSubmit}
              className="px-3 py-3 border-t bg-white flex-shrink-0"
              style={{ borderColor: BRAND.mint }}
            >
              <div
                className="flex items-center gap-1.5 p-1 rounded-full"
                style={{
                  backgroundColor: '#f8f9fa',
                  border: `1.5px solid ${isListening ? BRAND.flame : BRAND.mint}`,
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Voice Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isListening ? stopListening : startListening}
                  className="p-2.5 rounded-full cursor-pointer transition-all flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isListening ? '#fee2e2' : 'white',
                    color: isListening ? BRAND.flame : '#666',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                  aria-label={isListening
                    ? (isRTL ? 'עצור הקלטה' : 'Stop recording')
                    : (isRTL ? 'הקלט קולית' : 'Voice input')
                  }
                >
                  {isListening ? (
                    <VoiceVisualizer isActive />
                  ) : (
                    <Mic className="w-4 h-4 stroke-[1.5]" />
                  )}
                </motion.button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
                  placeholder={placeholder}
                  className="flex-1 px-2 py-2.5 bg-transparent text-sm placeholder-gray-400 focus:outline-none min-w-0"
                  style={{ color: BRAND.soil }}
                  disabled={isLoading}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  aria-label={isRTL ? 'הקלד הודעה' : 'Type a message'}
                />

                {/* Stop Speaking */}
                {isSpeaking && (
                  <motion.button
                    type="button"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopSpeaking}
                    className="p-2.5 rounded-full cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}
                    aria-label={isRTL ? 'עצור דיבור' : 'Stop speaking'}
                  >
                    <VolumeX className="w-4 h-4 stroke-[1.5]" />
                  </motion.button>
                )}

                {/* Send Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2.5 rounded-full cursor-pointer transition-all shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: isLoading || !inputValue.trim() ? '#e5e7eb' : BRAND.green,
                    color: isLoading || !inputValue.trim() ? '#9ca3af' : 'white',
                  }}
                  aria-label={isRTL ? 'שלח' : 'Send'}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 stroke-[1.5] animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 stroke-[1.5]" />
                  )}
                </motion.button>
              </div>

              {/* Footer */}
              <div className="mt-1.5 flex items-center justify-between px-2">
                <span className="text-[10px] text-gray-400">
                  Powered by KFAR AI
                </span>
                <span className="text-[10px] text-gray-400">
                  {language === 'he' ? 'עברית' : 'English'}
                </span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollbar Hide CSS */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
