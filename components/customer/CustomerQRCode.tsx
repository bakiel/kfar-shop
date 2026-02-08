'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';
import { useToast } from '@/components/ui/use-toast';
import { Share2, Download, CheckCircle, Mail, Link2 } from 'lucide-react';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  preferences: {
    dietary: string[];
    allergies: string[];
    favoriteCategories: string[];
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    savedByDiscounts: number;
  };
}

interface CustomerQRCodeProps {
  profile: CustomerProfile;
  size?: number;
  showActions?: boolean;
  variant?: 'compact' | 'full' | 'card';
}

export default function CustomerQRCode({ 
  profile, 
  size = 200, 
  showActions = true,
  variant = 'compact' 
}: CustomerQRCodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  // QR Code data structure
  const qrData = {
    type: 'customer',
    id: profile.id,
    name: profile.name,
    tier: profile.loyaltyTier,
    points: profile.points,
    preferences: profile.preferences,
    timestamp: new Date().toISOString()
  };

  // Tier colors and benefits
  const tierConfig = {
    bronze: {
      color: '#CD7F32',
      bgColor: 'from-orange-100 to-orange-200',
      benefits: ['5% off', 'Birthday bonus'],
      icon: '🥉'
    },
    silver: {
      color: '#C0C0C0',
      bgColor: 'from-gray-100 to-gray-200',
      benefits: ['10% off', 'Free shipping > ₪50'],
      icon: '🥈'
    },
    gold: {
      color: '#FFD700',
      bgColor: 'from-yellow-100 to-yellow-200',
      benefits: ['15% off', 'Free shipping', 'Priority support'],
      icon: '🥇'
    },
    platinum: {
      color: '#E5E4E2',
      bgColor: 'from-purple-100 to-purple-200',
      benefits: ['20% off', 'VIP events', 'Personal shopper'],
      icon: '💎'
    }
  };

  const currentTier = tierConfig[profile.loyaltyTier];

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownload = async () => {
    try {
      // Get the QR canvas element
      const canvas = document.querySelector('#customer-qr-canvas canvas') as HTMLCanvasElement;
      if (!canvas) return;

      // Create a temporary canvas with profile info
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      tempCanvas.width = 400;
      tempCanvas.height = 500;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, tempCanvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f3f4f6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Header with tier color
      ctx.fillStyle = currentTier.color;
      ctx.fillRect(0, 0, tempCanvas.width, 80);

      // Profile info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(profile.name, tempCanvas.width / 2, 35);

      ctx.font = '16px Arial';
      ctx.fillText(`${currentTier.icon} ${profile.loyaltyTier.toUpperCase()} Member`, tempCanvas.width / 2, 60);

      // QR Code
      ctx.drawImage(canvas, (tempCanvas.width - 250) / 2, 100, 250, 250);

      // Footer info
      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial';
      ctx.fillText('KFAR Marketplace Member', tempCanvas.width / 2, 380);
      ctx.fillText(`ID: ${profile.id}`, tempCanvas.width / 2, 400);
      
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = currentTier.color;
      ctx.fillText(`${profile.points} Points`, tempCanvas.width / 2, 430);

      // Download
      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kfar-member-${profile.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });

      toast({
        title: "QR Code Downloaded",
        description: "Your member QR code has been saved",
      });
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast({
        title: "Download Failed",
        description: "Please try again",
      });
    }
  };

  const renderCompact = () => (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.02 }}
    >
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br ${currentTier.bgColor} shadow-lg`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 mb-3">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: currentTier.color }}
            >
              {profile.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800">{profile.name}</h3>
            <p className="text-sm text-gray-600">{currentTier.icon} {profile.loyaltyTier}</p>
          </div>
        </div>

        <div id="customer-qr-canvas">
          <SmartQRCompactFixed
            type="customer"
            data={qrData}
            size={size}
            hideActions={true}
          />
        </div>

        <div className="mt-3 text-center">
          <p className="text-2xl font-bold" style={{ color: currentTier.color }}>
            {profile.points} Points
          </p>
          <p className="text-xs text-gray-600">Scan at checkout</p>
        </div>
      </div>

      {showActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2"
        >
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
          >
            <Share2 className="w-4 h-4 stroke-[1.5] mr-2 inline" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4 stroke-[1.5] mr-2 inline" />
            Save
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderFull = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: currentTier.color }}
            >
              {profile.name[0].toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 text-3xl">{currentTier.icon}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6" id="customer-qr-canvas">
        <SmartQRCompactFixed
          type="customer"
          data={qrData}
          size={250}
          hideActions={true}
        />
      </div>

      {/* Tier Info */}
      <div 
        className={`rounded-xl p-4 mb-6 bg-gradient-to-r ${currentTier.bgColor}`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg" style={{ color: '#3a3a1d' }}>
            {profile.loyaltyTier.toUpperCase()} Member
          </h3>
          <span className="text-2xl font-bold" style={{ color: currentTier.color }}>
            {profile.points} pts
          </span>
        </div>
        <div className="space-y-1">
          {currentTier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
            {profile.stats.totalOrders}
          </p>
          <p className="text-xs text-gray-600">Orders</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
            ₪{profile.stats.totalSpent}
          </p>
          <p className="text-xs text-gray-600">Total Spent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>
            ₪{profile.stats.savedByDiscounts}
          </p>
          <p className="text-xs text-gray-600">Saved</p>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4 stroke-[1.5] mr-2 inline" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 text-white rounded-lg font-semibold transition-all"
            style={{ backgroundColor: '#478c0b' }}
          >
            <Download className="w-4 h-4 stroke-[1.5] mr-2 inline" />
            Download
          </button>
        </div>
      )}
    </div>
  );

  const renderCard = () => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div 
        className={`h-2 bg-gradient-to-r ${currentTier.bgColor}`} 
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: currentTier.color }}
              >
                {profile.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-800">{profile.name}</h4>
              <p className="text-xs text-gray-600">Member since {profile.memberSince}</p>
            </div>
          </div>
          <span className="text-2xl">{currentTier.icon}</span>
        </div>

        <div className="flex justify-center mb-3" id="customer-qr-canvas">
          <SmartQRCompactFixed
            type="customer"
            data={qrData}
            size={120}
            hideActions={true}
          />
        </div>

        <div className="text-center">
          <p className="font-bold" style={{ color: currentTier.color }}>
            {profile.points} Points
          </p>
          <p className="text-xs text-gray-500">ID: {profile.id}</p>
        </div>
      </div>
    </motion.div>
  );

  // Share Modal
  const ShareModal = () => (
    <AnimatePresence>
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Share Your Member QR
            </h3>
            
            <div className="space-y-3 mb-6">
              <button
                className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                onClick={() => {
                  // WhatsApp share logic
                  window.open(`https://wa.me/?text=Check out my KFAR member QR code!`);
                }}
              >
                <Share2 className="w-4 h-4 stroke-[1.5] mr-2 inline" />
                Share via WhatsApp
              </button>
              
              <button
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                onClick={() => {
                  // Email share logic
                  window.location.href = `mailto:?subject=My KFAR Member QR&body=Check out my KFAR member QR code!`;
                }}
              >
                <Mail className="w-4 h-4 stroke-[1.5] mr-2 inline" />
                Share via Email
              </button>
              
              <button
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                onClick={() => {
                  // Copy profile link
                  navigator.clipboard.writeText(`https://kfar.com/member/${profile.id}`);
                  toast({
                    title: "Link Copied",
                    description: "Member profile link copied to clipboard",
                  });
                  setShowShareModal(false);
                }}
              >
                <Link2 className="w-4 h-4 stroke-[1.5] mr-2 inline" />
                Copy Link
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 text-gray-600 font-medium"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {variant === 'compact' && renderCompact()}
      {variant === 'full' && renderFull()}
      {variant === 'card' && renderCard()}
      <ShareModal />
    </>
  );
}