'use client';

import { useEffect } from 'react';

export default function SuppressHydrationWarning() {
  useEffect(() => {
    // Only in development, suppress hydration warnings caused by browser extensions
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          args[0]?.includes?.('hydrated') && 
          args[0]?.includes?.('webcrx')
        ) {
          // Suppress hydration warnings caused by browser extensions
          console.warn(
            '⚠️ Hydration warning suppressed: Browser extension (webcrx) is modifying the DOM. ' +
            'This is not a code issue. Consider disabling the extension for development.'
          );
          return;
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return null;
}