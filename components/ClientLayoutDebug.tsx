'use client';

import { ReactNode, useEffect, useState } from 'react';
import KfarChatWidget from '@/components/chat/KfarChatWidget';

interface ClientLayoutDebugProps {
  children: ReactNode;
}

export default function ClientLayoutDebug({ children }: ClientLayoutDebugProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('ClientLayoutDebug mounted');
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <>
          <KfarChatWidget />
          {/* Debug indicator */}
          <div className="fixed bottom-24 left-4 bg-red-500 text-white p-2 rounded z-50 text-xs">
            Chat Widget: {mounted ? 'Mounted' : 'Not Mounted'}
          </div>
        </>
      )}
    </>
  );
}