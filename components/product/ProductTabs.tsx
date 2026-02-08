'use client';

import React, { useState } from 'react';

interface ProductTabsProps {
  ingredients: string[];
  nutrition: Record<string, string>;
  culturalInfo: string;
  preparation: string[];
  storage: string[];
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  ingredients,
  nutrition,
  culturalInfo,
  preparation,
  storage
}) => {
  const [activeTab, setActiveTab] = useState('ingredients');

  const tabs = [
    { id: 'ingredients', label: 'Ingredients & Nutrition', icon: 'fa-leaf' },
    { id: 'cultural', label: 'Cultural Significance', icon: 'fa-globe-africa' },
    { id: 'preparation', label: 'Preparation & Storage', icon: 'fa-utensils' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex flex-wrap border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-4 font-medium text-sm sm:text-base transition-all duration-300 border-b-2 ${
              activeTab === tab.id
                ? 'border-leaf-green text-leaf-green bg-green-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Ingredients & Nutrition */}
        {activeTab === 'ingredients' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg" style={{ color: '#3a3a1d' }}>
                Ingredients:
              </h4>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <i className="fas fa-check-circle text-leaf-green mt-0.5 text-sm"></i>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg" style={{ color: '#3a3a1d' }}>
                Nutrition (per 100g):
              </h4>
              <div className="space-y-2">
                {Object.entries(nutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium" style={{ color: '#3a3a1d' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cultural Significance */}
        {activeTab === 'cultural' && (
          <div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {culturalInfo}
            </p>
            <div className="mt-6 p-4 bg-herbal-mint/20 rounded-lg border border-leaf-green/20">
              <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#478c0b' }}>
                <i className="fas fa-info-circle"></i>
                Did You Know?
              </h5>
              <p className="text-sm text-gray-600">
                The Village of Peace has been practicing sustainable vegan living since 1973, 
                making us one of the world's first and longest-standing vegan communities.
              </p>
            </div>
          </div>
        )}

        {/* Preparation & Storage */}
        {activeTab === 'preparation' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                <i className="fas fa-fire text-earth-flame"></i>
                Preparation:
              </h4>
              <ul className="space-y-2">
                {preparation.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 bg-leaf-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                <i className="fas fa-snowflake text-blue-500"></i>
                Storage:
              </h4>
              <ul className="space-y-2">
                {storage.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <i className="fas fa-box text-sun-gold mt-0.5 text-sm"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;