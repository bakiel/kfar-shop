'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Calendar, Award } from 'lucide-react';
import { PageHeader, FormField } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const TIER_COLORS: Record<string, string> = {
  bronze:   '#92400E',
  silver:   '#6B7280',
  gold:     '#B45309',
  platinum: '#1D4ED8',
};

export default function CustomerProfile() {
  const { isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberSince, setMemberSince] = useState('');
  const [points, setPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('bronze');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (accessToken) {
        const res = await fetch('/api/customer/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.customer) {
            const c = data.customer;
            const addr = Array.isArray(c.addresses) && c.addresses.length > 0
              ? [c.addresses[0].address, c.addresses[0].city].filter(Boolean).join(', ')
              : '';
            setProfile({
              fullName: c.name || '',
              email: c.email || '',
              phone: c.phone || '',
              address: addr,
            });
            setPoints(c.points || 0);
            setLoyaltyTier(c.loyaltyTier || 'bronze');
            if (c.createdAt) {
              setMemberSince(
                new Date(c.createdAt).toLocaleDateString('en-IL', { month: 'long', year: 'numeric' })
              );
            }
            return;
          }
        }
      }
      // Fallback to localStorage
      setProfile({
        fullName: localStorage.getItem('customerName') || '',
        email: localStorage.getItem('customerEmail') || '',
        phone: '',
        address: '',
      });
    } catch {
      setProfile({
        fullName: localStorage.getItem('customerName') || '',
        email: localStorage.getItem('customerEmail') || '',
        phone: '',
        address: '',
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (accessToken) {
        const addresses = profile.address
          ? [{ address: profile.address, city: 'Dimona', country: 'Israel', isDefault: true }]
          : [];
        const res = await fetch('/api/customer/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: profile.fullName,
            phone: profile.phone,
            addresses,
          }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
          return;
        }
      }
      // Fallback localStorage save
      localStorage.setItem('customerName', profile.fullName);
      localStorage.setItem('customerEmail', profile.email);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = cn(
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm transition-all',
    'focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]',
    'placeholder:text-gray-400',
    isRTL && 'text-right'
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariant}>
        <PageHeader
          title={isRTL ? 'הפרופיל שלי' : 'My Profile'}
          subtitle={isRTL ? 'נהל את המידע האישי שלך' : 'Manage your personal information'}
          breadcrumbs={[
            { label: isRTL ? 'לוח בקרה' : 'Dashboard', href: '/customer/dashboard' },
            { label: isRTL ? 'פרופיל' : 'Profile' },
          ]}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Profile Card */}
      <motion.div
        variants={itemVariant}
        className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
      >
        {loading ? (
          <div className="flex items-center gap-5 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-56" />
            </div>
          </div>
        ) : (
          <div className={cn('flex items-center gap-5', isRTL && 'flex-row-reverse')}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#478c0b] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            <div className={cn(isRTL && 'text-right')}>
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName || 'Customer'}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {memberSince && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 stroke-[1.5]" />
                    <span className="text-xs text-gray-400">Member since {memberSince}</span>
                  </div>
                )}
                {points > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 stroke-[1.5]" style={{ color: TIER_COLORS[loyaltyTier] }} />
                    <span className="text-xs font-medium capitalize" style={{ color: TIER_COLORS[loyaltyTier] }}>
                      {loyaltyTier} · {points} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Personal Information Form */}
      <motion.div
        variants={itemVariant}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h3 className={cn('text-lg font-semibold text-gray-900 mb-6', isRTL && 'text-right')}>
          {isRTL ? 'מידע אישי' : 'Personal Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label={isRTL ? 'שם מלא' : 'Full Name'} required isRTL={isRTL}>
            <div className="relative">
              <User className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder={isRTL ? 'השם שלך' : 'Your name'}
                className={cn(inputClasses, isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </FormField>

          <FormField label={isRTL ? 'אימייל' : 'Email'} required isRTL={isRTL}>
            <div className="relative">
              <Mail className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="email"
                value={profile.email}
                disabled
                placeholder={isRTL ? 'האימייל שלך' : 'Your email'}
                className={cn(inputClasses, isRTL ? 'pr-10' : 'pl-10', 'bg-gray-50 cursor-not-allowed text-gray-500')}
              />
            </div>
          </FormField>

          <FormField label={isRTL ? 'טלפון' : 'Phone'} isRTL={isRTL}>
            <div className="relative">
              <Phone className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder={isRTL ? 'מספר טלפון' : 'Phone number'}
                className={cn(inputClasses, isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </FormField>

          <FormField label={isRTL ? 'כתובת' : 'Address'} isRTL={isRTL}>
            <div className="relative">
              <MapPin className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder={isRTL ? 'הכתובת שלך' : 'Your address'}
                className={cn(inputClasses, isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </FormField>
        </div>

        {/* Save Button */}
        <div className={cn('mt-8 flex', isRTL ? 'justify-start' : 'justify-end')}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || loading}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer',
              saved ? 'bg-emerald-500' : 'bg-[#2D5A27] hover:bg-[#234A1F]',
              (saving || loading) && 'opacity-70 cursor-wait'
            )}
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Save className="w-4 h-4 stroke-[1.5]" />
              </motion.div>
            ) : (
              <Save className="w-4 h-4 stroke-[1.5]" />
            )}
            <span>
              {saving
                ? (isRTL ? 'שומר...' : 'Saving...')
                : saved
                  ? (isRTL ? 'נשמר!' : 'Saved!')
                  : (isRTL ? 'שמור שינויים' : 'Save Changes')
              }
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
