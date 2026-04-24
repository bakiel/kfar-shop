'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Clock, CheckCircle, XCircle, Eye, Search,
  ChevronDown, ChevronUp, MapPin, Phone, Mail, Car, MessageCircle, RefreshCw
} from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { DriverApplication, DriverStatus } from '@/lib/types/driver';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

type FilterTab = 'all' | DriverStatus;

const STATUS_CONFIG: Record<DriverStatus, { color: string; label: string; labelHe: string }> = {
  pending: { color: '#f59e0b', label: 'Pending', labelHe: 'ממתין' },
  reviewing: { color: '#3b82f6', label: 'Reviewing', labelHe: 'בבדיקה' },
  approved: { color: '#22c55e', label: 'Approved', labelHe: 'אושר' },
  rejected: { color: '#ef4444', label: 'Rejected', labelHe: 'נדחה' },
};

const VEHICLE_LABELS: Record<string, { en: string; he: string }> = {
  car: { en: 'Car', he: 'מכונית' },
  scooter: { en: 'Scooter', he: 'קטנוע' },
  bicycle: { en: 'Bicycle', he: 'אופניים' },
  ebike: { en: 'E-Bike', he: 'אופניים חשמליים' },
};

export default function AdminDriversPage() {
  const { language, isRTL } = useLanguage();
  const isHe = language === 'he';

  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/drivers/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (appId: string, newStatus: DriverStatus) => {
    setUpdating(appId);
    try {
      const res = await fetch('/api/drivers/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.applicationId === appId ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a)
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = applications.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.fullName.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q) && !a.phone.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const tabs: { key: FilterTab; label: string; labelHe: string }[] = [
    { key: 'all', label: 'All', labelHe: 'הכל' },
    { key: 'pending', label: 'Pending', labelHe: 'ממתין' },
    { key: 'reviewing', label: 'Reviewing', labelHe: 'בבדיקה' },
    { key: 'approved', label: 'Approved', labelHe: 'אושר' },
    { key: 'rejected', label: 'Rejected', labelHe: 'נדחה' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isHe ? 'ניהול נהגים' : 'Driver Applications'}
        subtitle={isHe ? 'ניהול מועמדויות נהגים' : 'Manage driver applications'}
      />

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tabs.map(tab => (
          <motion.button
            key={tab.key}
            variants={item}
            onClick={() => setFilter(tab.key)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              filter === tab.key
                ? 'border-[#478c0b] bg-[#478c0b]/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-2xl font-bold text-[#3a3a1d]">{counts[tab.key]}</p>
            <p className="text-sm text-[#3a3a1d]/60">{isHe ? tab.labelHe : tab.label}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute top-3 left-3 w-4 h-4 stroke-[1.5] text-gray-400" style={isRTL ? { left: 'auto', right: '12px' } : {}} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isHe ? 'חיפוש לפי שם, אימייל או טלפון...' : 'Search by name, email or phone...'}
            className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-[#3a3a1d] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Truck className="w-12 h-12 stroke-[1.5] text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {isHe ? 'אין מועמדויות' : 'No applications found'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filtered.map(app => {
            const expanded = expandedId === app.applicationId;
            const statusCfg = STATUS_CONFIG[app.status];
            return (
              <motion.div
                key={app.applicationId}
                variants={item}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Summary Row */}
                <div
                  className="flex items-center gap-4 p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : app.applicationId)}
                >
                  <div className="w-10 h-10 rounded-full bg-[#478c0b]/10 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#3a3a1d]">{app.fullName}</span>
                      <span className="text-xs font-mono text-gray-400">{app.applicationId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span>{app.email}</span>
                      <span className="hidden sm:inline">{app.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusCfg.color + '15', color: statusCfg.color }}
                    >
                      {isHe ? statusCfg.labelHe : statusCfg.label}
                    </span>
                    <span className="text-xs text-gray-400 hidden md:block">
                      {new Date(app.createdAt).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
                    </span>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-5 border-t border-gray-100 pt-4">
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">{isHe ? 'טלפון' : 'Phone'}</p>
                            <p className="text-sm font-medium text-[#3a3a1d] flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 stroke-[1.5] text-gray-400" /> {app.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">{isHe ? 'אימייל' : 'Email'}</p>
                            <p className="text-sm font-medium text-[#3a3a1d] flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 stroke-[1.5] text-gray-400" /> {app.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">{isHe ? 'סוג רכב' : 'Vehicle'}</p>
                            <p className="text-sm font-medium text-[#3a3a1d]">
                              {isHe ? VEHICLE_LABELS[app.vehicleType]?.he : VEHICLE_LABELS[app.vehicleType]?.en || app.vehicleType}
                            </p>
                          </div>
                          {app.licenseNumber && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">{isHe ? 'מספר רישיון' : 'License'}</p>
                              <p className="text-sm font-medium text-[#3a3a1d]">{app.licenseNumber}</p>
                            </div>
                          )}
                          {app.idNumber && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">{isHe ? 'ת.ז.' : 'ID Number'}</p>
                              <p className="text-sm font-medium text-[#3a3a1d]">{app.idNumber}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3 stroke-[1.5]" /> {isHe ? 'אזורי משלוח' : 'Delivery Areas'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(app.areas || []).map(area => (
                                <span key={area} className="px-2.5 py-1 rounded-full text-xs bg-[#478c0b]/10 text-[#478c0b] font-medium">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3 stroke-[1.5]" /> {isHe ? 'זמינות' : 'Availability'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(app.availability || []).map(slot => (
                                <span key={slot} className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 font-medium">
                                  {slot}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {app.experience && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">{isHe ? 'ניסיון' : 'Experience'}</p>
                            <p className="text-sm text-[#3a3a1d]/80">{app.experience}</p>
                          </div>
                        )}

                        {app.whyJoin && (
                          <div className="mb-5">
                            <p className="text-xs text-gray-400 mb-1">{isHe ? 'למה רוצה להצטרף' : 'Why join KFAR'}</p>
                            <p className="text-sm text-[#3a3a1d]/80">{app.whyJoin}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                          {app.status !== 'approved' && (
                            <motion.button
                              onClick={() => updateStatus(app.applicationId, 'approved')}
                              disabled={updating === app.applicationId}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
                              whileTap={{ scale: 0.97 }}
                            >
                              <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                              {isHe ? 'אשר' : 'Approve'}
                            </motion.button>
                          )}
                          {app.status !== 'rejected' && (
                            <motion.button
                              onClick={() => updateStatus(app.applicationId, 'rejected')}
                              disabled={updating === app.applicationId}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                              whileTap={{ scale: 0.97 }}
                            >
                              <XCircle className="w-4 h-4 stroke-[1.5]" />
                              {isHe ? 'דחה' : 'Reject'}
                            </motion.button>
                          )}
                          {app.status === 'pending' && (
                            <motion.button
                              onClick={() => updateStatus(app.applicationId, 'reviewing')}
                              disabled={updating === app.applicationId}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
                              whileTap={{ scale: 0.97 }}
                            >
                              <Eye className="w-4 h-4 stroke-[1.5]" />
                              {isHe ? 'עבור לבדיקה' : 'Mark Reviewing'}
                            </motion.button>
                          )}
                          <motion.a
                            href={`https://wa.me/${app.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              isHe
                                ? `שלום ${app.fullName}, בנוגע למועמדות שלך לנהיגה עם כפר (${app.applicationId})`
                                : `Hi ${app.fullName}, regarding your KFAR driver application (${app.applicationId})`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            whileTap={{ scale: 0.97 }}
                          >
                            <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                            WhatsApp
                          </motion.a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Refresh button */}
      <div className="fixed bottom-6 right-6" style={isRTL ? { right: 'auto', left: '24px' } : {}}>
        <motion.button
          onClick={fetchApplications}
          className="w-12 h-12 rounded-full bg-[#478c0b] text-white shadow-lg flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5 stroke-[1.5]" />
        </motion.button>
      </div>
    </div>
  );
}
