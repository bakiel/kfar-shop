'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Package, X, Percent, AlertTriangle, Star, Search
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
  products?: string[];
  price: number;
  originalPrice: number;
  status: 'active' | 'draft';
  isPromoted?: boolean;
  resolvedProducts?: ProductOption[];
  description?: string;
  image?: string;
  [key: string]: unknown;
}

interface ProductOption {
  id: string;
  name: string;
  vendorName?: string;
  price?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// --- Mock fallback data (kept for reference) ---
// const initialBundles: Bundle[] = [
//   { id: 'bnd-001', name: 'Shabbat Essentials Bundle', nameHe: 'חבילת מוצרי שבת', productsCount: 6, price: 149, originalPrice: 195, status: 'active' },
//   { id: 'bnd-002', name: 'Healthy Breakfast Pack', nameHe: 'חבילת ארוחת בוקר בריאה', productsCount: 4, price: 89, originalPrice: 120, status: 'active' },
//   { id: 'bnd-003', name: 'Vegan BBQ Kit', nameHe: 'ערכת ברביקיו טבעונית', productsCount: 5, price: 119, originalPrice: 155, status: 'draft' },
//   { id: 'bnd-004', name: 'Sweet Treats Collection', nameHe: 'אוסף מתוקים', productsCount: 3, price: 69, originalPrice: 85, status: 'active' },
// ];

function normalizeProductIds(products: unknown): string[] {
  if (Array.isArray(products)) {
    return products.map((id) => String(id)).filter(Boolean);
  }

  if (typeof products === 'string') {
    try {
      const parsed = JSON.parse(products);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id)).filter(Boolean);
      }
    } catch {
      return products
        .split(/[,\n]/)
        .map((id) => id.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeBundle(b: any): Bundle {
  const productIds = normalizeProductIds(b.products);

  return {
    id: b.id,
    name: b.name || '',
    nameHe: b.nameHe || b.name_he || '',
    productsCount: b.resolvedProducts?.length ?? (productIds.length > 0 ? productIds.length : (b.productsCount || 0)),
    products: productIds,
    resolvedProducts: Array.isArray(b.resolvedProducts) ? b.resolvedProducts : [],
    price: b.price || b.bundle_price || 0,
    originalPrice: b.originalPrice || b.original_price || b.price || b.bundle_price || 0,
    status: b.status || (b.is_active ? 'active' : 'draft'),
    isPromoted: !!(b.isPromoted ?? b.is_promoted),
    description: b.description || '',
    image: b.image || '',
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
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameHe, setFormNameHe] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formProducts, setFormProducts] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('draft');
  const [formPromoted, setFormPromoted] = useState(false);
  const [formShowInCatalog, setFormShowInCatalog] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    setFormDescription('');
    setFormImage('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormProducts([]);
    setProductSearch('');
    setProductResults([]);
    setFormStatus('active');
    setFormPromoted(false);
    setFormShowInCatalog(true);
    setShowAdvanced(false);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormName(bundle.name);
    setFormNameHe(bundle.nameHe);
    // Description + image + products come back as raw fields from the API
    setFormDescription((bundle as any).description || '');
    setFormImage((bundle as any).image || '');
    const products = normalizeProductIds((bundle as any).products);
    const resolvedProducts = Array.isArray((bundle as any).resolvedProducts) ? (bundle as any).resolvedProducts : [];
    setFormProducts(products.map((productId) => {
      const resolved = resolvedProducts.find((product: any) => product.id === productId);
      return {
        id: productId,
        name: resolved?.name || productId,
        vendorName: resolved?.vendorName,
        price: resolved?.price,
      };
    }));
    setFormPrice(String(bundle.price));
    setFormOriginalPrice(String(bundle.originalPrice));
    setFormStatus(bundle.status);
    setFormPromoted(!!bundle.isPromoted);
    setFormShowInCatalog(bundle.status === 'active');
    setShowAdvanced(false);
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = () => {
    const productIds = formProducts.map(product => product.id);

    if (!formName.trim()) {
      setFormError(isRTL ? 'יש להזין שם חבילה.' : 'Bundle name is required.');
      return;
    }

    if (productIds.length === 0) {
      setFormError(isRTL ? 'יש לבחור לפחות מוצר אחד.' : 'Add at least one product.');
      return;
    }

    if ((Number(formPrice) || 0) <= 0) {
      setFormError(isRTL ? 'מחיר החבילה חייב להיות גדול מאפס.' : 'Bundle price must be greater than zero.');
      return;
    }

    setFormError(null);
    setSaving(true);

    const payload = {
      name: formName,
      nameHe: formNameHe || formName,
      description: formDescription,
      image: formImage || '/images/placeholder-product.jpg',
      price: Number(formPrice) || 0,
      originalPrice: Number(formOriginalPrice) || 0,
      products: productIds,
      status: formShowInCatalog ? formStatus : 'draft',
      isPromoted: editingBundle ? formPromoted : false,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const request = editingBundle
      ? fetch('/api/admin/bundles', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ id: editingBundle.id, ...payload }),
        })
      : fetch('/api/admin/bundles', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

    request
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        setFormError(null);
        setShowForm(false);
        fetchBundles();
      })
      .catch((err) => {
        console.error('Bundle save error:', err);
        setFormError(isRTL ? 'שמירת החבילה נכשלה. נסה שוב.' : 'Failed to save bundle. Please try again.');
      })
      .finally(() => setSaving(false));
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

  // Task #5: toggle home-page promotion. Server enforces single-active.
  const handleTogglePromoted = (bundle: Bundle) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    fetch('/api/admin/bundles', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id: bundle.id, isPromoted: !bundle.isPromoted }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => fetchBundles())
      .catch((err) => console.error('Bundle promotion toggle error:', err));
  };

  useEffect(() => {
    if (!showForm) return;
    const search = productSearch.trim();
    if (search.length < 2) {
      setProductResults([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      setProductSearchLoading(true);
      fetch(`/api/admin/products?search=${encodeURIComponent(search)}&limit=12`, { headers })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => setProductResults(data.products || []))
        .catch(err => {
          console.error('Product search error:', err);
          setProductResults([]);
        })
        .finally(() => setProductSearchLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [accessToken, productSearch, showForm]);

  const addProduct = (product: ProductOption) => {
    setFormProducts(current => current.some(item => item.id === product.id) ? current : [...current, product]);
    setProductSearch('');
    setProductResults([]);
  };

  const removeProduct = (productId: string) => {
    setFormProducts(current => current.filter(product => product.id !== productId));
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
            {row.isPromoted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#8a6b1e] bg-[#E8B84D]/20 border border-[#E8B84D]/40 rounded px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 stroke-[2] fill-[#E8B84D]" />
                {isRTL ? 'בדף הבית' : 'On home'}
              </span>
            )}
          </div>
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
            {
              label: row.isPromoted
                ? (isRTL ? 'הסר מדף הבית' : 'Remove from home')
                : (isRTL ? 'הצג בדף הבית' : 'Promote on home'),
              onClick: () => handleTogglePromoted(row),
            },
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

                  <FormField label={isRTL ? 'מוצרים' : 'Products'} required isRTL={isRTL}>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 stroke-[1.5]" />
                      <input
                        type="search"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full py-2.5 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                        placeholder={isRTL ? 'חפש לפי מוצר או ספק' : 'Search products by name or vendor'}
                      />
                      {(productResults.length > 0 || productSearchLoading) && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {productSearchLoading && (
                            <div className="px-3 py-2 text-sm text-gray-500">{isRTL ? 'מחפש...' : 'Searching...'}</div>
                          )}
                          {!productSearchLoading && productResults.map(product => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => addProduct(product)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.vendorName || product.id} · ₪{Number(product.price || 0).toFixed(2)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formProducts.map(product => (
                        <span key={product.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2D5A27]/10 text-[#1E3D1A] text-xs font-medium">
                          {product.name}
                          <button type="button" onClick={() => removeProduct(product.id)} className="text-[#1E3D1A]/70 hover:text-[#1E3D1A]">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </FormField>

                  <label className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formShowInCatalog}
                      onChange={(e) => {
                        setFormShowInCatalog(e.target.checked);
                        setFormStatus(e.target.checked ? 'active' : 'draft');
                      }}
                      className="w-4 h-4 accent-[#2D5A27]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1E3D1A]">
                        {isRTL ? 'הצג בקטלוג' : 'Show in catalog'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {isRTL ? 'חבילות חדשות פעילות כברירת מחדל.' : 'New bundles are active by default.'}
                      </div>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAdvanced(value => !value)}
                    className="text-sm font-medium text-[#2D5A27] hover:text-[#1E3D1A]"
                  >
                    {showAdvanced ? (isRTL ? 'הסתר מתקדם' : 'Hide advanced') : (isRTL ? 'אפשרויות מתקדמות' : 'Advanced')}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <FormField label={isRTL ? 'שם (עברית)' : 'Name (Hebrew)'} isRTL={isRTL}>
                        <input
                          type="text"
                          value={formNameHe}
                          onChange={(e) => setFormNameHe(e.target.value)}
                          className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                          placeholder={formName || 'חבילת מוצרים'}
                          dir="rtl"
                        />
                      </FormField>

                      <FormField label={isRTL ? 'תיאור (אופציונלי)' : 'Description (optional)'} isRTL={isRTL}>
                        <textarea
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          rows={2}
                          className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] resize-none"
                          placeholder={isRTL ? 'תיאור קצר שיוצג בכרטיס החבילה' : 'Short description shown on the bundle card'}
                        />
                      </FormField>

                      {editingBundle && (
                        <>
                          <FormField label={isRTL ? 'תמונת חבילה (URL)' : 'Bundle image (URL)'} isRTL={isRTL}>
                            <input
                              type="text"
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                              placeholder="/images/bundles/weekend-feast.jpg"
                            />
                          </FormField>

                          <label className="flex items-center gap-3 px-3 py-2.5 border border-[#E8B84D]/40 bg-[#E8B84D]/10 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formPromoted}
                              onChange={(e) => setFormPromoted(e.target.checked)}
                              className="w-4 h-4 accent-[#2D5A27]"
                            />
                            <span className="text-sm font-medium text-[#1E3D1A]">
                              {isRTL ? 'הצג בדף הבית' : 'Promote on home page'}
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
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
