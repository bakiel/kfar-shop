'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Package, X, Percent, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, FormField, ConfirmDialog, LoadingState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

interface Bundle {
  id: string;
  name: string;
  nameHe: string;
  productsCount: number;
  price: number;
  originalPrice: number;
  status: 'active' | 'draft';
  [key: string]: unknown;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Mock fallback data (kept for reference) ---
// const initialBundles: Bundle[] = [
//   { id: 'bnd-001', name: 'Shabbat Essentials Bundle', nameHe: 'חבילת מוצרי שבת', productsCount: 6, price: 149, originalPrice: 195, status: 'active' },
//   { id: 'bnd-002', name: 'Healthy Breakfast Pack', nameHe: 'חבילת ארוחת בוקר בריאה', productsCount: 4, price: 89, originalPrice: 120, status: 'active' },
//   { id: 'bnd-003', name: 'Vegan BBQ Kit', nameHe: 'ערכת ברביקיו טבעונית', productsCount: 5, price: 119, originalPrice: 155, status: 'draft' },
//   { id: 'bnd-004', name: 'Sweet Treats Collection', nameHe: 'אוסף מתוקים', productsCount: 3, price: 69, originalPrice: 85, status: 'active' },
// ];

function normalizeBundle(b: any): Bundle {
  return {
    id: b.id,
    name: b.name || '',
    nameHe: b.nameHe || b.name_he || '',
    productsCount: b.resolvedProducts?.length ?? (Array.isArray(b.products) ? b.products.length : (b.productsCount || 0)),
    price: b.price || 0,
    originalPrice: b.originalPrice || b.original_price || b.price || 0,
    status: b.status || 'draft',
  };
}

export default function BundlesPage() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameHe, setFormNameHe] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formProducts, setFormProducts] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('draft');

  const fetchBundles = useCallback(() => {
    setLoading(true);
    setError(null);
    const authHeaders: Record<string, string> = {};
    if (accessToken) authHeaders['Authorization'] = `Bearer ${accessToken}`;
    fetch('/api/admin/bundles', { headers: authHeaders })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const normalized = (json.bundles || []).map(normalizeBundle);
        setBundles(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Bundles fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    fetchBundles();
  }, [fetchBundles, accessToken]);

  const openCreateForm = () => {
    setEditingBundle(null);
    setFormName('');
    setFormNameHe('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormProducts('');
    setFormStatus('draft');
    setShowForm(true);
  };

  const openEditForm = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormName(bundle.name);
    setFormNameHe(bundle.nameHe);
    setFormPrice(String(bundle.price));
    setFormOriginalPrice(String(bundle.originalPrice));
    setFormProducts(String(bundle.productsCount));
    setFormStatus(bundle.status);
    setShowForm(true);
  };

  const handleSave = () => {
    setSaving(true);
    const productIds = formProducts
      ? Array.from({ length: Number(formProducts) || 1 }, (_, i) => `product-${i + 1}`)
      : ['product-1'];

    if (editingBundle) {
      // PATCH update
      const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) patchHeaders['Authorization'] = `Bearer ${accessToken}`;
      fetch('/api/admin/bundles', {
        method: 'PATCH',
        headers: patchHeaders,
        body: JSON.stringify({
          id: editingBundle.id,
          name: formName,
          nameHe: formNameHe,
          price: Number(formPrice) || 0,
          originalPrice: Number(formOriginalPrice) || 0,
          products: productIds,
          status: formStatus,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(() => {
          setShowForm(false);
          fetchBundles();
        })
        .catch((err) => console.error('Bundle update error:', err))
        .finally(() => setSaving(false));
    } else {
      // POST create
      const postHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) postHeaders['Authorization'] = `Bearer ${accessToken}`;
      fetch('/api/admin/bundles', {
        method: 'POST',
        headers: postHeaders,
        body: JSON.stringify({
          name: formName,
          nameHe: formNameHe,
          price: Number(formPrice) || 0,
          originalPrice: Number(formOriginalPrice) || 0,
          products: productIds,
          status: formStatus,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(() => {
          setShowForm(false);
          fetchBundles();
        })
        .catch((err) => console.error('Bundle create error:', err))
        .finally(() => setSaving(false));
    }
  };

  const handleToggleStatus = (bundle: Bundle) => {
    const newStatus = bundle.status === 'active' ? 'draft' : 'active';
    const toggleHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) toggleHeaders['Authorization'] = `Bearer ${accessToken}`;
    fetch('/api/admin/bundles', {
      method: 'PATCH',
      headers: toggleHeaders,
      body: JSON.stringify({ id: bundle.id, status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => fetchBundles())
      .catch((err) => console.error('Bundle status toggle error:', err));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const deleteHeaders: Record<string, string> = {};
    if (accessToken) deleteHeaders['Authorization'] = `Bearer ${accessToken}`;
    fetch(`/api/admin/bundles?id=${deleteTarget.id}`, { method: 'DELETE', headers: deleteHeaders })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        setDeleteTarget(null);
        fetchBundles();
      })
      .catch((err) => {
        console.error('Bundle delete error:', err);
        setDeleteTarget(null);
      });
  };

  const savingsPercent = (original: number, price: number) =>
    original > 0 ? Math.round(((original - price) / original) * 100) : 0;

  const columns: Column<Bundle>[] = [
    {
      key: 'name',
      header: isRTL ? 'שם החבילה' : 'Bundle Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-4.5 h-4.5 text-emerald-600 stroke-[1.5]" />
          </div>
          <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
        </div>
      ),
    },
    {
      key: 'productsCount',
      header: t('Products'),
      sortable: true,
      render: (row) => (
        <span className="text-gray-700">{row.productsCount} {isRTL ? 'מוצרים' : 'products'}</span>
      ),
    },
    {
      key: 'price',
      header: t('Price'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900">{'\u20AA'}{row.price}</span>
          <span className="text-xs text-gray-400 line-through ml-2">{'\u20AA'}{row.originalPrice}</span>
        </div>
      ),
    },
    {
      key: 'savings',
      header: isRTL ? 'חיסכון' : 'Savings',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <Percent className="w-3.5 h-3.5 stroke-[1.5]" />
          {savingsPercent(row.originalPrice, row.price)}%
        </span>
      ),
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  if (loading) {
    return <LoadingState type="page" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 stroke-[1.5] mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {isRTL ? 'שגיאה בטעינת חבילות' : 'Failed to load bundles'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchBundles}
          className="px-4 py-2 text-sm font-medium text-white bg-[#2D5A27] rounded-lg hover:bg-[#234A1F] transition-colors cursor-pointer"
        >
          {isRTL ? 'נסה שוב' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={t('Manage Bundles')}
          subtitle={isRTL ? `${bundles.length} חבילות` : `${bundles.length} bundles total`}
          isRTL={isRTL}
          actions={
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium hover:bg-[#234A1F] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[1.5]" />
              {t('Create Bundle')}
            </motion.button>
          }
        />
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Bundle>
          columns={columns}
          data={bundles}
          searchable
          searchPlaceholder={isRTL ? 'חפש חבילות...' : 'Search bundles...'}
          pageSize={10}
          emptyTitle={isRTL ? 'אין חבילות עדיין' : 'No bundles yet'}
          emptyDescription={isRTL ? 'צור חבילה ראשונה' : 'Create your first bundle'}
          emptyIcon="package"
          isRTL={isRTL}
          rowActions={(row) => [
            { label: t('Edit'), onClick: () => openEditForm(row) },
            { label: row.status === 'active' ? (isRTL ? 'הפוך לטיוטה' : 'Set as Draft') : (isRTL ? 'הפעל' : 'Activate'), onClick: () => handleToggleStatus(row) },
            { label: t('Delete'), onClick: () => setDeleteTarget(row), destructive: true },
          ]}
        />
      </motion.div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingBundle ? t('Edit Bundle') : t('Create Bundle')}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <X className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField label={isRTL ? 'שם (אנגלית)' : 'Name (English)'} required isRTL={isRTL}>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                      placeholder="e.g. Shabbat Essentials Bundle"
                    />
                  </FormField>

                  <FormField label={isRTL ? 'שם (עברית)' : 'Name (Hebrew)'} required isRTL={isRTL}>
                    <input
                      type="text"
                      value={formNameHe}
                      onChange={(e) => setFormNameHe(e.target.value)}
                      className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                      placeholder="e.g. חבילת מוצרי שבת"
                      dir="rtl"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t('Bundle Price')} required isRTL={isRTL}>
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                        placeholder="149"
                      />
                    </FormField>
                    <FormField label={isRTL ? 'מחיר מקורי' : 'Original Price'} required isRTL={isRTL}>
                      <input
                        type="number"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                        placeholder="195"
                      />
                    </FormField>
                  </div>

                  <FormField label={isRTL ? 'מספר מוצרים' : 'Products Count'} isRTL={isRTL}>
                    <input
                      type="number"
                      value={formProducts}
                      onChange={(e) => setFormProducts(e.target.value)}
                      className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                      placeholder="5"
                    />
                  </FormField>

                  <FormField label={t('Status')} isRTL={isRTL}>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'active' | 'draft')}
                      className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] cursor-pointer"
                    >
                      <option value="draft">{isRTL ? 'טיוטה' : 'Draft'}</option>
                      <option value="active">{isRTL ? 'פעיל' : 'Active'}</option>
                    </select>
                  </FormField>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#2D5A27] hover:bg-[#234A1F] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving
                      ? (isRTL ? 'שומר...' : 'Saving...')
                      : (editingBundle ? t('Save Changes') : t('Create'))
                    }
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isRTL ? 'מחק חבילה' : 'Delete Bundle'}
        description={isRTL
          ? `האם אתה בטוח שברצונך למחוק את "${deleteTarget?.nameHe}"? לא ניתן לבטל פעולה זו.`
          : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        destructive
        isRTL={isRTL}
      />
    </motion.div>
  );
}
