export interface TranslationRequest {
  text: string;
  targetLang: 'he' | 'en';
  context?: 'store_name' | 'product_name' | 'description';
}

export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  targetLang: 'he' | 'en';
  context?: string;
}

export interface TranslationError {
  error: string;
  details?: string;
}