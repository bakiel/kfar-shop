'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  children: string;
  context?: 'store_name' | 'product_name' | 'description';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function TranslatedText({ 
  children, 
  context, 
  className,
  as: Component = 'span' 
}: TranslatedTextProps) {
  const [translated, setTranslated] = useState(children);
  const [isTranslating, setIsTranslating] = useState(false);
  const { translate } = useTranslation();
  
  // Get language from localStorage
  const language = typeof window !== 'undefined' ? 
    (localStorage.getItem('kfar-language') || 'en') as 'en' | 'he' : 'en';

  useEffect(() => {
    if (language === 'he' && children) {
      setIsTranslating(true);
      translate(children, 'he', context)
        .then(result => {
          setTranslated(result);
          setIsTranslating(false);
        })
        .catch(() => {
          setTranslated(children);
          setIsTranslating(false);
        });
    } else {
      setTranslated(children);
    }
  }, [children, language, context, translate]);

  return (
    <Component className={`${className} ${isTranslating ? 'opacity-70' : ''}`}>
      {translated}
    </Component>
  );
}