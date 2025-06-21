'use client';

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import QRTrackingService, { QRAnalytics } from '@/lib/services/qr-tracking';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface QRTrackingDashboardProps {
  vendorId?: string;
}

export default function QRTrackingDashboard({ vendorId }: QRTrackingDashboardProps) {
  const [analytics, setAnalytics] = useState<QRAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [vendorId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await QRTrackingService.getAnalytics(vendorId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading QR analytics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">No QR tracking data available</p>
      </div>
    );
  }

  // Prepare chart data
  const scanTrendData = {
    labels: analytics.scansByDay.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'QR Scans',
        data: analytics.scansByDay.map(d => d.count),
        borderColor: '#478c0b',
        backgroundColor: 'rgba(71, 140, 11, 0.1)',
        tension: 0.1
      }
    ]
  };

  const scanTypeData = {
    labels: Object.keys(analytics.scansByType),
    datasets: [
      {
        data: Object.values(analytics.scansByType),
        backgroundColor: [
          '#478c0b',
          '#f6af0d',
          '#c23c09',
          '#5C6BC0',
          '#00897B'
        ]
      }
    ]
  };

  const topProductsData = {
    labels: analytics.topProducts.map(p => p.productName),
    datasets: [
      {
        label: 'Scans',
        data: analytics.topProducts.map(p => p.scanCount),
        backgroundColor: '#478c0b'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
            QR Code Analytics
          </h2>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  {analytics.totalScans.toLocaleString()}
                </p>
              </div>
              <i className="fas fa-qrcode text-3xl opacity-20" style={{ color: '#478c0b' }}></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                  {analytics.uniqueUsers.toLocaleString()}
                </p>
              </div>
              <i className="fas fa-users text-3xl opacity-20" style={{ color: '#f6af0d' }}></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scan Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                  {analytics.scansByDay.length > 0 
                    ? Math.round(analytics.totalScans / analytics.scansByDay.length)
                    : 0}/day
                </p>
              </div>
              <i className="fas fa-chart-line text-3xl opacity-20" style={{ color: '#c23c09' }}></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Most Scanned</p>
                <p className="text-lg font-bold text-purple-700">
                  {analytics.topProducts[0]?.productName || 'N/A'}
                </p>
              </div>
              <i className="fas fa-trophy text-3xl opacity-20 text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
            Scan Trend
          </h3>
          <div className="h-64">
            <Line 
              data={scanTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Scan Types */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
            Scan Types
          </h3>
          <div className="h-64">
            <Doughnut 
              data={scanTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
          Top Scanned Products
        </h3>
        <div className="h-64">
          <Bar
            data={topProductsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
          Recent QR Scans
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product/Item</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Product
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">Seitan Schnitzel</td>
                <td className="px-4 py-3 text-sm text-gray-600">2 min ago</td>
                <td className="px-4 py-3 text-sm">Guest User</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800">
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              {/* Add more rows based on actual data */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
          Export QR Data
        </h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <i className="fas fa-file-csv mr-2"></i>
            Export to CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-file-pdf mr-2"></i>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}