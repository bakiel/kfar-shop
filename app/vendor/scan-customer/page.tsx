'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CustomerQRScanner from '@/components/vendor/CustomerQRScanner';
import { useToast } from '@/components/ui/use-toast';

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
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    todayScans: 23,
    todayRevenue: 1847,
    todayDiscounts: 276,
    avgTransaction: 80
  });
  const { toast } = useToast();

  // In production, get vendorId from auth
  const vendorId = 'teva-deli';

  const handleScanSuccess = (result: any) => {
    // Create a mock transaction
    const transaction: Transaction = {
      id: result.transactionId,
      customerId: result.customer.id,
      customerName: result.customer.name,
      customerTier: result.customer.tier,
      amount: 125, // Mock amount
      discount: result.customer.tier === 'gold' ? 18.75 : 12.50,
      pointsAwarded: 125, // 1 point per shekel
      timestamp: result.timestamp
    };

    // Add to recent transactions
    setRecentTransactions(prev => [transaction, ...prev].slice(0, 5));

    // Update stats
    setStats(prev => ({
      todayScans: prev.todayScans + 1,
      todayRevenue: prev.todayRevenue + transaction.amount,
      todayDiscounts: prev.todayDiscounts + transaction.discount,
      avgTransaction: Math.round((prev.todayRevenue + transaction.amount) / (prev.todayScans + 1))
    }));

    toast({
      title: "Customer Applied",
      description: `${result.customer.name}'s benefits have been applied to this transaction`,
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
            <i className="fas fa-arrow-left" />
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
              <i className="fas fa-qrcode text-3xl" style={{ color: '#478c0b' }} />
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
                <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>₪{stats.todayRevenue}</p>
              </div>
              <i className="fas fa-shekel-sign text-3xl" style={{ color: '#f6af0d' }} />
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
                <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>₪{stats.todayDiscounts}</p>
              </div>
              <i className="fas fa-percentage text-3xl" style={{ color: '#c23c09' }} />
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
                <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>₪{stats.avgTransaction}</p>
              </div>
              <i className="fas fa-chart-line text-3xl" style={{ color: '#3a3a1d' }} />
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
                  <i className="fas fa-receipt text-4xl mb-3" />
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
                            {transaction.customerTier} member • {new Date(transaction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₪{transaction.amount}</p>
                          <p className="text-sm text-green-600">-₪{transaction.discount}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Points awarded: {transaction.pointsAwarded}</span>
                        <span>ID: {transaction.customerId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Member Tier Distribution */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Today's Customer Mix
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥉</span>
                    <span>Bronze Members</span>
                  </div>
                  <span className="font-semibold">8 customers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <span>Silver Members</span>
                  </div>
                  <span className="font-semibold">6 customers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <span>Gold Members</span>
                  </div>
                  <span className="font-semibold">7 customers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💎</span>
                    <span>Platinum Members</span>
                  </div>
                  <span className="font-semibold">2 customers</span>
                </div>
              </div>
            </div>
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
            <i className="fas fa-lightbulb mr-2" style={{ color: '#f6af0d' }} />
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p>• Remind customers to scan their QR for instant discounts</p>
              <p>• Higher tier members get better discounts automatically</p>
            </div>
            <div>
              <p>• Customer preferences and allergies appear after scanning</p>
              <p>• Points are awarded instantly to their account</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}