// Extension error suppression script
// Add this to suppress common wallet extension errors

(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console.error to filter extension errors
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Filter out known extension error patterns
    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'Cannot read properties of null',
      'inpage.js',
      'provider.js',
      'MetaMask',
      'Trust Wallet'
    ];
    
    const isExtensionError = extensionPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (!isExtensionError) {
      originalError.apply(console, args);
    } else {
      // Log to a separate namespace for debugging if needed
      console.debug('Extension error suppressed:', ...args);
    }
  };
  
  // Override window.onerror for extension errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof source === 'string' && source.includes('chrome-extension://')) {
      console.debug('Extension error suppressed:', { message, source, lineno, colno, error });
      return true; // Prevent default error handling
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Override unhandled promise rejections
  const originalOnRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    if (reason && reason.stack && reason.stack.includes('chrome-extension://')) {
      console.debug('Extension promise rejection suppressed:', reason);
      event.preventDefault();
      return;
    }
    
    if (originalOnRejection) {
      return originalOnRejection.call(this, event);
    }
  };
  
})();
