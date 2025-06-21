'use client';

import React, { useState } from 'react';
import { useTranslation, useBilingualForm, useBatchTranslation } from '@/hooks/useTranslation';
import TranslationIndicator, { TranslationBadge } from '@/components/ui/TranslationIndicator';

interface TestFormData {
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
}

export default function TranslationTestPage() {
  const { translate, translateDebounced, translations, isTranslating, error } = useTranslation();
  const { translateBatch, isTranslating: isBatchTranslating, error: batchError } = useBatchTranslation();
  
  // Test direct translation
  const [testText, setTestText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState<'he' | 'en'>('he');
  
  // Test bilingual form
  const initialFormData: TestFormData = {
    title: '',
    titleHe: '',
    description: '',
    descriptionHe: ''
  };
  
  const {
    values: formData,
    handleFieldChange,
    autoTranslate,
    setAutoTranslate,
    isTranslating: isFormTranslating
  } = useBilingualForm<TestFormData>(initialFormData, [
    { english: 'title', hebrew: 'titleHe', context: 'store_name' },
    { english: 'description', hebrew: 'descriptionHe', context: 'description' }
  ]);
  
  // Test batch translation
  const [batchResults, setBatchResults] = useState<Record<string, string>>({});
  
  const handleDirectTranslate = async () => {
    const result = await translate(testText, targetLang);
    setTranslatedText(result);
  };
  
  const handleBatchTranslate = async () => {
    const items = [
      { id: '1', text: 'Organic Vegetables', context: 'product_name' as const },
      { id: '2', text: 'Fresh Daily', context: 'tag' as const },
      { id: '3', text: 'Our store offers the finest selection of organic produce', context: 'description' as const }
    ];
    
    const results = await translateBatch(items, 'he');
    setBatchResults(results);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Translation API Test Page</h1>
        
        {/* Direct Translation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Direct Translation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text to translate:</label>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter text to translate..."
              />
            </div>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Target Language:</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as 'he' | 'en')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="he">Hebrew</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <button
                onClick={handleDirectTranslate}
                disabled={!testText || isTranslating}
                className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark disabled:bg-gray-300 flex items-center gap-2"
              >
                {isTranslating && <i className="fas fa-spinner fa-spin"></i>}
                Translate
              </button>
            </div>
            
            {translatedText && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-1">Translation:</p>
                <p className="text-lg">{translatedText}</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                Error: {error}
              </div>
            )}
          </div>
        </div>
        
        {/* Bilingual Form Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Bilingual Form with Auto-Translation</h2>
          
          <div className="mb-4 flex items-center justify-between">
            <TranslationBadge active={autoTranslate} />
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Enable auto-translation</span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title (English)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter title in English..."
                />
                <TranslationIndicator isTranslating={isFormTranslating} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Title (Hebrew)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.titleHe}
                  onChange={(e) => handleFieldChange('titleHe', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-right"
                  placeholder="כותרת בעברית..."
                  dir="rtl"
                />
                <TranslationIndicator isTranslating={isFormTranslating} position="left" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description (English)</label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter description in English..."
                />
                <TranslationIndicator isTranslating={isFormTranslating} top="top-3" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description (Hebrew)</label>
              <div className="relative">
                <textarea
                  value={formData.descriptionHe}
                  onChange={(e) => handleFieldChange('descriptionHe', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-right"
                  rows={3}
                  placeholder="תיאור בעברית..."
                  dir="rtl"
                />
                <TranslationIndicator isTranslating={isFormTranslating} position="left" top="top-3" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Batch Translation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Batch Translation</h2>
          
          <button
            onClick={handleBatchTranslate}
            disabled={isBatchTranslating}
            className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark disabled:bg-gray-300 flex items-center gap-2 mb-4"
          >
            {isBatchTranslating && <i className="fas fa-spinner fa-spin"></i>}
            Translate Batch
          </button>
          
          {Object.keys(batchResults).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Batch Results:</p>
              {Object.entries(batchResults).map(([id, translation]) => (
                <div key={id} className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Item {id}:</p>
                  <p className="font-medium">{translation}</p>
                </div>
              ))}
            </div>
          )}
          
          {batchError && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              Batch Error: {batchError}
            </div>
          )}
        </div>
        
        {/* Debounced Translation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">4. Debounced Translation</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              onChange={(e) => translateDebounced('test-key', e.target.value, 'he', { debounceMs: 1000 })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Type to see debounced translation (1 second delay)..."
            />
            
            {translations['test-key'] && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-1">Debounced Result:</p>
                <p className="text-lg">{translations['test-key'].translatedText}</p>
                {translations['test-key'].isTranslating && (
                  <p className="text-sm text-gray-600 mt-2">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Translating...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}