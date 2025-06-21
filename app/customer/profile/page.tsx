'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function CustomerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+972-50-123-4567',
    birthDate: '1990-01-01',
    dietaryPreferences: ['vegan', 'kosher'],
    newsletter: true,
  });

  const handleSave = () => {
    // In production, this would make an API call
    setIsEditing(false);
    // Show success toast
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
            My Profile
          </h1>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              style={{ backgroundColor: '#478c0b' }}
              className="text-white hover:opacity-90"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                style={{ backgroundColor: '#478c0b' }}
                className="text-white hover:opacity-90"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: '#478c0b' }} />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">
                <Calendar className="inline w-4 h-4 mr-1" />
                Birth Date
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={profile.birthDate}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['vegan', 'kosher', 'gluten-free', 'organic', 'raw'].map((pref) => (
              <label key={pref} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.dietaryPreferences.includes(pref)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProfile({
                        ...profile,
                        dietaryPreferences: [...profile.dietaryPreferences, pref]
                      });
                    } else {
                      setProfile({
                        ...profile,
                        dietaryPreferences: profile.dietaryPreferences.filter(p => p !== pref)
                      });
                    }
                  }}
                  disabled={!isEditing}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#478c0b' }}
                />
                <span className="capitalize">{pref}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: '#c23c09' }} />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              disabled={!isEditing}
            >
              Change Password
            </Button>
            <p className="text-sm text-gray-600">
              Last password change: 30 days ago
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={profile.newsletter}
              onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
              disabled={!isEditing}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#478c0b' }}
            />
            <span>Receive newsletter and promotional emails</span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}