'use client';

import React, { useState, useEffect } from 'react';
import { CollectionPoints } from '@/lib/services/collection-point-service';
import { CollectionPoint, PickupSlot } from '@/lib/services/collection-point-service';
import { FaMapMarkerAlt, FaClock, FaQrcode, FaWifi, FaSnowflake, FaUsers } from 'react-icons/fa';

interface CollectionPointPickerProps {
  onSelect: (point: CollectionPoint, slot?: PickupSlot) => void;
  orderType?: 'standard' | 'p2p';
  showSlots?: boolean;
  userLocation?: { lat: number; lng: number };
}

export const CollectionPointPicker: React.FC<CollectionPointPickerProps> = ({
  onSelect,
  orderType = 'standard',
  showSlots = true,
  userLocation
}) => {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearestPoint, setNearestPoint] = useState<CollectionPoint | null>(null);

  useEffect(() => {
    loadCollectionPoints();
  }, [orderType]);

  useEffect(() => {
    if (selectedPoint && showSlots) {
      loadSlots(selectedPoint.id, selectedDate);
    }
  }, [selectedPoint, selectedDate, showSlots]);

  const loadCollectionPoints = async () => {
    try {
      setLoading(true);
      const filters = orderType === 'p2p' ? { type: 'p2p' } : undefined;
      const allPoints = await CollectionPoints.getAll(filters);
      setPoints(allPoints);

      // Find nearest point if user location is available
      if (userLocation) {
        const nearest = await CollectionPoints.findNearest(
          userLocation.lat,
          userLocation.lng,
          orderType === 'p2p' ? 'p2p' : undefined
        );
        setNearestPoint(nearest);
      }
    } catch (error) {
      console.error('Failed to load collection points:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (pointId: string, date: Date) => {
    try {
      const availableSlots = await CollectionPoints.checkAvailability(pointId, date);
      setSlots(availableSlots);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setSlots([]);
    }
  };

  const handlePointSelect = (point: CollectionPoint) => {
    setSelectedPoint(point);
    if (!showSlots) {
      onSelect(point);
    }
  };

  const handleSlotSelect = (slot: PickupSlot) => {
    setSelectedSlot(slot);
    if (selectedPoint) {
      onSelect(selectedPoint, slot);
    }
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getFeatureIcon = (feature: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'qr-scanner': <FaQrcode />,
      'nfc-reader': <FaWifi />,
      'refrigerated': <FaSnowflake />,
      'staff-assisted': <FaUsers />,
      '24/7 access': <FaClock />
    };
    return icons[feature] || null;
  };

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'locker': return '#478c0b';
      case 'counter': return '#f6af0d';
      case 'p2p': return '#5C6BC0';
      default: return '#666';
    }
  };

  const formatDistance = (point: CollectionPoint): string => {
    // In real implementation, calculate actual distance
    return `${(Math.random() * 5 + 0.5).toFixed(1)} km`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading collection points...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Points List */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
          {orderType === 'p2p' ? 'P2P Exchange Points' : 'Collection Points'}
        </h3>

        {nearestPoint && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-sm font-medium text-green-800 mb-1">
              <FaMapMarkerAlt className="inline mr-2" />
              Nearest to you
            </p>
            <p className="font-semibold">{nearestPoint.name}</p>
          </div>
        )}

        <div className="space-y-3">
          {points.map((point) => (
            <div
              key={point.id}
              onClick={() => handlePointSelect(point)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPoint?.id === point.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPointTypeColor(point.type) }}
                    />
                    <h4 className="font-semibold">{point.name}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <FaMapMarkerAlt className="inline mr-1" />
                    {point.location.address}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {point.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                      >
                        {getFeatureIcon(feature)}
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-medium ${
                      point.availability.status === 'available' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {point.availability.status === 'available' ? 'Available' : 'Busy'}
                    </span>
                    <span className="text-gray-500">
                      {formatDistance(point)} away
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <i className="fas fa-star"></i>
                    <span className="font-medium">{point.stats.rating}</span>
                  </div>
                  <p className="text-gray-500">
                    {point.stats.reviewCount} reviews
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {showSlots && selectedPoint && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
            Select Pickup Time
          </h3>

          {/* Date Selection */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => handleDateChange(-1)}
              disabled={selectedDate.toDateString() === new Date().toDateString()}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="flex-1 text-center">
              <p className="font-semibold">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 rounded-lg border hover:bg-gray-50"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'bg-green-500 text-white'
                      : slot.available
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.startTime}
                  {!slot.available && (
                    <span className="block text-xs mt-1">Full</span>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No slots available for this date
              </div>
            )}
          </div>

          {/* Selected Summary */}
          {selectedSlot && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="font-semibold text-green-800">
                <i className="fas fa-check-circle mr-2"></i>
                Selected Pickup Details
              </p>
              <p className="text-sm mt-2">
                <strong>Location:</strong> {selectedPoint.name}
              </p>
              <p className="text-sm">
                <strong>Date:</strong> {selectedDate.toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">Collection Instructions:</p>
        <ul className="space-y-1">
          <li>• Bring your phone with the QR code ready</li>
          <li>• Collection is available during operating hours</li>
          <li>• {orderType === 'p2p' ? 'Both parties must verify the exchange' : 'Orders are held for 48 hours'}</li>
        </ul>
      </div>
    </div>
  );
};