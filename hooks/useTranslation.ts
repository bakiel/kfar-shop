import { useState, useCallback, useRef, useEffect } from 'react';
import { TranslationRequest, TranslationResponse, TranslationError } from '@/lib/types/translation';

interface UseTranslationReturn {
  translate: (text: string, targetLang: 'he' | 'en', context?: TranslationRequest['context']) => Promise<string>;
  translateDebounced: (key: string, text: string, targetLang: 'he' | 'en', options?: TranslationOptions) => void;
  translations: Record<string, TranslationResult>;
  isTranslating: boolean;
  error: string | null;
}

interface TranslationOptions {
  context?: TranslationRequest['context'];
  cache?: boolean;
  debounceMs?: number;
}

interface TranslationResult {
  translatedText: string;
  isTranslating: boolean;
  error: string | null;
}

// Simple in-memory cache for translations
const translationCache = new Map<string, string>();

export function useTranslation(): UseTranslationReturn {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, TranslationResult>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const translate = useCallback(async (
    text: string, 
    targetLang: 'he' | 'en', 
    context?: TranslationRequest['context']
  ): Promise<string> => {
    // Don't translate empty strings
    if (!text.trim()) return text;

    // Create cache key
    const cacheKey = `${text}:${targetLang}:${context || 'none'}`;
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          context
        } as TranslationRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as TranslationError;
        throw new Error(errorData.error || 'Translation failed');
      }

      const translationData = data as TranslationResponse;
      const translatedText = translationData.translatedText;
      
      // Cache the result
      translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation error';
      setError(errorMessage);
      console.error('Translation error:', err);
      // Return original text on error
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateDebounced = useCallback((
    key: string,
    text: string,
    targetLang: 'he' | 'en',
    options: TranslationOptions = {}
  ) => {
    const { debounceMs = 500, context, cache = true } = options;
    
    // Clear existing timer
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    
    // Update state to show loading
    setTranslations(prev => ({
      ...prev,
      [key]: {
        translatedText: prev[key]?.translatedText || '',
        isTranslating: true,
        error: null
      }
    }));
    
    // Set new timer
    debounceTimers.current[key] = setTimeout(async () => {
      try {
        const translatedText = await translate(text, targetLang, context);
        
        setTranslations(prev => ({
          ...prev,
          [key]: {
            translatedText,
            isTranslating: false,
            error: null
          }
        }));
      } catch (error) {
        setTranslations(prev => ({
          ...prev,
          [key]: {
            translatedText: text,
            isTranslating: false,
            error: 'Translation failed'
          }
        }));
      }
    }, debounceMs);
  }, [translate]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  return {
    translate,
    translateDebounced,
    translations,
    isTranslating,
    error
  };
}

// Batch translation hook for multiple items
export function useBatchTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateBatch = useCallback(async (
    items: Array<{ id: string; text: string; context?: TranslationRequest['context'] }>,
    targetLang: 'he' | 'en'
  ): Promise<Record<string, string>> => {
    setIsTranslating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: items, targetLang })
      });
      
      if (!response.ok) {
        throw new Error('Batch translation failed');
      }
      
      const data = await response.json();
      const results: Record<string, string> = {};
      
      data.results.forEach((result: any) => {
        results[result.id] = result.translatedText || result.originalText;
      });
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch translation error';
      setError(errorMessage);
      console.error('Batch translation error:', err);
      
      // Return original texts on error
      const fallback: Record<string, string> = {};
      items.forEach(item => {
        fallback[item.id] = item.text;
      });
      return fallback;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return {
    translateBatch,
    isTranslating,
    error
  };
}

/**
 * Hook for managing bilingual form fields
 */
export function useBilingualForm<T extends Record<string, any>>(
  initialValues: T,
  fieldMappings: Array<{ english: keyof T; hebrew: keyof T; context?: TranslationRequest['context'] }>
) {
  const { translateDebounced, translations } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [autoTranslate, setAutoTranslate] = useState(true);

  /**
   * Handle field change with auto-translation
   */
  const handleFieldChange = useCallback((
    field: keyof T,
    value: any
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (!autoTranslate || typeof value !== 'string' || !value.trim()) return;
    
    // Find if this field has a translation pair
    const mapping = fieldMappings.find(m => 
      m.english === field || m.hebrew === field
    );
    
    if (mapping) {
      const isHebrewField = field === mapping.hebrew;
      const targetField = isHebrewField ? mapping.english : mapping.hebrew;
      const targetLang = isHebrewField ? 'en' : 'he';
      
      translateDebounced(
        String(targetField),
        value,
        targetLang,
        { context: mapping.context }
      );
    }
  }, [fieldMappings, autoTranslate, translateDebounced]);

  /**
   * Apply translations to form values
   */
  useEffect(() => {
    const updatedValues = { ...values };
    let hasChanges = false;
    
    Object.entries(translations).forEach(([field, result]) => {
      if (!result.isTranslating && result.translatedText && !result.error) {
        if (updatedValues[field as keyof T] !== result.translatedText) {
          updatedValues[field as keyof T] = result.translatedText as any;
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setValues(updatedValues);
    }
  }, [translations]);

  return {
    values,
    setValues,
    handleFieldChange,
    autoTranslate,
    setAutoTranslate,
    isTranslating: Object.values(translations).some(t => t.isTranslating)
  };
}