'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Calendar } from 'lucide-react';
import { PageHeader, FormField } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
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

export default function CustomerProfile() {
  const { language, t, isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    // Load from localStorage
    const name = localStorage.getItem('customerName') || 'John Doe';
    const email = localStorage.getItem('customerEmail') || 'john@example.com';
    setProfile({
      fullName: name,
      email: email,
      phone: '+972-50-123-4567',
      address: '123 Peace Street, Dimona',
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.setItem('customerName', profile.fullName);
    localStorage.setItem('customerEmail', profile.email);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
      >
        <div className={cn('flex items-center gap-5', isRTL && 'flex-row-reverse')}>
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#478c0b] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'C'}
            </span>
          </div>
          <div className={cn(isRTL && 'text-right')}>
            <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 stroke-[1.5]" />
              <span className="text-xs text-gray-400">
                {isRTL ? 'חבר מאז דצמבר 2023' : 'Member since December 2023'}
              </span>
            </div>
          </div>
        </div>
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
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder={isRTL ? 'האימייל שלך' : 'Your email'}
                className={cn(inputClasses, isRTL ? 'pr-10' : 'pl-10')}
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
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer',
              saved ? 'bg-emerald-500' : 'bg-[#2D5A27] hover:bg-[#234A1F]',
              saving && 'opacity-70 cursor-wait'
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
