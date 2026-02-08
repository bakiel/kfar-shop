'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import TranslatedText from '@/components/ui/TranslatedText';

export default function TestTranslationPage() {
  const { language, setLanguage, t } = useLanguage();
  const [testText, setTestText] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Currency conversion test
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState<'ILS' | 'USD' | 'EUR'>('ILS');
  
  const currencyRates = {
    ILS: 1,
    USD: 0.27,
    EUR: 0.25,
  };
  
  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
  };

  const convertCurrency = (value: number, toCurrency: 'ILS' | 'USD' | 'EUR') => {
    const converted = value * currencyRates[toCurrency];
    return `${currencySymbols[toCurrency]}${converted.toFixed(2)}`;
  };

  const handleTranslate = async () => {
    if (!testText) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          targetLang: language === 'en' ? 'he' : 'en',
          context: 'description'
        })
      });
      
      const data = await response.json();
      setTranslatedResult(data.translatedText || 'Translation failed');
    } catch (error) {
      setTranslatedResult('Error: ' + error.message);
    }
    setIsTranslating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-herbal-mint to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-soil-brown">
          Translation & Currency Test Page
        </h1>
        
        {/* Language Toggle Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-leaf-green">
            Language Toggle Test
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === 'en' 
                  ? 'bg-leaf-green text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('he')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === 'he' 
                  ? 'bg-leaf-green text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              עברית
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current Language: <strong>{language}</strong></p>
            <p className="text-sm text-gray-600 mb-2">Direction: <strong>{language === 'he' ? 'RTL' : 'LTR'}</strong></p>
            <p className="text-sm text-gray-600">localStorage Key: <strong>kfar-language</strong></p>
          </div>
          
          <div className="mt-4 p-4 bg-herbal-mint/20 rounded-lg">
            <h3 className="font-semibold mb-2">Static Translation Test:</h3>
            <p>{t('Welcome')}</p>
            <p>{t('Add to Cart')}</p>
            <p>{t('Marketplace')}</p>
            <p>{t('Total')}</p>
          </div>
        </div>

        {/* Translation API Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-leaf-green">
            Translation API Test
          </h2>
          
          <div className="space-y-4">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-leaf-green focus:outline-none"
              rows={3}
            />
            
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !testText}
              className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Translating...' : `Translate to ${language === 'en' ? 'Hebrew' : 'English'}`}
            </button>
            
            {translatedResult && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Result:</p>
                <p className="text-lg font-medium">{translatedResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Currency Conversion Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-leaf-green">
            Currency Conversion Test
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (ILS)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-leaf-green focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              {Object.keys(currencySymbols).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr as 'ILS' | 'USD' | 'EUR')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currency === curr
                      ? 'bg-leaf-green text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Conversion Rates:</p>
              <div className="space-y-1">
                <p>₪{amount} = {convertCurrency(amount, 'USD')}</p>
                <p>₪{amount} = {convertCurrency(amount, 'EUR')}</p>
              </div>
            </div>
            
            <div className="bg-sun-gold/20 p-4 rounded-lg">
              <p className="font-semibold mb-2">Selected Currency Display:</p>
              <p className="text-2xl font-bold text-soil-brown">
                {convertCurrency(amount, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Translation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-leaf-green">
            Dynamic Content with TranslatedText Component
          </h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <TranslatedText context="store_name">People Store</TranslatedText>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <TranslatedText context="product_name">Fresh Bread</TranslatedText>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <TranslatedText context="description">
                Experience the finest products from our local vendors
              </TranslatedText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}