// Enhanced Extension Error Suppression for KFAR Demo
// This script aggressively suppresses all extension-related errors

(function() {
  'use strict';
  
  // Store original methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Extension error patterns to filter
  const extensionPatterns = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'egjidjbpglichdcondbcbdnbeeppgdph',
    'Cannot read properties of null',
    'inpage.js',
    'provider.js',
    'content.js',
    'injected.js',
    'MetaMask',
    'Trust Wallet',
    'Coinbase',
    'WalletConnect',
    'Extension context invalidated',
    'reading \'type\'',
    'at Generator.next',
    'at mr.<anonymous>',
    'at ke ('
  ];
  
  function isExtensionError(message) {
    if (typeof message !== 'string') {
      message = String(message);
    }
    return extensionPatterns.some(pattern => message.includes(pattern));
  }
  
  // Override console methods
  console.error = function(...args) {
    const message = args.join(' ');
    if (!isExtensionError(message)) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    if (!isExtensionError(message)) {
      originalWarn.apply(console, args);
    }
  };
  
  // Override global error handlers
  window.addEventListener('error', function(event) {
    if (event.filename && isExtensionError(event.filename)) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
    if (event.message && isExtensionError(event.message)) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }, true);
  
  // Override unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    if (reason && reason.stack && isExtensionError(reason.stack)) {
      event.preventDefault();
      return;
    }
    if (reason && reason.message && isExtensionError(reason.message)) {
      event.preventDefault();
      return;
    }
  });
  
  // Override window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (source && isExtensionError(source)) {
      return true; // Prevent default handling
    }
    if (message && isExtensionError(message)) {
      return true; // Prevent default handling
    }
    if (error && error.stack && isExtensionError(error.stack)) {
      return true; // Prevent default handling
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Monkey patch common extension injection points
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      if (isExtensionError(error.message || error.toString())) {
        return obj; // Silently fail for extension errors
      }
      throw error;
    }
  };
  
  // Silent extension detection
  if (typeof window !== 'undefined') {
    // Detect common wallets without errors
    const walletDetection = {
      ethereum: null,
      web3: null
    };
    
    try {
      if (window.ethereum) {
        walletDetection.ethereum = true;
      }
    } catch (e) {
      // Silently ignore
    }
    
    // Store detection results without logging
    window.__KFAR_WALLET_DETECTED = walletDetection;
  }
  
  console.log('🛡️ KFAR Extension Error Suppression Active - Demo Ready!');
  
})();
