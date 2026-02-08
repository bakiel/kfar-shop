'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2, Image as ImageIcon, X, Sparkles } from 'lucide-react';
// CSV parsing utilities (no external dependencies needed)

interface ProductRow {
  name: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
  price: number;
  category: string;
  inStock: boolean;
  ingredients?: string;
  dietaryInfo?: string;
  preparationTime?: string;
  servingSize?: string;
  imageUrl?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  products: ProductRow[];
}

interface BulkProductImportProps {
  vendorId: string;
  onImportComplete: (products: ProductRow[]) => void;
  onCancel: () => void;
}

export default function BulkProductImport({ vendorId, onImportComplete, onCancel }: BulkProductImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ProductRow[]>([]);
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);

  // Download template
  const downloadTemplate = () => {
    const headers = ['name', 'nameHe', 'description', 'descriptionHe', 'price', 'category', 'inStock', 'ingredients', 'dietaryInfo', 'preparationTime', 'servingSize', 'imageUrl'];
    const rows = [
      [
        'Organic Hummus',
        'חומוס אורגני',
        'Creamy organic hummus made with chickpeas and tahini',
        'חומוס אורגני קרמי עשוי מחומוס וטחינה',
        '22',
        'Spreads',
        'Yes',
        'Chickpeas, Tahini, Lemon, Garlic, Salt',
        'Vegan, Gluten-Free',
        'Ready to eat',
        '250g',
        'https://example.com/hummus.jpg'
      ],
      [
        'Fresh Pita Bread',
        'פיתה טרייה',
        'Soft, fresh pita bread baked daily',
        'פיתה רכה וטרייה נאפית מדי יום',
        '15',
        'Bakery',
        'Yes',
        'Flour, Water, Yeast, Salt',
        'Vegan',
        'Fresh daily',
        '6 pieces',
        ''
      ]
    ];

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kfar-product-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileType === 'csv') {
        setFile(selectedFile);
        setImportResult(null);
        processFile(selectedFile);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  // Process the uploaded file
  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await readFile(file);
      const result = validateAndParseData(data);
      
      setImportResult(result);
      if (result.success && result.products.length > 0) {
        setPreviewData(result.products.slice(0, 5)); // Show first 5 for preview
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setImportResult({
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, field: 'file', message: 'Error reading file' }],
        products: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse CSV content
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, '') || '';
        row[header] = value;
      });
      
      rows.push(row);
    }
    
    return rows;
  };

  // Read file content
  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Validate and parse data
  const validateAndParseData = (data: any[]): ImportResult => {
    const errors: ImportResult['errors'] = [];
    const products: ProductRow[] = [];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // Account for header row
      const product: Partial<ProductRow> = {};
      
      // Validate required fields
      if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
        errors.push({ row: rowNum, field: 'name', message: 'Product name is required' });
      } else {
        product.name = row.name.trim();
      }
      
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
        errors.push({ row: rowNum, field: 'price', message: 'Valid price is required' });
      } else {
        product.price = Number(row.price);
      }
      
      if (!row.category || typeof row.category !== 'string' || row.category.trim() === '') {
        errors.push({ row: rowNum, field: 'category', message: 'Category is required' });
      } else {
        product.category = row.category.trim();
      }
      
      // Parse optional fields
      product.nameHe = row.nameHe?.trim() || '';
      product.description = row.description?.trim() || '';
      product.descriptionHe = row.descriptionHe?.trim() || '';
      product.inStock = row.inStock?.toString().toLowerCase() === 'yes' || row.inStock === true;
      product.ingredients = row.ingredients?.trim() || '';
      product.dietaryInfo = row.dietaryInfo?.trim() || '';
      product.preparationTime = row.preparationTime?.trim() || '';
      product.servingSize = row.servingSize?.trim() || '';
      product.imageUrl = row.imageUrl?.trim() || '';
      
      // Only add if no errors for this row
      if (!errors.some(e => e.row === rowNum)) {
        products.push(product as ProductRow);
      }
    });
    
    return {
      success: errors.length === 0,
      totalRows: data.length,
      successCount: products.length,
      errorCount: errors.length,
      errors,
      products
    };
  };

  // Enhance products with AI
  const enhanceWithAI = async () => {
    if (!importResult?.products) return;
    
    setIsAnalyzingWithAI(true);
    
    try {
      // Simulate AI enhancement (in real app, this would call the API)
      const enhancedProducts = await Promise.all(
        importResult.products.map(async (product) => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            ...product,
            // Add AI-generated content if missing
            nameHe: product.nameHe || `${product.name} (עברית)`,
            description: product.description || `Premium ${product.name} made with quality ingredients. Perfect for health-conscious customers.`,
            descriptionHe: product.descriptionHe || `${product.name} פרימיום עשוי מחומרים איכותיים. מושלם ללקוחות שאוהבים בריאות.`,
            dietaryInfo: product.dietaryInfo || 'Vegan, Kosher',
            ingredients: product.ingredients || 'Natural ingredients',
          };
        })
      );
      
      setImportResult({
        ...importResult,
        products: enhancedProducts
      });
      
      setPreviewData(enhancedProducts.slice(0, 5));
    } catch (error) {
      console.error('Error enhancing with AI:', error);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  // Complete import
  const completeImport = () => {
    if (importResult?.products) {
      onImportComplete(importResult.products);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Bulk Product Import</h3>
        <p className="text-white/90">
          Import multiple products at once from CSV or Excel files
        </p>
      </div>

      <div className="p-6">
        {/* Step 1: Download Template */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3">Step 1: Download Template</h4>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border-2 border-leaf-green text-leaf-green rounded-lg hover:bg-leaf-green hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Use our template to ensure your data is formatted correctly
          </p>
        </div>

        {/* Step 2: Upload File */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3">Step 2: Upload Your File</h4>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setImportResult(null);
                    setShowPreview(false);
                  }}
                  className="ml-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click to upload CSV file</p>
                <p className="text-sm text-gray-500 mt-1">
                  Format: .csv (comma-separated values)
                </p>
              </>
            )}
          </div>
          
          {isProcessing && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing file...</span>
            </div>
          )}
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-3">Import Summary</h4>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{importResult.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                <p className="text-sm text-gray-600">Valid Products</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h5 className="font-semibold text-red-800">Validation Errors</h5>
                </div>
                <ul className="space-y-1 text-sm text-red-700">
                  {importResult.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>
                      Row {error.row}: {error.field} - {error.message}
                    </li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li className="font-medium">
                      ... and {importResult.errors.length - 5} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Product Preview */}
            {showPreview && previewData.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold mb-3">Product Preview</h5>
                <div className="space-y-3">
                  {previewData.map((product, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h6 className="font-medium">{product.name}</h6>
                          {product.nameHe && (
                            <p className="text-sm text-gray-600" dir="rtl">{product.nameHe}</p>
                          )}
                          <p className="text-sm text-gray-700 mt-1">{product.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-medium">₪{product.price}</span>
                            <span className="text-gray-600">{product.category}</span>
                            {product.dietaryInfo && (
                              <span className="text-green-600">{product.dietaryInfo}</span>
                            )}
                          </div>
                        </div>
                        {product.imageUrl && (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  {importResult.products.length > 5 && (
                    <p className="text-sm text-gray-600 text-center">
                      ... and {importResult.products.length - 5} more products
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* AI Enhancement */}
            {importResult.success && importResult.products.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-blue-800 mb-2">AI Enhancement Available</h5>
                <p className="text-sm text-blue-700 mb-3">
                  Our AI can automatically generate missing Hebrew translations, enhance descriptions, 
                  and add dietary information to your products.
                </p>
                <button
                  onClick={enhanceWithAI}
                  disabled={isAnalyzingWithAI}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isAnalyzingWithAI ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enhancing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Enhance with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={completeImport}
            disabled={!importResult?.success || importResult.products.length === 0}
            className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Import {importResult?.successCount || 0} Products
          </button>
        </div>
      </div>
    </div>
  );
}