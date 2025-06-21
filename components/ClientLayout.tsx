'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import ExtensionWarning from './ExtensionWarning';

// Dynamically import VoiceFirstChat for voice-first shopping experience
const VoiceFirstChat = dynamic(() => import('@/components/voice/VoiceFirstChat'), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-kfar-gold to-sun-gold-light rounded-full animate-pulse shadow-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </div>
  )
});

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      {children}
      <ExtensionWarning />
      <VoiceFirstChat />
    </>
  );
}