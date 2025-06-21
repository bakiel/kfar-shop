'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, Package, Truck, Info, Clock, ChefHat, Edit2, Save, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface ProductExtendedData {
  specifications: {
    weight: string
    dimensions: string
    servings: string
    shelf_life: string
    ingredients: string[]
    allergens: string[]
    certifications: string[]
  }
  shipping_info: {
    weight: string
    dimensions: string
    requires_refrigeration: boolean
    shipping_class: string
  }
  storage_instructions: string
  preparation: {
    cooking_methods: string[]
    prep_time: string
    cook_time: string
    serving_suggestions: string[]
  }
  nutritional_highlights: string[]
  seo: {
    meta_title: string
    meta_description: string
    keywords: string[]
  }
}

interface Product {
  id: string
  name: string
  nameHe?: string
  price: number
  category: string
  description: string
  shortDescription?: string
  image: string
  vendorId: string
  vendorName: string
  isVegan: boolean
  isKosher: boolean
  extendedData?: ProductExtendedData
}

export default function EnhancedProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVendorOwner, setIsVendorOwner] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProduct()
    checkUserPermissions()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (!response.ok) throw new Error('Product not found')
      const data = await response.json()
      setProduct(data)
      setEditedProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUserPermissions = async () => {
    try {
      const response = await fetch('/api/user/permissions')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isSuperAdmin)
        setIsVendorOwner(data.vendorId === product?.vendorId)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProduct)
      })
      
      if (!response.ok) throw new Error('Failed to update product')
      
      const updated = await response.json()
      setProduct(updated)
      setEditMode(false)
      toast({
        title: "Success",
        description: "Product updated successfully"
      })
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    }
  }

  const handleAddToCart = () => {
    // Add to cart logic
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product?.name} added to your cart`
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Product not found</p>
            <Button onClick={() => router.push('/marketplace')} className="mt-4">
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = isAdmin || (isVendorOwner && product.vendorId === editedProduct?.vendorId)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <a href="/marketplace" className="hover:text-primary">Marketplace</a>
        <span className="mx-2">/</span>
        <a href={`/vendors/${product.vendorId}`} className="hover:text-primary">{product.vendorName}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Admin Edit Controls */}
      {canEdit && (
        <div className="mb-4 flex justify-end gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={() => {
                  setEditMode(false)
                  setEditedProduct(product)
                }} 
                variant="outline" 
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.isVegan && (
            <Badge className="absolute top-4 left-4 bg-green-600">Vegan</Badge>
          )}
          {product.isKosher && (
            <Badge className="absolute top-4 right-4 bg-blue-600">Kosher</Badge>
          )}
        </div>

        {/* Product Info */}
        <div>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={editedProduct?.name || ''}
                  onChange={(e) => setEditedProduct(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              <div>
                <Label>Hebrew Name</Label>
                <Input
                  value={editedProduct?.nameHe || ''}
                  onChange={(e) => setEditedProduct(prev => prev ? {...prev, nameHe: e.target.value} : null)}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>Price (₪)</Label>
                <Input
                  type="number"
                  value={editedProduct?.price || 0}
                  onChange={(e) => setEditedProduct(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                />
              </div>
              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={editedProduct?.shortDescription || ''}
                  onChange={(e) => setEditedProduct(prev => prev ? {...prev, shortDescription: e.target.value} : null)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Full Description</Label>
                <Textarea
                  value={editedProduct?.description || ''}
                  onChange={(e) => setEditedProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.nameHe && (
                <h2 className="text-xl text-muted-foreground mb-4" dir="rtl">{product.nameHe}</h2>
              )}
              <p className="text-2xl font-semibold text-primary mb-4">₪{product.price.toFixed(2)}</p>
              <p className="text-muted-foreground mb-6">
                {product.shortDescription || product.description}
              </p>

              {/* Add to Cart Section */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </>
          )}

          {/* Product Details Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specs</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode && isAdmin ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Ingredients</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.specifications?.ingredients?.join(', ') || ''}
                          onChange={(e) => {
                            const ingredients = e.target.value.split(',').map(i => i.trim())
                            setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                specifications: {
                                  ...prev!.extendedData!.specifications,
                                  ingredients
                                }
                              }
                            }))
                          }}
                          placeholder="Comma-separated ingredients"
                        />
                      </div>
                      <div>
                        <Label>Nutritional Highlights</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.nutritional_highlights?.join(', ') || ''}
                          onChange={(e) => {
                            const highlights = e.target.value.split(',').map(h => h.trim())
                            setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                nutritional_highlights: highlights
                              }
                            }))
                          }}
                          placeholder="Comma-separated highlights"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-4">{product.description}</p>
                      {product.extendedData?.specifications?.ingredients && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Ingredients:</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.extendedData.specifications.ingredients.join(', ')}
                          </p>
                        </div>
                      )}
                      {product.extendedData?.nutritional_highlights && (
                        <div>
                          <h4 className="font-semibold mb-2">Nutritional Highlights:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {product.extendedData.nutritional_highlights.map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode && isAdmin ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Weight</Label>
                          <Input
                            value={editedProduct?.extendedData?.specifications?.weight || ''}
                            onChange={(e) => setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                specifications: {
                                  ...prev!.extendedData!.specifications,
                                  weight: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Servings</Label>
                          <Input
                            value={editedProduct?.extendedData?.specifications?.servings || ''}
                            onChange={(e) => setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                specifications: {
                                  ...prev!.extendedData!.specifications,
                                  servings: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Shelf Life</Label>
                        <Input
                          value={editedProduct?.extendedData?.specifications?.shelf_life || ''}
                          onChange={(e) => setEditedProduct(prev => ({
                            ...prev!,
                            extendedData: {
                              ...prev!.extendedData!,
                              specifications: {
                                ...prev!.extendedData!.specifications,
                                shelf_life: e.target.value
                              }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Allergens</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.specifications?.allergens?.join(', ') || ''}
                          onChange={(e) => {
                            const allergens = e.target.value.split(',').map(a => a.trim())
                            setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                specifications: {
                                  ...prev!.extendedData!.specifications,
                                  allergens
                                }
                              }
                            }))
                          }}
                          placeholder="Comma-separated allergens"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-muted-foreground">
                          {product.extendedData?.specifications?.weight || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Servings</p>
                        <p className="text-muted-foreground">
                          {product.extendedData?.specifications?.servings || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Shelf Life</p>
                        <p className="text-muted-foreground">
                          {product.extendedData?.specifications?.shelf_life || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Allergens</p>
                        <p className="text-muted-foreground">
                          {product.extendedData?.specifications?.allergens?.join(', ') || 'None'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Certifications</p>
                        <div className="flex gap-2 mt-1">
                          {product.isVegan && <Badge variant="secondary">Vegan Certified</Badge>}
                          {product.isKosher && <Badge variant="secondary">Kosher Certified</Badge>}
                          {product.extendedData?.specifications?.certifications?.map((cert, idx) => (
                            <Badge key={idx} variant="secondary">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping & Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editMode && isAdmin ? (
                    <>
                      <div>
                        <Label>Storage Instructions</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.storage_instructions || ''}
                          onChange={(e) => setEditedProduct(prev => ({
                            ...prev!,
                            extendedData: {
                              ...prev!.extendedData!,
                              storage_instructions: e.target.value
                            }
                          }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedProduct?.extendedData?.shipping_info?.requires_refrigeration || false}
                          onChange={(e) => setEditedProduct(prev => ({
                            ...prev!,
                            extendedData: {
                              ...prev!.extendedData!,
                              shipping_info: {
                                ...prev!.extendedData!.shipping_info,
                                requires_refrigeration: e.target.checked
                              }
                            }
                          }))}
                        />
                        <Label>Requires Refrigeration</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Storage Instructions:</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.extendedData?.storage_instructions || 'Store in a cool, dry place'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Shipping Information:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Shipping Weight: {product.extendedData?.shipping_info?.weight || 'Standard'}</li>
                          <li>• Shipping Class: {product.extendedData?.shipping_info?.shipping_class || 'Standard'}</li>
                          {product.extendedData?.shipping_info?.requires_refrigeration && (
                            <li className="text-orange-600">• Requires refrigerated shipping</li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preparation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Preparation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode && isAdmin ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Prep Time</Label>
                          <Input
                            value={editedProduct?.extendedData?.preparation?.prep_time || ''}
                            onChange={(e) => setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                preparation: {
                                  ...prev!.extendedData!.preparation,
                                  prep_time: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Cook Time</Label>
                          <Input
                            value={editedProduct?.extendedData?.preparation?.cook_time || ''}
                            onChange={(e) => setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                preparation: {
                                  ...prev!.extendedData!.preparation,
                                  cook_time: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Cooking Methods</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.preparation?.cooking_methods?.join(', ') || ''}
                          onChange={(e) => {
                            const methods = e.target.value.split(',').map(m => m.trim())
                            setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                preparation: {
                                  ...prev!.extendedData!.preparation,
                                  cooking_methods: methods
                                }
                              }
                            }))
                          }}
                          placeholder="Comma-separated cooking methods"
                        />
                      </div>
                      <div>
                        <Label>Serving Suggestions</Label>
                        <Textarea
                          value={editedProduct?.extendedData?.preparation?.serving_suggestions?.join(', ') || ''}
                          onChange={(e) => {
                            const suggestions = e.target.value.split(',').map(s => s.trim())
                            setEditedProduct(prev => ({
                              ...prev!,
                              extendedData: {
                                ...prev!.extendedData!,
                                preparation: {
                                  ...prev!.extendedData!.preparation,
                                  serving_suggestions: suggestions
                                }
                              }
                            }))
                          }}
                          placeholder="Comma-separated serving suggestions"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Prep Time</p>
                            <p className="text-sm text-muted-foreground">
                              {product.extendedData?.preparation?.prep_time || '5 minutes'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Cook Time</p>
                            <p className="text-sm text-muted-foreground">
                              {product.extendedData?.preparation?.cook_time || '10-15 minutes'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {product.extendedData?.preparation?.cooking_methods && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Cooking Methods:</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.extendedData.preparation.cooking_methods.map((method, idx) => (
                              <Badge key={idx} variant="outline">{method}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.extendedData?.preparation?.serving_suggestions && (
                        <div>
                          <h4 className="font-semibold mb-2">Serving Suggestions:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {product.extendedData.preparation.serving_suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Vendor Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sold by {product.vendorName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/vendors/${product.vendorId}`)}
              >
                View All Products from {product.vendorName}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}