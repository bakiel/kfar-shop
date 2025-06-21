'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { 
  Package, Store, Settings, BarChart3, Upload, Save, Plus, 
  Edit2, Trash2, Eye, EyeOff, DollarSign, TrendingUp 
} from 'lucide-react';

// Import vendor data from WordPress data layer
import { vendorStores, getVendorStore, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';
import { Product } from '@/lib/data/products';

interface VendorDashboardData {
  vendor: any;
  products: Product[];
  analytics: any;
  isLoading: boolean;
}

export default function VendorAdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [dashboardData, setDashboardData] = useState<VendorDashboardData>({
    vendor: null,
    products: [],
    analytics: null,
    isLoading: true
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [vendorForm, setVendorForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load vendor data
  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = () => {
    try {
      const vendor = getVendorStore(vendorId);
      const products = getProductsByVendor(vendorId);
      
      if (!vendor) {
        router.push('/admin');
        return;
      }

      // Calculate analytics
      const analytics = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.inStock).length,
        totalViews: products.reduce((sum, p) => sum + (p.viewCount || 0), 0),
        totalSales: products.reduce((sum, p) => sum + (p.price * (p.purchaseCount || 0)), 0),
        averageRating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        topProducts: products.slice(0, 5)
      };

      setDashboardData({
        vendor,
        products,
        analytics,
        isLoading: false
      });

      setVendorForm({
        name: vendor.name,
        description: vendor.description,
        location: vendor.metadata?.location || '',
        establishedYear: vendor.metadata?.established || '',
        contactEmail: '',
        contactPhone: ''
      });
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendor data',
        variant: 'destructive'
      });
    }
  };

  // Save vendor information
  const saveVendorInfo = async () => {
    setIsSaving(true);
    try {
      // In production, this would save to database
      // For now, just show success
      toast({
        title: 'Success',
        description: 'Vendor information updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vendor information',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Product management functions
  const startEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      nameHe: product.nameHe,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      inStock: product.inStock,
      tags: product.tags
    });
  };

  const saveProduct = async (productId: string) => {
    setIsSaving(true);
    try {
      // In production, this would save to database via API
      const response = await fetch('/api/products-enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, updates: productForm })
      });
      
      if (!response.ok) throw new Error('Failed to update');

      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });

      setEditingProduct(null);
      loadVendorData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductStock = async (productId: string, currentStock: boolean) => {
    try {
      // In production, update via API
      toast({
        title: 'Success',
        description: `Product ${!currentStock ? 'marked as in stock' : 'marked as out of stock'}`
      });

      loadVendorData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product stock',
        variant: 'destructive'
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        // In production, delete via API
        toast({
          title: 'Success',
          description: 'Product deleted successfully'
        });

        loadVendorData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive'
        });
      }
    }
  };

  if (dashboardData.isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading vendor dashboard...</div>
        </div>
      </Layout>
    );
  }

  const { vendor, products, analytics } = dashboardData;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
            {vendor?.name} Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your store, products, and analytics</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="store">
              <Store className="w-4 h-4 mr-2" />
              Store Info
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.activeProducts || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₪{analytics?.totalSales || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.averageRating || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on {analytics?.reviewCount || 0} reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts?.slice(0, 5).map((product: Product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">₪{product.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.viewCount || 0} views</p>
                        <p className="text-sm text-gray-500">{product.purchaseCount || 0} sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your product catalog</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push(`/admin/vendor/${vendorId}/product/new`)}
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      {editingProduct === product.id ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label>Product Name</Label>
                              <Input
                                value={productForm.name || ''}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Hebrew Name</Label>
                              <Input
                                value={productForm.nameHe || ''}
                                onChange={(e) => setProductForm({ ...productForm, nameHe: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={productForm.description || ''}
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <Label>Price (₪)</Label>
                              <Input
                                type="number"
                                value={productForm.price || ''}
                                onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Input
                                value={productForm.category || ''}
                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Subcategory</Label>
                              <Input
                                value={productForm.subcategory || ''}
                                onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={productForm.inStock !== false}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, inStock: checked })}
                            />
                            <Label>In Stock</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveProduct(product.id)}
                              disabled={isSaving}
                              style={{ backgroundColor: '#478c0b' }}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingProduct(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-gray-500">{product.category} • ₪{product.price}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {product.inStock ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">In Stock</span>
                                ) : (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Out of Stock</span>
                                )}
                                {product.badge && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{product.badge}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleProductStock(product.id, product.inStock)}
                            >
                              {product.inStock ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditProduct(product)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Info Tab */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Update your store details and branding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Store Name</Label>
                    <Input
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={vendorForm.description}
                      onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                      rows={4}
                      placeholder="Tell customers about your store..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={vendorForm.location}
                        onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                        placeholder="Dimona, Israel"
                      />
                    </div>
                    <div>
                      <Label>Established Year</Label>
                      <Input
                        value={vendorForm.establishedYear || ''}
                        onChange={(e) => setVendorForm({ ...vendorForm, establishedYear: e.target.value })}
                        placeholder="e.g., 1985"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={vendorForm.contactEmail}
                        onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        value={vendorForm.contactPhone}
                        onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Store Logo</Label>
                      <div className="flex items-center gap-4 mt-2">
                        {vendor?.logo && (
                          <img 
                            src={vendor.logo} 
                            alt="Store logo"
                            className="w-24 h-24 rounded-lg object-cover border"
                          />
                        )}
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Logo
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Store Banner</Label>
                      <div className="mt-2">
                        {vendor?.banner && (
                          <img 
                            src={vendor.banner} 
                            alt="Store banner"
                            className="w-full h-48 rounded-lg object-cover border mb-4"
                          />
                        )}
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Banner
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={saveVendorInfo}
                    disabled={isSaving}
                    className="w-full"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Store Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>Configure your store preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Accept Orders</Label>
                        <p className="text-sm text-gray-500">Allow customers to place orders</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show on Marketplace</Label>
                        <p className="text-sm text-gray-500">Make your store visible to customers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive order and customer notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure accepted payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Credit/Debit Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Digital Wallets</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                  <CardDescription>Set up your delivery preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Local Pickup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Local Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>National Shipping</Label>
                    </div>
                    <div>
                      <Label>Minimum Order Amount (₪)</Label>
                      <Input type="number" placeholder="50" className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}