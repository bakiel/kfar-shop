'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Clock, DollarSign, TrendingUp, Users, Package, Zap, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavingsInputs {
  productsPerWeek: number;
  hoursPerProduct: number;
  hourlyRate: number;
  marketingBudget: number;
  currentRevenue: number;
  employeeCount: number;
}

interface SavingsResults {
  timeSaved: {
    hoursPerWeek: number;
    hoursPerYear: number;
    daysPerYear: number;
  };
  moneySaved: {
    laborCosts: number;
    marketingCosts: number;
    totalAnnual: number;
    totalMonthly: number;
  };
  revenueIncrease: {
    percentage: number;
    annualAmount: number;
    monthlyAmount: number;
  };
  roi: {
    months: number;
    percentage: number;
  };
}

const KFAR_MONTHLY_COST = 149; // Example monthly subscription cost

export default function CostSavingsCalculator() {
  const [inputs, setInputs] = useState<SavingsInputs>({
    productsPerWeek: 20,
    hoursPerProduct: 0.5,
    hourlyRate: 50,
    marketingBudget: 1000,
    currentRevenue: 10000,
    employeeCount: 1
  });

  const [showResults, setShowResults] = useState(false);
  const [animateNumbers, setAnimateNumbers] = useState(false);

  const calculateSavings = (): SavingsResults => {
    // Time savings calculations
    const hoursPerWeek = inputs.productsPerWeek * inputs.hoursPerProduct * 0.8; // AI saves 80% of time
    const hoursPerYear = hoursPerWeek * 52;
    const daysPerYear = hoursPerYear / 8;

    // Money savings calculations
    const laborCosts = hoursPerYear * inputs.hourlyRate;
    const marketingCosts = inputs.marketingBudget * 12 * 0.7; // 70% reduction in marketing costs
    const totalAnnualSavings = laborCosts + marketingCosts;
    const totalMonthlySavings = totalAnnualSavings / 12;

    // Revenue increase calculations (based on industry averages)
    const revenueIncreasePercent = 35; // 35% average increase with AI tools
    const annualRevenueIncrease = inputs.currentRevenue * 12 * (revenueIncreasePercent / 100);
    const monthlyRevenueIncrease = annualRevenueIncrease / 12;

    // ROI calculations
    const annualCost = KFAR_MONTHLY_COST * 12;
    const netBenefit = totalAnnualSavings + annualRevenueIncrease - annualCost;
    const roiPercentage = (netBenefit / annualCost) * 100;
    const monthsToROI = annualCost / (totalMonthlySavings + monthlyRevenueIncrease);

    return {
      timeSaved: {
        hoursPerWeek,
        hoursPerYear,
        daysPerYear
      },
      moneySaved: {
        laborCosts,
        marketingCosts,
        totalAnnual: totalAnnualSavings,
        totalMonthly: totalMonthlySavings
      },
      revenueIncrease: {
        percentage: revenueIncreasePercent,
        annualAmount: annualRevenueIncrease,
        monthlyAmount: monthlyRevenueIncrease
      },
      roi: {
        months: Math.ceil(monthsToROI),
        percentage: Math.round(roiPercentage)
      }
    };
  };

  const results = calculateSavings();

  useEffect(() => {
    if (showResults) {
      setAnimateNumbers(true);
    }
  }, [showResults]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('ILS', '₪');
  };

  const AnimatedNumber = ({ value, format = 'number', suffix = '' }: { value: number; format?: 'number' | 'currency'; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (animateNumbers) {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            current = value;
            clearInterval(timer);
          }
          setDisplayValue(current);
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, [value, animateNumbers]);

    if (format === 'currency') {
      return <>{formatCurrency(displayValue)}{suffix}</>;
    }
    return <>{Math.round(displayValue).toLocaleString()}{suffix}</>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sun-gold to-earth-flame p-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Calculator className="w-8 h-8" />
          Calculate Your Savings with AI
        </h3>
        <p className="text-white/90">
          See how much time and money you'll save by automating with KFAR Marketplace
        </p>
      </div>

      <div className="p-6">
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">Your Current Business</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Products Added Per Week
              </label>
              <input
                type="number"
                value={inputs.productsPerWeek}
                onChange={(e) => setInputs({ ...inputs, productsPerWeek: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hours Spent Per Product
              </label>
              <input
                type="number"
                value={inputs.hoursPerProduct}
                onChange={(e) => setInputs({ ...inputs, hoursPerProduct: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="0.1"
                max="5"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Your Hourly Rate (₪)
              </label>
              <input
                type="number"
                value={inputs.hourlyRate}
                onChange={(e) => setInputs({ ...inputs, hourlyRate: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="20"
                max="500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">Current Expenses & Revenue</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Monthly Marketing Budget (₪)
              </label>
              <input
                type="number"
                value={inputs.marketingBudget}
                onChange={(e) => setInputs({ ...inputs, marketingBudget: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="0"
                max="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Monthly Revenue (₪)
              </label>
              <input
                type="number"
                value={inputs.currentRevenue}
                onChange={(e) => setInputs({ ...inputs, currentRevenue: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="1000"
                max="1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Number of Employees
              </label>
              <input
                type="number"
                value={inputs.employeeCount}
                onChange={(e) => setInputs({ ...inputs, employeeCount: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-green focus:border-transparent"
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              setShowResults(true);
              setAnimateNumbers(false);
              setTimeout(() => setAnimateNumbers(true), 100);
            }}
            className="px-8 py-3 bg-leaf-green text-white rounded-lg hover:bg-leaf-green-dark transition-colors text-lg font-semibold flex items-center gap-2 mx-auto"
          >
            <Calculator className="w-5 h-5" />
            Calculate My Savings
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* ROI Highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
              <h4 className="text-2xl font-bold text-green-800 mb-2">
                <AnimatedNumber value={results.roi.percentage} suffix="%" /> ROI
              </h4>
              <p className="text-green-700">
                Pay back your investment in just <AnimatedNumber value={results.roi.months} /> months!
              </p>
            </div>

            {/* Savings Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Time Saved */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-semibold text-blue-800">Time Saved</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      <AnimatedNumber value={results.timeSaved.hoursPerWeek} /> hrs/week
                    </p>
                    <p className="text-sm text-blue-600">Hours saved weekly</p>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-lg font-semibold text-blue-700">
                      <AnimatedNumber value={results.timeSaved.daysPerYear} /> days/year
                    </p>
                    <p className="text-sm text-blue-600">Work days saved annually</p>
                  </div>
                </div>
              </div>

              {/* Money Saved */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-semibold text-green-800">Money Saved</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      <AnimatedNumber value={results.moneySaved.totalMonthly} format="currency" />
                    </p>
                    <p className="text-sm text-green-600">Saved monthly</p>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-lg font-semibold text-green-700">
                      <AnimatedNumber value={results.moneySaved.totalAnnual} format="currency" />
                    </p>
                    <p className="text-sm text-green-600">Saved annually</p>
                  </div>
                </div>
              </div>

              {/* Revenue Growth */}
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-semibold text-purple-800">Revenue Growth</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      +<AnimatedNumber value={results.revenueIncrease.percentage} />%
                    </p>
                    <p className="text-sm text-purple-600">Revenue increase</p>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <p className="text-lg font-semibold text-purple-700">
                      <AnimatedNumber value={results.revenueIncrease.annualAmount} format="currency" />
                    </p>
                    <p className="text-sm text-purple-600">Extra revenue/year</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h5 className="font-semibold text-gray-800 mb-4">Savings Breakdown</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Labor Cost Savings</span>
                  <span className="font-semibold">{formatCurrency(results.moneySaved.laborCosts)}/year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Marketing Cost Reduction</span>
                  <span className="font-semibold">{formatCurrency(results.moneySaved.marketingCosts)}/year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Additional Revenue</span>
                  <span className="font-semibold">{formatCurrency(results.revenueIncrease.annualAmount)}/year</span>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Annual Benefit</span>
                    <span className="text-xl font-bold text-leaf-green">
                      {formatCurrency(results.moneySaved.totalAnnual + results.revenueIncrease.annualAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">KFAR Annual Cost</span>
                  <span className="text-gray-500">-{formatCurrency(KFAR_MONTHLY_COST * 12)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Net Annual Benefit</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(results.moneySaved.totalAnnual + results.revenueIncrease.annualAmount - (KFAR_MONTHLY_COST * 12))}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark rounded-xl p-6 text-center text-white">
              <h4 className="text-2xl font-bold mb-2">
                Start Saving {formatCurrency(results.moneySaved.totalMonthly)} Every Month!
              </h4>
              <p className="text-white/90 mb-4">
                Join hundreds of vendors who are already growing with AI-powered tools
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/vendor/onboarding"
                  className="px-6 py-3 bg-white text-leaf-green rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Start Free Trial
                </a>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                >
                  Print Results
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Features That Save You Money */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">How KFAR AI Saves You Money:</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-leaf-green flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-700">Instant Product Listings</p>
                <p className="text-sm text-gray-600">Upload a photo, get complete product data in seconds</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Languages className="w-5 h-5 text-sun-gold flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-700">Automatic Translation</p>
                <p className="text-sm text-gray-600">Reach Hebrew and English speakers without hiring translators</p>
              </div>
            </div>
            <div className="flex gap-3">
              <BarChart className="w-5 h-5 text-earth-flame flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-700">Smart Pricing</p>
                <p className="text-sm text-gray-600">AI analyzes market data to maximize your profits</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="w-5 h-5 text-soil-brown flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-700">Built-in Marketing</p>
                <p className="text-sm text-gray-600">QR codes, SEO, and customer engagement tools included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}