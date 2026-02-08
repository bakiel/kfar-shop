'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Shield, Save, Check, Loader2
} from 'lucide-react';
import { PageHeader, FormField } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

type TabId = 'general' | 'notifications' | 'security';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // General settings
  const [marketplaceName, setMarketplaceName] = useState('KFAR Marketplace');
  const [currency, setCurrency] = useState('ILS');
  const [taxRate, setTaxRate] = useState('17');

  // Notification settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async () => {
    if (activeTab === 'security') {
      if (newPassword && newPassword !== confirmPassword) {
        setPasswordError(isRTL ? 'הסיסמאות אינן תואמות' : 'Passwords do not match');
        return;
      }
    }
    setSaving(true);
    setPasswordError('');
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: TabId; label: string; labelHe: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', labelHe: 'כללי', icon: <SettingsIcon className="w-4 h-4 stroke-[1.5]" /> },
    { id: 'notifications', label: 'Notifications', labelHe: 'התראות', icon: <Bell className="w-4 h-4 stroke-[1.5]" /> },
    { id: 'security', label: 'Security', labelHe: 'אבטחה', icon: <Shield className="w-4 h-4 stroke-[1.5]" /> },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim}>
        <PageHeader
          title={t('Settings')}
          subtitle={isRTL ? 'הגדרות השוק' : 'Marketplace configuration'}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemAnim} className="mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelHe : tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={itemAnim} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Marketplace Settings')}
            </h3>

            <FormField label={t('Marketplace Name')} isRTL={isRTL}>
              <input
                type="text"
                value={marketplaceName}
                onChange={(e) => setMarketplaceName(e.target.value)}
                className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] ${isRTL ? 'text-right' : ''}`}
              />
            </FormField>

            <FormField label={t('Currency')} isRTL={isRTL}>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] cursor-pointer ${isRTL ? 'text-right' : ''}`}
              >
                <option value="ILS">{isRTL ? 'שקל ישראלי (ILS)' : 'Israeli Shekel (ILS)'}</option>
                <option value="USD">{isRTL ? 'דולר אמריקאי (USD)' : 'US Dollar (USD)'}</option>
                <option value="EUR">{isRTL ? 'אירו (EUR)' : 'Euro (EUR)'}</option>
              </select>
            </FormField>

            <FormField label={t('Tax Rate')} isRTL={isRTL}>
              <div className="relative max-w-[200px]">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] ${isRTL ? 'text-right pr-3 pl-8' : 'pr-8'}`}
                  min="0"
                  max="100"
                />
                <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${isRTL ? 'left-3' : 'right-3'}`}>%</span>
              </div>
            </FormField>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Notification Settings')}
            </h3>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('WhatsApp Notifications')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRTL ? 'שלח התראות הזמנות דרך וואטסאפ' : 'Send order notifications via WhatsApp'}
                </p>
              </div>
              <button
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  whatsappEnabled ? 'bg-[#2D5A27]' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: whatsappEnabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Email Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('Email Notifications')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRTL ? 'שלח התראות הזמנות באימייל' : 'Send order notifications via email'}
                </p>
              </div>
              <button
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  emailEnabled ? 'bg-[#2D5A27]' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: emailEnabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Change Password')}
            </h3>

            <FormField label={t('Current Password')} isRTL={isRTL}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? 'הזן סיסמה נוכחית' : 'Enter current password'}
              />
            </FormField>

            <FormField label={t('New Password')} isRTL={isRTL}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? 'הזן סיסמה חדשה' : 'Enter new password'}
              />
            </FormField>

            <FormField
              label={t('Confirm Password')}
              error={passwordError}
              isRTL={isRTL}
            >
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                className={`w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] ${passwordError ? 'border-red-300' : ''} ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? 'אשר סיסמה חדשה' : 'Confirm new password'}
              />
            </FormField>
          </div>
        )}

        {/* Save Button */}
        <div className={`mt-8 pt-6 border-t border-gray-100 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium hover:bg-[#234A1F] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 stroke-[1.5] animate-spin" />
                {isRTL ? 'שומר...' : 'Saving...'}
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 stroke-[1.5]" />
                {isRTL ? 'נשמר בהצלחה' : 'Saved successfully'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[1.5]" />
                {t('Save Changes')}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
