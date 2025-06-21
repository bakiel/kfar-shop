'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import VoiceFirstChat to avoid SSR issues
const VoiceFirstChat = dynamic(() => import('./VoiceFirstChat'), {
  ssr: false
});

interface VoiceButtonProps {
  language?: 'en' | 'he' | 'ar';
  defaultVoice?: 'yaakov' | 'daniella';
}

export default function VoiceButton({ language = 'en', defaultVoice = 'daniella' }: VoiceButtonProps) {
  return <VoiceFirstChat language={language} defaultVoice={defaultVoice} />;
}

// Export a simple hook to add voice to any page
export function useVoiceButton() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <VoiceButton />;
}