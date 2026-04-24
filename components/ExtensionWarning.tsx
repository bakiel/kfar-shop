'use client';

import { useEffect, useState } from 'react';

export function useExtensionDetection() {
  const [hasWalletExtension, setHasWalletExtension] = useState(false);
  const [extensionError, setExtensionError] = useState<string | null>(null);

  useEffect(() => {
    // Detect common wallet extensions
    const detectExtensions = () => {
      const extensions = {
        metamask: typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask,
        trust: typeof window !== 'undefined' && (window as any).ethereum?.isTrust,
        coinbase: typeof window !== 'undefined' && (window as any).ethereum?.isCoinbaseWallet,
        wallet: typeof window !== 'undefined' && (window as any).ethereum
      };

      const detected = Object.values(extensions).some(Boolean);
      setHasWalletExtension(detected);

      if (detected) {
        console.log('Wallet extension detected. If you experience issues, try disabling it temporarily.');
      }
    };

    // Add global error handler for extension errors
    const handleExtensionError = (event: ErrorEvent) => {
      if (event.filename?.includes('chrome-extension://') || 
          event.error?.stack?.includes('chrome-extension://')) {
        console.warn('Extension error detected and suppressed:', event.error);
        setExtensionError('Browser extension conflict detected');
        event.preventDefault();
        return false;
      }
    };

    // Add unhandled rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.stack?.includes('chrome-extension://')) {
        console.warn('Extension promise rejection suppressed:', event.reason);
        event.preventDefault();
        return false;
      }
    };

    detectExtensions();
    window.addEventListener('error', handleExtensionError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleExtensionError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return { hasWalletExtension, extensionError };
}

export default function ExtensionWarning() {
  const { hasWalletExtension, extensionError } = useExtensionDetection();

  if (!extensionError) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Extension Conflict
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            A browser extension may be causing issues. If you experience problems, try disabling wallet extensions temporarily.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}
