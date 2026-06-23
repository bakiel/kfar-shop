'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ArrowLeft, ExternalLink, Plus, Search, Star, Eye, Pencil, Pause, Play, Trash2, Package, CheckCircle, AlertTriangle, XCircle, Save } from 'lucide-react';

export default function VendorProductsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get vendor info from the authenticated session.
  useEffect(() => {
    if (authLoading) return;

    if (!accessToken || user?.role !== 'vendor' || !user.vendorId) {
      setLoading(false);
      router.replace('/vendor/login?expired=1');
      return;
    }

    setVendorId(user.vendorId);
    setVendorName(user.displayName || user.vendorId);
  }, [accessToken, authLoading, router, user?.displayName, user?.role, user?.vendorId]);

  // Helper: get auth token
  const getToken = () => accessToken || '';

  const uploadEditProductImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const token = getToken();
    if (!token) throw new Error('Please log in again before uploading images.');

    const formData = new FormData();
    Array.from(files).slice(0, 5).forEach(file => formData.append('files', file));

    setImageUploading(true);
    try {
      const res = await fetch('/api/vendor/products/images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to upload image');
      const uploaded = (data.images || []).map((image: { url: string }) => image.url).filter(Boolean);
      if (uploaded[0]) {
        setEditFormData((prev: any) => ({ ...prev, image: uploaded[0], images: uploaded }));
      }
    } finally {
      setImageUploading(false);
    }
  };

  // Fetch products from the live DB-backed vendor feed.
  useEffect(() => {
    if (!vendorId || !accessToken) return;

    const fetchProducts = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Vendor session expired. Please log in again.');
          setProducts([]);
          setFilteredProducts([]);
          return;
        }

        setError(null);
        const res = await fetch('/api/vendor/products?limit=100', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Vendor products failed: ${res.status}`);
        }

        const vendorProducts = data.products || [];

        const transformedProducts = vendorProducts.map((p: any) => {
          const isPublished = p.status === 'active' || p.status === 'published';
          const st = isPublished ? 'active' : p.status === 'archived' ? 'archived' : p.stock_quantity === 0 ? 'out-of-stock' : (p.status || 'inactive');
          return {
            id: p.id,
            name: p.name || '',
            nameHe: p.name_he || '',
            description: p.description || '',
            longDescription: p.description || '',
            price: parseFloat(p.price) || 0,
            originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
            image: p.image || '/images/placeholder-product.jpg',
            images: p.images || [p.image || '/images/placeholder-product.jpg'],
            vendor: vendorName,
            vendorId: vendorId,
            stock: parseInt(p.stock_quantity) || 0,
            inStock: isPublished && p.in_stock !== false,
            status: st,
            dbStatus: p.status || (isPublished ? 'published' : 'draft'),
            category: p.category || 'uncategorized',
            rating: 4.5,
            reviewCount: p.reviewCount || p.review_count || 0,
            kashrut: null,
            vegan: p.vegan ?? p.is_vegan ?? true,
            organic: p.organic ?? p.is_organic ?? false,
            glutenFree: p.glutenFree ?? p.is_gluten_free ?? false,
            unit: p.unit || 'piece',
            minimumOrder: 1,
            isDbProduct: true,
          };
        });

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [accessToken, vendorId, vendorName]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, products]);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Start editing a product
  const startEdit = (product: any) => {
    setEditingProduct(product.id);
    setEditFormData({
      name: product.name,
      nameHe: product.nameHe || '',
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      category: product.category,
      unit: product.unit,
      minimumOrder: product.minimumOrder,
      vegan: product.vegan,
      organic: product.organic,
      glutenFree: product.glutenFree,
      kashrut: product.kashrut || '',
      image: product.image,
      images: product.images || (product.image ? [product.image] : []),
      // New fields
      specifications: product.specifications || '',
      nutritionalInfo: product.nutritionalInfo || {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sodium: ''
      },
      allergens: product.allergens || '',
      servingSize: product.servingSize || '',
      storageInstructions: product.storageInstructions || '',
      shelfLife: product.shelfLife || '',
      preparationInstructions: product.preparationInstructions || '',
      ingredients: product.ingredients || []
    });
  };

  // Save edited product
  const saveEdit = async () => {
    const product = products.find(p => p.id === editingProduct);
    if (!product) return;
    setSaving(true);

    try {
      if (product.isDbProduct) {
        const token = getToken();
        if (!token) throw new Error('Please log in again before saving product changes.');
        const body: Record<string, any> = {
          name: editFormData.name,
          name_he: editFormData.nameHe,
          description: editFormData.description,
          price: parseFloat(editFormData.price),
          category: editFormData.category,
          unit: editFormData.unit,
          stock_quantity: parseInt(editFormData.stock) || 0,
        };
        if (editFormData.image) {
          body.image = editFormData.image;
          body.image_gallery = editFormData.images?.length ? editFormData.images : [editFormData.image];
        }

        const res = await fetch(`/api/vendor/products/${editingProduct}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update product');
      }

      // Update local state optimistically after the DB write succeeds.
      setProducts(prev => prev.map(p => {
        if (p.id === editingProduct) {
          return {
            ...p,
            ...editFormData,
            status: p.status,
            dbStatus: p.dbStatus,
            inStock: p.inStock,
          };
        }
        return p;
      }));
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({});
  };

  // Toggle product status
  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    const dbStatus = newStatus === 'active' ? 'published' : 'draft';
    const newStock = newStatus === 'active' ? (product.stock || 10) : 0;

    try {
      if (product.isDbProduct) {
        const token = getToken();
        if (!token) throw new Error('Please log in again before changing product status.');
        const res = await fetch(`/api/vendor/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: dbStatus, stock_quantity: newStock }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');
      }

      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return { ...p, status: newStatus, dbStatus, stock: newStock, inStock: newStatus === 'active' };
        }
        return p;
      }));
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      alert(error.message || 'Failed to update product status.');
    }
  };

  // Delete product (soft-delete: archives in DB)
  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const product = products.find(p => p.id === productId);

    try {
      if (product?.isDbProduct) {
        const token = getToken();
        if (!token) throw new Error('Please log in again before deleting products.');
        const res = await fetch(`/api/vendor/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product. Please try again.');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#478c0b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      {/* Enhanced Header with Navigation */}
      <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/vendor/admin">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Back to Dashboard">
              <ArrowLeft className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
            </button>
          </Link>
          <nav className="text-sm text-gray-600">
            <Link href="/vendor/admin" className="hover:text-[#478c0b]">Vendor Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Product Management</span>
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
              Product Management {vendorName && `- ${vendorName}`}
            </h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and inventory (Live Data)</p>
          {error && (
            <p className="text-red-600 mt-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 stroke-[1.5]" />
              {error}
            </p>
          )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/store/${vendorId}`} target="_blank">
              <button className="px-4 py-2 border border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4 stroke-[1.5]" />
                View Store
              </button>
            </Link>
            <Link href="/vendor/admin/products/add">
              <button className="px-6 py-2 bg-leaf-green text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[1.5]" />
                Add New Product
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Live Data Indicator */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-800 font-medium">
            Connected to Live Database - Changes will be reflected immediately on your store
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
                />
                <Search className="w-4 h-4 stroke-[1.5] absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-leaf-green focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    {editingProduct === product.id ? (
                      // Edit Mode Row
                      <tr className="border-b bg-herbal-mint/10">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-bold text-lg mb-4" style={{ color: '#3a3a1d' }}>Edit Product</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
                                  <input
                                    type="text"
                                    value={editFormData.image}
                                    onChange={(e) => setEditFormData({...editFormData, image: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                    placeholder="/images/vendors/..."
                                  />
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => uploadEditProductImages(e.target.files).catch((err) => alert(err.message || 'Failed to upload image'))}
                                    className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#478c0b] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3b7309]"
                                  />
                                  {imageUploading && (
                                    <p className="mt-1 text-xs text-gray-500">Uploading image...</p>
                                  )}
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                                  <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Hebrew)</label>
                                  <input
                                    type="text"
                                    value={editFormData.nameHe}
                                    onChange={(e) => setEditFormData({...editFormData, nameHe: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                    dir="rtl"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                  <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                                  <textarea
                                    value={editFormData.longDescription}
                                    onChange={(e) => setEditFormData({...editFormData, longDescription: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₪)</label>
                                  <input
                                    type="number"
                                    value={editFormData.price}
                                    onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₪)</label>
                                  <input
                                    type="number"
                                    value={editFormData.originalPrice}
                                    onChange={(e) => setEditFormData({...editFormData, originalPrice: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                  <input
                                    type="number"
                                    value={editFormData.stock}
                                    onChange={(e) => setEditFormData({...editFormData, stock: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                  <input
                                    type="text"
                                    value={editFormData.unit}
                                    onChange={(e) => setEditFormData({...editFormData, unit: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                  type="text"
                                  value={editFormData.category}
                                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Info</label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={editFormData.vegan}
                                      onChange={(e) => setEditFormData({...editFormData, vegan: e.target.checked})}
                                      className="rounded"
                                    />
                                    <span className="text-sm">Vegan</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={editFormData.organic}
                                      onChange={(e) => setEditFormData({...editFormData, organic: e.target.checked})}
                                      className="rounded"
                                    />
                                    <span className="text-sm">Organic</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={editFormData.glutenFree}
                                      onChange={(e) => setEditFormData({...editFormData, glutenFree: e.target.checked})}
                                      className="rounded"
                                    />
                                    <span className="text-sm">Gluten Free</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kashrut Certification</label>
                                <input
                                  type="text"
                                  value={editFormData.kashrut}
                                  onChange={(e) => setEditFormData({...editFormData, kashrut: e.target.value})}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  placeholder="e.g., Badatz Kosher"
                                />
                              </div>
                              
                            </div>
                          </div>
                          
                          {/* New fields section */}
                          <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-lg mb-4" style={{ color: '#3a3a1d' }}>Advanced Product Information</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size</label>
                                <input
                                  type="text"
                                  value={editFormData.servingSize || ''}
                                  onChange={(e) => setEditFormData({...editFormData, servingSize: e.target.value})}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  placeholder="e.g., 2 pieces (100g)"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life</label>
                                <input
                                  type="text"
                                  value={editFormData.shelfLife || ''}
                                  onChange={(e) => setEditFormData({...editFormData, shelfLife: e.target.value})}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  placeholder="e.g., 14 days refrigerated"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions</label>
                                <textarea
                                  value={editFormData.storageInstructions || ''}
                                  onChange={(e) => setEditFormData({...editFormData, storageInstructions: e.target.value})}
                                  rows={2}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  placeholder="e.g., Keep refrigerated at 2-4°C"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Instructions</label>
                                <textarea
                                  value={editFormData.preparationInstructions || ''}
                                  onChange={(e) => setEditFormData({...editFormData, preparationInstructions: e.target.value})}
                                  rows={2}
                                  className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                  placeholder="e.g., Pan fry for 3-4 minutes each side"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                              <input
                                type="text"
                                value={editFormData.allergens || ''}
                                onChange={(e) => setEditFormData({...editFormData, allergens: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                placeholder="e.g., Contains wheat, soy, nuts"
                              />
                            </div>
                            
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Product Specifications</label>
                              <textarea
                                value={editFormData.specifications || ''}
                                onChange={(e) => setEditFormData({...editFormData, specifications: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg focus:border-leaf-green focus:outline-none"
                                placeholder="Enter product specifications as JSON or key-value pairs"
                              />
                            </div>
                            
                            {/* Nutritional Information */}
                            <div className="mt-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Nutritional Information (per serving)</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Calories</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.calories || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, calories: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="220"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.protein || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, protein: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="25"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.carbs || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, carbs: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="12"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Fat (g)</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.fat || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, fat: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="8"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Fiber (g)</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.fiber || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, fiber: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="4"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sodium (mg)</label>
                                  <input
                                    type="number"
                                    value={editFormData.nutritionalInfo?.sodium || ''}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData, 
                                      nutritionalInfo: {...editFormData.nutritionalInfo, sodium: e.target.value}
                                    })}
                                    className="w-full px-2 py-1 border rounded focus:border-leaf-green focus:outline-none"
                                    placeholder="450"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-3 pt-6">
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-leaf-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {saving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 stroke-[1.5]" />
                                    Save Changes
                                  </>
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Normal Row
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={product.image}
                              alt={product.name || "Image"}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.jpg';
                              }}
                            />
                            <div>
                              <p className="font-medium" style={{ color: '#3a3a1d' }}>{product.name}</p>
                              {product.nameHe && (
                                <p className="text-sm text-gray-500" dir="rtl">{product.nameHe}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-medium" style={{ color: '#c23c09' }}>₪{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">₪{product.originalPrice}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {product.stock} {product.unit}s
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <div className="flex" style={{ color: '#f6af0d' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.reviewCount})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${product.id}`} target="_blank">
                              <button
                                className="p-2 text-gray-600 hover:text-leaf-green transition-colors"
                                title="View Product"
                              >
                                <Eye className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            </Link>
                            <button
                              onClick={() => startEdit(product)}
                              className="p-2 text-gray-600 hover:text-leaf-green transition-colors"
                              title="Edit Product"
                            >
                              <Pencil className="w-4 h-4 stroke-[1.5]" />
                            </button>
                            <button
                              onClick={() => toggleProductStatus(product.id)}
                              className="p-2 text-gray-600 hover:text-sun-gold transition-colors"
                              title="Toggle Status"
                            >
                              {product.status === 'active' ? <Pause className="w-4 h-4 stroke-[1.5]" /> : <Play className="w-4 h-4 stroke-[1.5]" />}
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-10 h-10 stroke-[1.5] text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{products.length}</p>
              </div>
              <Package className="w-6 h-6 stroke-[1.5] text-gray-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 stroke-[1.5] text-green-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock < 10 && p.stock > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 stroke-[1.5] text-orange-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <XCircle className="w-6 h-6 stroke-[1.5] text-red-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
