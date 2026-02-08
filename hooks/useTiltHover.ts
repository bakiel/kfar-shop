'use client';

import { useRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface TiltStyle {
  transform: string;
  backgroundImage?: string;
  transition: string;
}

const DEFAULT_STYLE: TiltStyle = {
  transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
  transition: 'transform 0.4s ease-out',
};

/**
 * Reusable tilt-on-hover hook.
 * Returns a ref to attach to the element plus mouse handlers and a style object.
 * Max tilt is ±maxDeg (default 3). Adds a subtle radial gradient highlight.
 * Respects prefers-reduced-motion.
 */
export function useTiltHover(maxDeg = 3) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [style, setStyle] = useState<TiltStyle>(DEFAULT_STYLE);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      const rotateY = (x - 0.5) * 2 * maxDeg; // -maxDeg..+maxDeg
      const rotateX = (0.5 - y) * 2 * maxDeg; // inverted for natural feel

      setStyle({
        transform: `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
        backgroundImage: `radial-gradient(circle at ${(x * 100).toFixed(0)}% ${(y * 100).toFixed(0)}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [shouldReduceMotion, maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    setStyle(DEFAULT_STYLE);
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}
