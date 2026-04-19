'use client';

// SalesLeaderboards
// Dual widget: Best Sellers (units sold) + Top Buyers (spend)
// Task #7 — mounted on /app/vendor/dashboard. Language 1: forest-green ink
// heads, cream rows, gold rank numerals.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';

interface BestSeller {
  productId: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
}
interface TopBuyer {
  name: string;
  email?: string;
  orderCount: number;
  totalSpent: number;
}

export default function SalesLeaderboards() {
  const { accessToken } = useAuth();
  const { isRTL } = useLanguage();
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch('/api/vendor/analytics/sales?days=30', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : { bestSellers: [], topBuyers: [] }))
      .then((data) => {
        setBestSellers(Array.isArray(data.bestSellers) ? data.bestSellers : []);
        setTopBuyers(Array.isArray(data.topBuyers) ? data.topBuyers : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="grid md:grid-cols-2 gap-5" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Best Sellers */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl border border-[#F5F0E8] overflow-hidden"
      >
        <header className="flex items-center gap-2 px-5 py-4 bg-[#FDFBF7] border-b border-[#F5F0E8]">
          <Trophy className="w-4 h-4 text-[#C4A265] stroke-[1.5]" />
          <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-[#1E3D1A]">
            {isRTL ? 'רבי המכר · 30 ימים' : 'Best sellers · 30 days'}
          </h3>
        </header>
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isRTL ? 'טוען...' : 'Loading...'}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              {isRTL ? 'אין מכירות עדיין' : 'No sales yet'}
            </div>
          ) : (
            <ol className="divide-y divide-[#F5F0E8]">
              {bestSellers.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 px-3 py-3">
                  <span className="text-2xl font-bold text-[#C4A265] w-6 text-center tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.unitsSold} {isRTL ? 'יחידות' : 'units'} · ₪{p.revenue.toFixed(0)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.section>

      {/* Top Buyers */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="bg-white rounded-xl border border-[#F5F0E8] overflow-hidden"
      >
        <header className="flex items-center gap-2 px-5 py-4 bg-[#FDFBF7] border-b border-[#F5F0E8]">
          <Users className="w-4 h-4 text-[#C4A265] stroke-[1.5]" />
          <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-[#1E3D1A]">
            {isRTL ? 'לקוחות מובילים · 30 ימים' : 'Top buyers · 30 days'}
          </h3>
        </header>
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isRTL ? 'טוען...' : 'Loading...'}
            </div>
          ) : topBuyers.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              {isRTL ? 'אין לקוחות עדיין' : 'No buyers yet'}
            </div>
          ) : (
            <ol className="divide-y divide-[#F5F0E8]">
              {topBuyers.map((b, i) => (
                <li key={`${b.name}-${i}`} className="flex items-center gap-3 px-3 py-3">
                  <span className="text-2xl font-bold text-[#C4A265] w-6 text-center tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{b.name}</div>
                    <div className="text-xs text-gray-500">
                      {b.orderCount} {isRTL ? 'הזמנות' : 'orders'} · ₪{b.totalSpent.toFixed(0)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.section>
    </div>
  );
}
