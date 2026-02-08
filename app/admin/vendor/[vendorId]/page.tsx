'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaStore, FaBox, FaEdit, FaSave, FaTrash, FaPlus,
  FaEye, FaEyeSlash, FaStar, FaDollarSign, FaArrowLeft,
  FaCheckCircle, FaExclamationCircle, FaImage
} from 'react-icons/fa';
import { vendorStores, getVendorStore, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';
import { vendorDataService, productDataService } from '@/lib/services/vendor-data-service';

// Get vendor logo helper
const getVendorLogo = (vendorId: string) => {
  const logoMap: { [key: string]: string } = {
    'teva-deli': '/images/vendors/teva_deli_logo_vegan_factory.jpg',
    'garden-of-light': '/images/vendors/Garden of Light Logo.jpg',
    'queens-cuisine': '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
    'gahn-delight': '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
    'people-store': '/images/vendors/people_store_logo_community_retail.jpg',
    'vop-shop': '/images/vendors/vop_shop_logo_village_marketplace.jpg'
  };
  return logoMap[vendorId] || '/images/vendors/default-vendor.jpg';
};

export default function VendorAdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<any>({});
  const [vendorForm, setVendorForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      const vendorData = getVendorStore(vendorId);
      const vendorProducts = getProductsByVendor(vendorId);
      
      if (!vendorData) {
        router.push('/admin');
        return;
      }

      // Get analytics
      const vendorAnalytics = await vendorDataService.getVendorAnalytics(vendorId);
      
      setVendor(vendorData);
      setProducts(vendorProducts);
      setAnalytics({
        ...vendorAnalytics,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        monthlyOrders: Math.floor(Math.random() * 200) + 50,
        conversionRate: (Math.random() * 5 + 2).toFixed(1)
      });

      setVendorForm({
        name: vendorData.name,
        description: vendorData.description,
        location: vendorData.metadata?.location || '',
        specialty: vendorData.metadata?.specialty || '',
        certifications: vendorData.metadata?.certifications?.join(', ') || ''
      });
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductEdit = (product: any) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      // New comprehensive fields
      servingSize: product.servingSize || '',
      shelfLife: product.shelfLife || '',
      storageInstructions: product.storageInstructions || '',
      preparationInstructions: product.preparationInstructions || '',
      allergens: product.allergens || '',
      specifications: product.specifications || '',
      nutritionalInfo: product.nutritionalInfo || {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sodium: ''
      }
    });
  };

  const handleProductSave = async (productId: string) => {
    try {
      setIsSaving(true);
      
      await productDataService.updateProduct({
        productId,
        vendorId,
        updates: productForm
      });

      // Reload data
      await loadVendorData();
      setEditingProduct(null);
      setProductForm({});
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductToggle = async (productId: string, inStock: boolean) => {
    try {
      await productDataService.updateProduct({
        productId,
        vendorId,
        updates: { inStock }
      });
      
      await loadVendorData();
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  const handleVendorSave = async () => {
    try {
      setIsSaving(true);
      
      await vendorDataService.updateVendor({
        vendorId,
        updates: {
          name: vendorForm.name,
          description: vendorForm.description,
          metadata: {
            location: vendorForm.location,
            specialty: vendorForm.specialty,
            certifications: vendorForm.certifications.split(',').map((c: string) => c.trim())
          }
        }
      });

      await loadVendorData();
    } catch (error) {
      console.error('Error saving vendor:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#478c0b' }}></div>
          </div>
          <p className="text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Vendor not found</p>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-4">
              <Image
                src={getVendorLogo(vendorId)}
                alt={vendor.name}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
                  {vendor.name} Dashboard
                </h1>
                <p className="text-gray-600">{vendor.metadata?.location}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${vendor.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {vendor.featured ? 'Featured' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FaBox className="text-2xl" style={{ color: '#478c0b' }} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>{analytics.totalProducts}</p>
            <p className="text-sm text-gray-600">Products</p>
            <p className="text-xs mt-1" style={{ color: '#478c0b' }}>
              {analytics.activeProducts} active
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FaDollarSign className="text-2xl" style={{ color: '#f6af0d' }} />
              <span className="text-sm text-gray-500">Monthly</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
              ₪{analytics.revenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FaStar className="text-2xl" style={{ color: '#c23c09' }} />
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
              {analytics.averageRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FaEye className="text-2xl" style={{ color: '#478c0b' }} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
              {analytics.totalViews.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Views</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b">
            <div className="flex gap-8 px-6">
              {['overview', 'products', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? 'border-current'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ color: activeTab === tab ? '#478c0b' : undefined }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
                    Top Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.topProducts.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600">₪{product.price}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                        {analytics.conversionRate}%
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Monthly Orders</p>
                      <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                        {analytics.monthlyOrders}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                        ₪{Math.floor(analytics.revenue / analytics.monthlyOrders)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: '#3a3a1d' }}>
                    Products ({products.length})
                  </h3>
                  <button
                    className="px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all hover:scale-105"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <FaPlus />
                    Add Product
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      {editingProduct === product.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Name</label>
                              <input
                                type="text"
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Price</label>
                              <input
                                type="number"
                                value={productForm.price}
                                onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              value={productForm.description}
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg"
                              rows={3}
                            />
                          </div>
                          
                          {/* Advanced Product Information */}
                          <div className="border-t pt-4 mt-4">
                            <h5 className="font-medium mb-3 text-sm">Product Details</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">Serving Size</label>
                                <input
                                  type="text"
                                  value={productForm.servingSize || ''}
                                  onChange={(e) => setProductForm({ ...productForm, servingSize: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="e.g., 2 pieces"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Shelf Life</label>
                                <input
                                  type="text"
                                  value={productForm.shelfLife || ''}
                                  onChange={(e) => setProductForm({ ...productForm, shelfLife: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="e.g., 14 days"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Storage</label>
                                <input
                                  type="text"
                                  value={productForm.storageInstructions || ''}
                                  onChange={(e) => setProductForm({ ...productForm, storageInstructions: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="Keep refrigerated"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Allergens</label>
                                <input
                                  type="text"
                                  value={productForm.allergens || ''}
                                  onChange={(e) => setProductForm({ ...productForm, allergens: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="Contains wheat, soy"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Nutritional Information */}
                          <div className="border-t pt-4 mt-4">
                            <h5 className="font-medium mb-3 text-sm">Nutritional Info (per serving)</h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs mb-1">Calories</label>
                                <input
                                  type="number"
                                  value={productForm.nutritionalInfo?.calories || ''}
                                  onChange={(e) => setProductForm({
                                    ...productForm,
                                    nutritionalInfo: { ...productForm.nutritionalInfo, calories: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-1">Protein (g)</label>
                                <input
                                  type="number"
                                  value={productForm.nutritionalInfo?.protein || ''}
                                  onChange={(e) => setProductForm({
                                    ...productForm,
                                    nutritionalInfo: { ...productForm.nutritionalInfo, protein: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-1">Carbs (g)</label>
                                <input
                                  type="number"
                                  value={productForm.nutritionalInfo?.carbs || ''}
                                  onChange={(e) => setProductForm({
                                    ...productForm,
                                    nutritionalInfo: { ...productForm.nutritionalInfo, carbs: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleProductSave(product.id)}
                              disabled={isSaving}
                              className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                              style={{ backgroundColor: '#478c0b' }}
                            >
                              <FaSave />
                              Save All Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(null);
                                setProductForm({});
                              }}
                              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600">{product.category}</p>
                              <p className="text-lg font-semibold" style={{ color: '#478c0b' }}>
                                ₪{product.price}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProductToggle(product.id, !product.inStock)}
                              className={`p-2 rounded-lg ${
                                product.inStock ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {product.inStock ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button
                              onClick={() => handleProductEdit(product)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-2">Vendor Name</label>
                  <input
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={vendorForm.description}
                    onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={vendorForm.location}
                    onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Specialty</label>
                  <input
                    type="text"
                    value={vendorForm.specialty}
                    onChange={(e) => setVendorForm({ ...vendorForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    value={vendorForm.certifications}
                    onChange={(e) => setVendorForm({ ...vendorForm, certifications: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Kosher Parve, Vegan Certified"
                  />
                </div>

                <button
                  onClick={handleVendorSave}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg text-white flex items-center gap-2"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <FaSave />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}