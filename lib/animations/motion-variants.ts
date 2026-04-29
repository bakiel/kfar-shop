/**
 * KFAR Marketplace - Shared Motion Variants
 *
 * Reusable animation patterns for Framer Motion
 * Following UI Design Rules for $20k quality micro-interactions
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// PAGE ENTRANCE ANIMATIONS
// ============================================

/**
 * Container variant for staggered children
 * Use on parent elements to orchestrate child animations
 */
export const pageContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Child item variant for staggered entrance
 * Fade in + slide up effect
 */
export const pageItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5, ease: 'easeOut' as const
    }
  }
};

/**
 * Faster stagger for lists (products, cards)
 */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

/**
 * List item entrance
 */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3, ease: 'easeOut' as const
    }
  }
};

// ============================================
// CARD HOVER EFFECTS
// ============================================

/**
 * Standard card hover - lift + shadow
 * Use with whileHover prop
 */
export const cardHover = {
  y: -8,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
};

/**
 * Subtle card hover - smaller lift
 */
export const cardHoverSubtle = {
  y: -4,
  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)'
};

/**
 * Card hover transition
 */
export const cardTransition: Transition = {
  duration: 0.2, ease: 'easeOut' as const
};

// ============================================
// BUTTON INTERACTIONS
// ============================================

/**
 * Button hover scale
 */
export const buttonHover = {
  scale: 1.02
};

/**
 * Button tap scale
 */
export const buttonTap = {
  scale: 0.98
};

/**
 * Button transition
 */
export const buttonTransition: Transition = {
  duration: 0.15, ease: 'easeOut' as const
};

/**
 * Combined button props - spread onto motion.button
 */
export const buttonMotionProps = {
  whileHover: buttonHover,
  whileTap: buttonTap,
  transition: buttonTransition
};

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

/**
 * Fade in from bottom - use with useInView
 */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6, ease: 'easeOut' as const
    }
  }
};

/**
 * Fade in from left
 */
export const scrollRevealLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6, ease: 'easeOut' as const
    }
  }
};

/**
 * Fade in from right
 */
export const scrollRevealRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6, ease: 'easeOut' as const
    }
  }
};

// ============================================
// MODAL & OVERLAY ANIMATIONS
// ============================================

/**
 * Modal backdrop - fade in
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

/**
 * Modal content - scale up + fade
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2, ease: 'easeOut' as const
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15
    }
  }
};

/**
 * Slide up drawer
 */
export const slideUpDrawer: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    y: '100%',
    transition: {
      duration: 0.2
    }
  }
};

// ============================================
// MICRO-INTERACTION EFFECTS
// ============================================

/**
 * Success celebration - bounce
 */
export const celebrationBounce: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.5, ease: 'easeOut' as const
    }
  }
};

/**
 * Quantity change pulse
 */
export const quantityPulse: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.2
    }
  }
};

/**
 * Icon hover rotate
 */
export const iconRotate = {
  rotate: 12,
  scale: 1.1
};

/**
 * Add to cart celebration
 */
export const addToCartSuccess: Variants = {
  initial: { scale: 1, rotate: 0 },
  success: {
    scale: [1, 1.3, 1],
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.4
    }
  }
};

// ============================================
// ACCORDION / EXPAND ANIMATIONS
// ============================================

/**
 * Accordion content expand
 */
export const accordionContent: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 }
    }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.3, delay: 0.1 }
    }
  }
};

/**
 * Chevron rotation for accordion
 */
export const chevronRotate = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 }
};

// ============================================
// LOADING ANIMATIONS
// ============================================

/**
 * Skeleton shimmer effect
 * Apply as background animation
 */
export const skeletonShimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity, ease: 'easeOut' as const
    }
  }
};

/**
 * Spinner rotation
 */
export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity, ease: 'easeOut' as const
    }
  }
};

// ============================================
// IMAGE GALLERY TRANSITIONS
// ============================================

/**
 * Image fade transition
 */
export const imageFade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 }
};

/**
 * Image slide transition
 */
export const imageSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  })
};

// ============================================
// STEP / PROGRESS ANIMATIONS
// ============================================

/**
 * Step indicator check animation
 */
export const stepCheck: Variants = {
  incomplete: { scale: 1, opacity: 0.5 },
  complete: {
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  current: {
    scale: 1,
    opacity: 1,
    boxShadow: '0 0 0 4px rgba(71, 140, 11, 0.2)'
  }
};

/**
 * Step content transition
 */
export const stepContent: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3, ease: 'easeOut' as const
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create stagger delay for index
 * @param index - Item index
 * @param maxDelay - Maximum delay in seconds (default 0.3)
 */
export const staggerDelay = (index: number, maxDelay = 0.3): number => {
  return Math.min(index * 0.05, maxDelay);
};

/**
 * Get RTL-aware x direction
 * @param isRTL - Whether layout is RTL
 * @param value - Positive value for LTR direction
 */
export const rtlX = (isRTL: boolean, value: number): number => {
  return isRTL ? -value : value;
};
