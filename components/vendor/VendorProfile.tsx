'use client';

import React from 'react';
import Image from 'next/image';

interface VendorProfileProps {
  vendorId: string;
  vendorName: string;
  description?: string;
  established?: string;
  ownerName?: string;
  ownerImage?: string;
  certifications?: string[];
}

// Map vendor IDs to owner profiles using community images
const vendorOwners: Record<string, { name: string; image: string; bio: string }> = {
  'teva-deli': {
    name: 'Immanuel Rivers',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_07.jpg',
    bio: 'Founded Teva Deli 15 years ago to bring authentic plant-based alternatives to traditional Israeli favorites.'
  },
  'queens-cuisine': {
    name: 'Koliyah Baht-Israel',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_06.jpg',
    bio: 'Master chef specializing in Middle Eastern vegan cuisine, bringing 20+ years of culinary expertise.'
  },
  'gahn-delight': {
    name: 'Ahmeeteeyah Cohen',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_04.jpg',
    bio: 'Artisan ice cream maker creating unique dairy-free frozen desserts with love and creativity.'
  },
  'people-store': {
    name: 'Nathaniel Ben-Israel',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_10.jpg',
    bio: 'Managing the People Store for over a decade, sourcing the finest organic products for our community.'
  },
  'garden-of-light': {
    name: 'Elishai Young',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_03.jpg',
    bio: 'Holistic nutrition expert bringing healing through food with premium vegan deli selections.'
  }
};

export default function VendorProfile({
  vendorId,
  vendorName,
  description,
  established,
  certifications = []
}: VendorProfileProps) {
  const owner = vendorOwners[vendorId];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      {/* Vendor Header */}
      <div className="flex items-start gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
            {vendorName}
          </h2>
          {established && (
            <p className="text-gray-600 mb-4">
              <i className="fas fa-calendar-alt mr-2" style={{ color: '#478c0b' }} />
              Established {established}
            </p>
          )}
          {description && (
            <p className="text-gray-700 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="flex flex-col gap-2">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-2"
                style={{ backgroundColor: '#478c0b' }}
              >
                <i className="fas fa-certificate text-xs" />
                {cert}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Owner Profile */}
      {owner && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#3a3a1d' }}>
            Meet the Owner
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
              <Image
                src={owner.image}
                alt={owner.name || "Image"}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/images/default-avatar.jpg';
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg" style={{ color: '#3a3a1d' }}>
                {owner.name}
              </h4>
              <p className="text-gray-600 mt-1">{owner.bio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Store Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
            <i className="fas fa-box mr-2" />
            48
          </div>
          <p className="text-sm text-gray-600">Products</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
            <i className="fas fa-star mr-2" />
            4.8
          </div>
          <p className="text-sm text-gray-600">Rating</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#c23c09' }}>
            <i className="fas fa-heart mr-2" />
            1.2k
          </div>
          <p className="text-sm text-gray-600">Followers</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          className="flex-1 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: '#478c0b' }}
        >
          <i className="fas fa-heart" />
          Follow Store
        </button>
        <button
          className="flex-1 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border-2"
          style={{ borderColor: '#478c0b', color: '#478c0b' }}
        >
          <i className="fas fa-envelope" />
          Contact Vendor
        </button>
      </div>
    </div>
  );
}