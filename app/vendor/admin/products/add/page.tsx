'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [product, setProduct] = useState({
    name: '',
    nameHebrew: '',
    description: '',
    descriptionHebrew: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    unit: 'unit',
    minimumOrder: '1',
    preparationTime: '20-30 mins',
    tags: [] as string[],
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      organic: false,
      rawFood: false,
      sugarFree: false,
      nutFree: false
    },
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sodium: ''
    },
    ingredients: [] as string[],
    images: [] as string[]
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    description: '',
    tags: [] as string[],
    showSuggestions: false
  });

  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  const categories = [
    'Prepared Foods',
    'Fresh Produce',
    'Frozen Foods',
    'Beverages',
    'Snacks',
    'Bakery',
    'Condiments'
  ];

  const units = [
    { value: 'unit', label: 'Unit' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'g', label: 'Gram' },
    { value: 'l', label: 'Liter' },
    { value: 'ml', label: 'Milliliter' },
    { value: 'pack', label: 'Pack' },
    { value: 'box', label: 'Box' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In production, these would be uploaded to a server
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setProduct(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = () => {
    // Simulate AI generation
    setAiSuggestions({
      description: `Experience the authentic taste of ${product.name}, crafted with love in the Village of Peace. Our ${product.category.toLowerCase()} is made from the finest plant-based ingredients, ensuring both exceptional flavor and nutritional value. Perfect for health-conscious food lovers seeking genuine vegan cuisine.`,
      tags: ['artisanal', 'handcrafted', 'healthy', 'protein-rich', 'locally-made'],
      showSuggestions: true
    });
  };

  const applyAISuggestion = () => {
    setProduct(prev => ({
      ...prev,
      description: aiSuggestions.description,
      tags: [...prev.tags, ...aiSuggestions.tags]
    }));
    setAiSuggestions(prev => ({ ...prev, showSuggestions: false }));
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setProduct(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient.trim()]
      }));
      setCurrentIngredient('');
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !product.tags.includes(currentTag.trim())) {
      setProduct(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to the API
    console.log('Submitting product:', product);
    router.push('/vendor/admin?tab=products');
  };

  return (
    <div className="min-h-screen bg-cream-base">
      {/* Header */}
      <header className="bg-white shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/admin?tab=products">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>Add New Product</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green/90 transition-colors"
            >
              Publish Product
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Basic Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name (Hebrew)
                    </label>
                    <input
                      type="text"
                      value={product.nameHebrew}
                      onChange={(e) => setProduct(prev => ({ ...prev, nameHebrew: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English) *
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                    required
                  />
                  
                  {/* AI Suggestion Button */}
                  <button
                    type="button"
                    onClick={generateAISuggestions}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-sun-gold to-sun-gold/80 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <i className="fas fa-magic mr-2"></i>
                    Generate AI Description
                  </button>

                  {/* AI Suggestions Box */}
                  {aiSuggestions.showSuggestions && (
                    <div className="mt-4 p-4 bg-herbal-mint/20 border-l-4 border-leaf-green rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-robot text-leaf-green"></i>
                          <span className="font-medium">AI Suggestion</span>
                        </div>
                        <button
                          type="button"
                          onClick={applyAISuggestion}
                          className="text-sm text-leaf-green hover:text-leaf-green/80"
                        >
                          Apply Suggestion
                        </button>
                      </div>
                      <p className="text-gray-700">{aiSuggestions.description}</p>
                      <div className="mt-2">
                        <span className="text-sm font-medium">Suggested Tags:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {aiSuggestions.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Hebrew)
                  </label>
                  <textarea
                    value={product.descriptionHebrew}
                    onChange={(e) => setProduct(prev => ({ ...prev, descriptionHebrew: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₪) *
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (₪)
                  </label>
                  <input
                    type="number"
                    value={product.originalPrice}
                    onChange={(e) => setProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => setProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={product.unit}
                    onChange={(e) => setProduct(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order
                  </label>
                  <input
                    type="number"
                    value={product.minimumOrder}
                    onChange={(e) => setProduct(prev => ({ ...prev, minimumOrder: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={product.preparationTime}
                    onChange={(e) => setProduct(prev => ({ ...prev, preparationTime: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Ingredients</h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  placeholder="Add ingredient..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green/90"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => setProduct(prev => ({
                        ...prev,
                        ingredients: prev.ingredients.filter((_, i) => i !== index)
                      }))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Nutrition Information</h2>
              <p className="text-sm text-gray-600 mb-4">Per serving</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.calories}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, calories: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.protein}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, protein: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.carbs}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, carbs: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.fat}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, fat: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.fiber}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, fiber: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mg)</label>
                  <input
                    type="number"
                    value={product.nutritionInfo.sodium}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      nutritionInfo: { ...prev.nutritionInfo, sodium: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Category & Tags</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-leaf-green focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green/90"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setProduct(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Dietary Information</h2>
              
              <div className="space-y-3">
                {Object.entries(product.dietaryInfo).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setProduct(prev => ({
                        ...prev,
                        dietaryInfo: { ...prev.dietaryInfo, [key]: e.target.checked }
                      }))}
                      className="w-4 h-4 text-leaf-green rounded"
                    />
                    <span className="text-sm">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Product Images</h2>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-leaf-green rounded-lg p-8 text-center cursor-pointer hover:border-sun-gold hover:bg-sun-gold/5 transition-all"
              >
                <i className="fas fa-cloud-upload-alt text-4xl mb-2" style={{ color: '#478c0b' }}></i>
                <p className="text-gray-600">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {product.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={index + 1 ? `Product ${index + 1}` : "Image"}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}