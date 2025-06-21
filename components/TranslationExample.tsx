'use client';

import React, { useState } from 'react';
import { useTranslation, useBatchTranslation } from '@/hooks/useTranslation';

export function TranslationExample() {
  const { translate, isTranslating, error } = useTranslation();
  const { translateBatch, isTranslating: isBatchTranslating } = useBatchTranslation();
  
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState<'he' | 'en'>('he');

  // Example store and product data
  const [storeExample] = useState({
    name: 'Teva Deli',
    description: 'Premium vegan deli products made with love in the Village of Peace'
  });

  const [productExamples] = useState([
    { text: 'Vegan Schnitzel', context: 'product_name' as const },
    { text: 'Plant-Based Shawarma', context: 'product_name' as const },
    { text: 'Organic Hummus Spread', context: 'product_name' as const }
  ]);

  const handleTranslate = async () => {
    const result = await translate(inputText, targetLang, 'description');
    setTranslatedText(result);
  };

  const handleTranslateStore = async () => {
    const [name, description] = await translateBatch([
      { text: storeExample.name, context: 'store_name' },
      { text: storeExample.description, context: 'description' }
    ], targetLang);

    alert(`Store Name: ${name}\nDescription: ${description}`);
  };

  const handleTranslateProducts = async () => {
    const translations = await translateBatch(productExamples, targetLang);
    const message = productExamples.map((product, index) => 
      `${product.text} → ${translations[index]}`
    ).join('\n');
    alert(message);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Translation API Example</h2>
      
      {/* Language Selection */}
      <div className="flex gap-4 items-center">
        <label>Target Language:</label>
        <select 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value as 'he' | 'en')}
          className="px-3 py-2 border rounded"
        >
          <option value="he">Hebrew</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Manual Translation */}
      <div className="space-y-4 p-4 border rounded">
        <h3 className="font-semibold">Manual Translation</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full p-3 border rounded min-h-[100px]"
        />
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
        {translatedText && (
          <div className="p-3 bg-gray-100 rounded">
            <strong>Translation:</strong> {translatedText}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
      </div>

      {/* Store Translation Example */}
      <div className="space-y-4 p-4 border rounded">
        <h3 className="font-semibold">Store Translation Example</h3>
        <div className="text-sm text-gray-600">
          <p>Store: {storeExample.name}</p>
          <p>Description: {storeExample.description}</p>
        </div>
        <button
          onClick={handleTranslateStore}
          disabled={isBatchTranslating}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {isBatchTranslating ? 'Translating...' : 'Translate Store Info'}
        </button>
      </div>

      {/* Product Translation Example */}
      <div className="space-y-4 p-4 border rounded">
        <h3 className="font-semibold">Product Translation Example</h3>
        <div className="text-sm text-gray-600">
          {productExamples.map((product, index) => (
            <p key={index}>{product.text}</p>
          ))}
        </div>
        <button
          onClick={handleTranslateProducts}
          disabled={isBatchTranslating}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          {isBatchTranslating ? 'Translating...' : 'Translate Products'}
        </button>
      </div>
    </div>
  );
}