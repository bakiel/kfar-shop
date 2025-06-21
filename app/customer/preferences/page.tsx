'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Tag, Store, TrendingUp, Save } from 'lucide-react';

export default function CustomerPreferences() {
  const [preferences, setPreferences] = useState({
    notifications: {
      orderUpdates: true,
      newProducts: true,
      promotions: true,
      vendorNews: false,
      priceDrops: true,
    },
    communication: {
      email: true,
      sms: false,
      whatsapp: true,
    },
    interests: {
      organic: true,
      glutenFree: false,
      raw: false,
      kosher: true,
      vegan: true,
    },
    favoriteVendors: ['teva-deli', 'garden-of-light'],
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, this would make an API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const vendors = [
    { id: 'teva-deli', name: 'Teva Deli' },
    { id: 'garden-of-light', name: 'Garden of Light' },
    { id: 'gahn-delight', name: 'Gahn Delight' },
    { id: 'queens-cuisine', name: 'Queens Cuisine' },
    { id: 'people-store', name: 'People Store' },
    { id: 'vop-shop', name: 'VOP Shop' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
          Preferences
        </h1>
        <p className="text-gray-600">
          Customize your marketplace experience
        </p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" style={{ color: '#478c0b' }} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="orderUpdates" className="cursor-pointer">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-600">Get notified about order status changes</p>
                </div>
              </Label>
              <Switch
                id="orderUpdates"
                checked={preferences.notifications.orderUpdates}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, orderUpdates: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newProducts" className="cursor-pointer">
                <div>
                  <p className="font-medium">New Products</p>
                  <p className="text-sm text-gray-600">Be the first to know about new arrivals</p>
                </div>
              </Label>
              <Switch
                id="newProducts"
                checked={preferences.notifications.newProducts}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, newProducts: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promotions" className="cursor-pointer">
                <div>
                  <p className="font-medium">Promotions & Deals</p>
                  <p className="text-sm text-gray-600">Receive exclusive offers and discounts</p>
                </div>
              </Label>
              <Switch
                id="promotions"
                checked={preferences.notifications.promotions}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, promotions: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="priceDrops" className="cursor-pointer">
                <div>
                  <p className="font-medium">Price Drops</p>
                  <p className="text-sm text-gray-600">Alert when wishlist items go on sale</p>
                </div>
              </Label>
              <Switch
                id="priceDrops"
                checked={preferences.notifications.priceDrops}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, priceDrops: checked }
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" style={{ color: '#f6af0d' }} />
            Communication Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Switch
                id="email"
                checked={preferences.communication.email}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    communication: { ...preferences.communication, email: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sms" className="cursor-pointer flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </Label>
              <Switch
                id="sms"
                checked={preferences.communication.sms}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    communication: { ...preferences.communication, sms: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp" className="cursor-pointer flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Label>
              <Switch
                id="whatsapp"
                checked={preferences.communication.whatsapp}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    communication: { ...preferences.communication, whatsapp: checked }
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" style={{ color: '#c23c09' }} />
            Product Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Help us personalize your recommendations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(preferences.interests).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      interests: { ...preferences.interests, [key]: e.target.checked }
                    })
                  }
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#478c0b' }}
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Vendors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" style={{ color: '#478c0b' }} />
            Favorite Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Get priority notifications from your favorite vendors
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <label key={vendor.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.favoriteVendors.includes(vendor.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        favoriteVendors: [...preferences.favoriteVendors, vendor.id]
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        favoriteVendors: preferences.favoriteVendors.filter(v => v !== vendor.id)
                      });
                    }
                  }}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#478c0b' }}
                />
                <span>{vendor.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#478c0b', color: 'white' }}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>

      {saved && (
        <div 
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          style={{ backgroundColor: '#478c0b' }}
        >
          <CheckCircle className="h-5 w-5" />
          Preferences saved successfully!
        </div>
      )}
    </div>
  );
}