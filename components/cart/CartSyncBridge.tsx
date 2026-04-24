'use client';

// CartSyncBridge
//
// Persists the cart as a "shopping list" for authenticated customers.
// - On login / access-token change: loads the saved list from the server,
//   replacing the local cart if a saved list exists.
// - On cart change: debounced PUT to /api/customer/cart.
//
// Guests (no accessToken) are unaffected — they continue with localStorage.
// Mounted once inside ClientLayout. Renders nothing.

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';

const DEBOUNCE_MS = 800;

export default function CartSyncBridge() {
  const { items, loadFromServer, syncToServer } = useCart();
  const { accessToken } = useAuth();
  const [readyToken, setReadyToken] = useState<string | null>(null);
  const loadRequestRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load once per session on login
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (!accessToken) {
      loadRequestRef.current += 1;
      setReadyToken(null);
      return;
    }

    if (readyToken === accessToken) return;

    const requestId = ++loadRequestRef.current;
    setReadyToken(null);

    (async () => {
      try {
        await loadFromServer(accessToken);
      } finally {
        if (loadRequestRef.current === requestId) {
          setReadyToken(accessToken);
        }
      }
    })();
  }, [accessToken, loadFromServer, readyToken]);

  // Debounced save on any cart mutation while logged in
  useEffect(() => {
    if (!accessToken) return;
    // Only start persisting AFTER the initial load has completed.
    if (readyToken !== accessToken) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      syncToServer(accessToken);
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [items, accessToken, readyToken, syncToServer]);

  return null;
}
