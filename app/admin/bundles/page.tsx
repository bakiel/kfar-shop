'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Package, X, Percent, ShoppingBag
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, FormField, ConfirmDialog } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

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

const initialBundles: Bundle[] = [
  { id: 'bnd-001', name: 'Shabbat Essentials Bundle', nameHe: 'חבילת מוצרי שבת', productsCount: 6, price: 149, originalPrice: 195, status: 'active' },
  { id: 'bnd-002', name: 'Healthy Breakfast Pack', nameHe: 'חבילת ארוחת בוקר בריאה', productsCount: 4, price: 89, originalPrice: 120, status: 'active' },
  { id: 'bnd-003', name: 'Vegan BBQ Kit', nameHe: 'ערכת ברביקיו טבעונית', productsCount: 5, price: 119, originalPrice: 155, status: 'draft' },
  { id: 'bnd-004', name: 'Sweet Treats Collection', nameHe: 'אוסף מתוקים', productsCount: 3, price: 69, originalPrice: 85, status: 'active' },
];

export default function BundlesPage() {
  const { language, t, isRTL } = useLanguage();
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
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
    const newBundle: Bundle = {
      id: editingBundle?.id || `bnd-${String(Date.now()).slice(-3)}`,
      name: formName,
      nameHe: formNameHe,
      productsCount: Number(formProducts) || 0,
      price: Number(formPrice) || 0,
      originalPrice: Number(formOriginalPrice) || 0,
      status: formStatus,
    };

    if (editingBundle) {
      setBundles(bundles.map((b) => (b.id === editingBundle.id ? newBundle : b)));
    } else {
      setBundles([newBundle, ...bundles]);
    }
    setShowForm(false);
  };

  const handleToggleStatus = (bundle: Bundle) => {
    setBundles(bundles.map((b) =>
      b.id === bundle.id ? { ...b, status: b.status === 'active' ? 'draft' as const : 'active' as const } : b
    ));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBundles(bundles.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
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
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#2D5A27] hover:bg-[#234A1F] rounded-lg transition-colors cursor-pointer"
                  >
                    {editingBundle ? t('Save Changes') : t('Create')}
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
