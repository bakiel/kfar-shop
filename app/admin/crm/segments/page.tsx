'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Users, X, AlertTriangle, Settings
} from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

interface Segment {
  id: string;
  name: string;
  description: string | null;
  segment_type: 'manual' | 'auto';
  rules: any;
  customer_count: number;
  created_at: string;
  updated_at: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('kfar_access_token') || localStorage.getItem('kfar_access_token');
}

export default function SegmentsPage() {
  const { t, isRTL } = useLanguage();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'manual' | 'auto'>('manual');
  const [formRuleTier, setFormRuleTier] = useState('');
  const [formRuleMinOrders, setFormRuleMinOrders] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const headers = useCallback(() => {
    const token = getToken();
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, []);

  const fetchSegments = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/crm/segments', { headers: headers() })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setSegments(json.segments || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [headers]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);

    const rules: any = {};
    if (formType === 'auto') {
      if (formRuleTier) rules.tier = formRuleTier;
      if (formRuleMinOrders) rules.min_orders = parseInt(formRuleMinOrders, 10);
    }

    try {
      const res = await fetch('/api/admin/crm/segments', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          segment_type: formType,
          rules: Object.keys(rules).length > 0 ? rules : undefined,
        }),
      });

      if (res.ok) {
        setFormName('');
        setFormDescription('');
        setFormType('manual');
        setFormRuleTier('');
        setFormRuleMinOrders('');
        setShowCreate(false);
        fetchSegments();
      }
    } catch (err) {
      console.error('Create segment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message={isRTL ? 'טוען פלחי שוק...' : 'Loading segments...'} />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'פלחי שוק' : 'Customer Segments'}
          subtitle={
            isRTL
              ? `${segments.length} פלחים`
              : `${segments.length} segments`
          }
          breadcrumbs={[
            { label: isRTL ? 'ניהול' : 'Admin', href: '/admin/dashboard' },
            { label: 'CRM', href: '/admin/crm' },
            { label: isRTL ? 'פלחי שוק' : 'Segments' },
          ]}
          isRTL={isRTL}
          actions={
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              {showCreate ? (
                <>
                  <X className="w-4 h-4 stroke-[1.5]" />
                  {isRTL ? 'ביטול' : 'Cancel'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[1.5]" />
                  {isRTL ? 'פלח חדש' : 'New Segment'}
                </>
              )}
            </motion.button>
          }
        />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={item}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 stroke-[1.5] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">{isRTL ? 'שגיאה' : 'Error'}</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Segment Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {isRTL ? 'צור פלח חדש' : 'Create New Segment'}
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {isRTL ? 'שם הפלח' : 'Segment Name'} *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={isRTL ? 'לקוחות VIP, קונים תדירים...' : 'VIP Customers, Frequent Buyers...'}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {isRTL ? 'סוג' : 'Type'}
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as 'manual' | 'auto')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
                    >
                      <option value="manual">{isRTL ? 'ידני' : 'Manual'}</option>
                      <option value="auto">{isRTL ? 'אוטומטי' : 'Automatic'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {isRTL ? 'תיאור' : 'Description'}
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={isRTL ? 'תיאור הפלח...' : 'Describe this segment...'}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 resize-none"
                  />
                </div>

                {/* Auto Rules */}
                {formType === 'auto' && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5 stroke-[1.5]" />
                      {isRTL ? 'כללי סינון אוטומטי' : 'Auto-filter Rules'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {isRTL ? 'שכבת נאמנות' : 'Loyalty Tier'}
                        </label>
                        <select
                          value={formRuleTier}
                          onChange={(e) => setFormRuleTier(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
                        >
                          <option value="">{isRTL ? 'הכל' : 'Any'}</option>
                          <option value="bronze">Bronze</option>
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {isRTL ? 'מינימום הזמנות' : 'Min. Orders'}
                        </label>
                        <input
                          type="number"
                          value={formRuleMinOrders}
                          onChange={(e) => setFormRuleMinOrders(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer"
                  >
                    {isRTL ? 'ביטול' : 'Cancel'}
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={submitting || !formName.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? isRTL ? 'יוצר...' : 'Creating...'
                      : isRTL ? 'צור פלח' : 'Create Segment'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segments Grid */}
      {segments.length === 0 && !showCreate ? (
        <motion.div variants={item} className="text-center py-16">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-gray-500 font-medium">
            {isRTL ? 'אין פלחי שוק עדיין' : 'No segments created yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {isRTL ? 'צור את הפלח הראשון שלך' : 'Create your first segment to organize customers'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <motion.div
              key={seg.id}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-xl border border-gray-100 p-5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{seg.name}</h3>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                        seg.segment_type === 'auto'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {seg.segment_type}
                    </span>
                  </div>
                </div>
              </div>

              {seg.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{seg.description}</p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <Users className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                <span className="text-sm text-gray-600">
                  {seg.customer_count} {isRTL ? 'לקוחות' : 'customers'}
                </span>
              </div>

              {seg.rules && Object.keys(seg.rules).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {seg.rules.tier && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">
                      tier: {seg.rules.tier}
                    </span>
                  )}
                  {seg.rules.min_orders && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">
                      min orders: {seg.rules.min_orders}
                    </span>
                  )}
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-2">
                {isRTL ? 'נוצר:' : 'Created:'}{' '}
                {new Date(seg.created_at).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
