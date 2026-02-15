'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Crown, Star, Tag, Clock,
  MessageSquare, Plus, X, ArrowLeft, AlertTriangle,
  ShoppingCart, MapPin, Calendar
} from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyalty_tier: string;
  points: number;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  tags: string[];
  notes: string | null;
  addresses: any;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

type TabId = 'overview' | 'activity' | 'notes';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  silver: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  platinum: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
};

const activityIcons: Record<string, React.ReactNode> = {
  note_added: <MessageSquare className="w-4 h-4 text-blue-500 stroke-[1.5]" />,
  tag_added: <Tag className="w-4 h-4 text-emerald-500 stroke-[1.5]" />,
  order_placed: <ShoppingCart className="w-4 h-4 text-purple-500 stroke-[1.5]" />,
  tier_change: <Crown className="w-4 h-4 text-yellow-500 stroke-[1.5]" />,
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('kfar_access_token') || localStorage.getItem('kfar_access_token');
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { t, isRTL } = useLanguage();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Note form
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Tag form
  const [tagInput, setTagInput] = useState('');
  const [submittingTag, setSubmittingTag] = useState(false);

  const headers = useCallback(() => {
    const token = getToken();
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, []);

  const fetchCustomer = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/crm/customers/${customerId}`, { headers: headers() })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setCustomer(json.customer);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [customerId, headers]);

  const fetchActivity = useCallback(() => {
    fetch(`/api/admin/crm/customers/${customerId}/activity`, { headers: headers() })
      .then((res) => res.json())
      .then((json) => {
        setActivities(json.activities || []);
      })
      .catch((err) => console.error('Activity fetch error:', err));
  }, [customerId, headers]);

  useEffect(() => {
    fetchCustomer();
    fetchActivity();
  }, [fetchCustomer, fetchActivity]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);

    try {
      const res = await fetch(`/api/admin/crm/customers/${customerId}/note`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ note: noteText }),
      });
      if (res.ok) {
        setNoteText('');
        fetchCustomer();
        fetchActivity();
      }
    } catch (err) {
      console.error('Add note error:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    setSubmittingTag(true);

    try {
      const res = await fetch(`/api/admin/crm/customers/${customerId}/tag`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ tag: tagInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (customer) {
          setCustomer({ ...customer, tags: data.tags });
        }
        setTagInput('');
      }
    } catch (err) {
      console.error('Add tag error:', err);
    } finally {
      setSubmittingTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      const res = await fetch(
        `/api/admin/crm/customers/${customerId}/tag?tag=${encodeURIComponent(tag)}`,
        { method: 'DELETE', headers: headers() }
      );
      if (res.ok) {
        const data = await res.json();
        if (customer) {
          setCustomer({ ...customer, tags: data.tags });
        }
      }
    } catch (err) {
      console.error('Remove tag error:', err);
    }
  };

  if (loading) {
    return <LoadingState message={isRTL ? 'טוען פרטי לקוח...' : 'Loading customer...'} />;
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 stroke-[1.5] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              {isRTL ? 'שגיאה' : 'Error loading customer'}
            </p>
            <p className="text-sm text-red-600 mt-1">{error || 'Customer not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const tierStyle = tierColors[customer.loyalty_tier] || tierColors.bronze;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: isRTL ? 'סקירה' : 'Overview' },
    { id: 'activity', label: isRTL ? 'פעילות' : 'Activity' },
    { id: 'notes', label: isRTL ? 'הערות' : 'Notes' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <PageHeader
          title={customer.name}
          subtitle={customer.email}
          breadcrumbs={[
            { label: isRTL ? 'ניהול' : 'Admin', href: '/admin/dashboard' },
            { label: 'CRM', href: '/admin/crm' },
            { label: isRTL ? 'לקוחות' : 'Customers', href: '/admin/crm/customers' },
            { label: customer.name },
          ]}
          isRTL={isRTL}
          actions={
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/crm/customers')}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
              {isRTL ? 'חזרה' : 'Back'}
            </motion.button>
          }
        />
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#2D5A27]/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#2D5A27]">
                {customer.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
              >
                <Crown className="w-3 h-3 stroke-[1.5]" />
                {customer.loyalty_tier}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 stroke-[1.5] text-gray-400" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 stroke-[1.5] text-gray-400" />
                  {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 stroke-[1.5] text-gray-400" />
                {isRTL ? 'הצטרף:' : 'Joined:'}{' '}
                {new Date(customer.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'נקודות' : 'Points'}</p>
                <p className="text-lg font-bold text-[#2D5A27]">{customer.points || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'הזמנות' : 'Orders'}</p>
                <p className="text-lg font-bold text-gray-900">{customer.total_orders || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'סה"כ הוצאות' : 'Total Spent'}</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(
                    customer.total_spent || 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'הזמנה אחרונה' : 'Last Order'}</p>
                <p className="text-lg font-bold text-gray-900">
                  {customer.last_order_date
                    ? new Date(customer.last_order_date).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#2D5A27] text-[#2D5A27]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 stroke-[1.5]" />
                {isRTL ? 'תגיות' : 'Tags'}
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {(customer.tags || []).length === 0 ? (
                  <p className="text-sm text-gray-400">{isRTL ? 'אין תגיות' : 'No tags yet'}</p>
                ) : (
                  customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3 stroke-[2]" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={isRTL ? 'הוסף תגית...' : 'Add tag...'}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                />
                <motion.button
                  type="submit"
                  disabled={submittingTag || !tagInput.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                  {isRTL ? 'הוסף' : 'Add'}
                </motion.button>
              </form>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 stroke-[1.5]" />
                {isRTL ? 'כתובות' : 'Addresses'}
              </h3>

              {customer.addresses && typeof customer.addresses === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(customer.addresses).map(([key, addr]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <p className="font-medium text-gray-900 capitalize mb-1">{key}</p>
                      <p>{typeof addr === 'string' ? addr : JSON.stringify(addr)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{isRTL ? 'אין כתובות' : 'No addresses on file'}</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 stroke-[1.5]" />
              {isRTL ? 'ציר זמן פעילות' : 'Activity Timeline'}
            </h3>

            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                {isRTL ? 'אין פעילות מתועדת' : 'No recorded activity'}
              </p>
            ) : (
              <div className="space-y-0">
                {activities.map((act, idx) => (
                  <div key={act.id} className="flex gap-3 relative">
                    {/* Timeline line */}
                    {idx < activities.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" />
                    )}

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 z-10">
                      {activityIcons[act.activity_type] || (
                        <Clock className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">{act.title}</p>
                      {act.description && (
                        <p className="text-sm text-gray-600 mt-0.5">{act.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                        {act.performed_by && (
                          <span className="text-xs text-gray-400">
                            by {act.performed_by}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Add Note Form */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                {isRTL ? 'הוסף הערה' : 'Add Note'}
              </h3>
              <form onSubmit={handleAddNote}>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={isRTL ? 'כתוב הערה...' : 'Write a note...'}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <motion.button
                    type="submit"
                    disabled={submittingNote || !noteText.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submittingNote
                      ? isRTL ? 'שומר...' : 'Saving...'
                      : isRTL ? 'שמור הערה' : 'Save Note'}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Existing Notes */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {isRTL ? 'הערות קיימות' : 'Existing Notes'}
              </h3>
              {customer.notes ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {customer.notes.split('\n---\n').map((note, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 text-sm">
                      {note}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {isRTL ? 'אין הערות' : 'No notes yet'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
