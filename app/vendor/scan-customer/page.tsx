'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, QrCode, DollarSign, Percent, TrendingUp, Receipt, Lightbulb } from 'lucide-react';
import CustomerQRScanner from '@/components/vendor/CustomerQRScanner';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/context/AuthContext';

interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerTier: string;
  amount: number;
  discount: number;
  pointsAwarded: number;
  timestamp: string;
}

export default function VendorScanCustomerPage() {
  const { user, accessToken } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    todayScans: 0,
    todayRevenue: 0,
    todayDiscounts: 0,
    avgTransaction: 0
  });
  const { toast } = useToast();

  // Get vendorId from auth context or legacy localStorage
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    let id = user?.vendorId || '';
    if (!id) {
      try {
        const authStr = localStorage.getItem('vendorAuth');
        if (authStr) {
          const auth = JSON.parse(authStr);
          id = auth.vendorId || '';
        }
      } catch { /* ignore */ }
    }
    setVendorId(id);
  }, [user]);

  const handleScanSuccess = (result: any) => {
    // Build transaction from scan result
    const transaction: Transaction = {
      id: result.transactionId || `txn-${Date.now()}`,
      customerId: result.customer?.id || '',
      customerName: result.customer?.name || 'Customer',
      customerTier: result.customer?.tier || 'bronze',
      amount: result.amount || 0,
      discount: result.discount || 0,
      pointsAwarded: result.pointsAwarded || 0,
      timestamp: result.timestamp || new Date().toISOString(),
    };

    // Add to recent transactions
    setRecentTransactions(prev => [transaction, ...prev].slice(0, 10));

    // Update stats
    setStats(prev => ({
      todayScans: prev.todayScans + 1,
      todayRevenue: prev.todayRevenue + transaction.amount,
      todayDiscounts: prev.todayDiscounts + transaction.discount,
      avgTransaction: prev.todayScans > 0
        ? Math.round((prev.todayRevenue + transaction.amount) / (prev.todayScans + 1))
        : transaction.amount
    }));

    toast({
      title: "Customer Applied",
      description: `${transaction.customerName}'s benefits have been applied to this transaction`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
            Customer Check-in
          </h1>
          <p className="text-gray-600 mt-2">
            Scan customer QR codes to apply their membership benefits
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Scans</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{stats.todayScans}</p>
              </div>
              <QrCode className="w-8 h-8 stroke-[1.5]" style={{ color: '#478c0b' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                  {stats.todayRevenue > 0 ? `\u20AA${stats.todayRevenue}` : '\u20AA0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 stroke-[1.5]" style={{ color: '#f6af0d' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Discounts Given</p>
                <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                  {stats.todayDiscounts > 0 ? `\u20AA${stats.todayDiscounts}` : '\u20AA0'}
                </p>
              </div>
              <Percent className="w-8 h-8 stroke-[1.5]" style={{ color: '#c23c09' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
                  {stats.avgTransaction > 0 ? `\u20AA${stats.avgTransaction}` : '\u20AA0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 stroke-[1.5]" style={{ color: '#3a3a1d' }} />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CustomerQRScanner
              vendorId={vendorId}
              onScanSuccess={handleScanSuccess}
            />
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Recent Transactions
              </h3>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="w-10 h-10 stroke-[1.5] mx-auto mb-3" />
                  <p>No transactions yet today</p>
                  <p className="text-sm mt-1">Scan a customer QR to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{transaction.customerName}</p>
                          <p className="text-sm text-gray-600">
                            <span className="capitalize">{transaction.customerTier}</span> member {' '}
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{'\u20AA'}{transaction.amount}</p>
                          {transaction.discount > 0 && (
                            <p className="text-sm text-green-600">-{'\u20AA'}{transaction.discount}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        {transaction.pointsAwarded > 0 && (
                          <span>Points awarded: {transaction.pointsAwarded}</span>
                        )}
                        <span>ID: {transaction.customerId.substring(0, 12)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Summary */}
            {recentTransactions.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Session Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold">{stats.todayScans}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold">{'\u20AA'}{stats.todayRevenue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Discounts</span>
                    <span className="font-semibold">{'\u20AA'}{stats.todayDiscounts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Net Revenue</span>
                    <span className="font-semibold font-bold">{'\u20AA'}{stats.todayRevenue - stats.todayDiscounts}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>
            <Lightbulb className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#f6af0d' }} />
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p>Remind customers to scan their QR for instant discounts</p>
              <p className="mt-1">Higher tier members get better discounts automatically</p>
            </div>
            <div>
              <p>Customer preferences and allergies appear after scanning</p>
              <p className="mt-1">Points are awarded instantly to their account</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
