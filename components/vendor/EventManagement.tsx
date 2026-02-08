'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  event_type: string;
  status: string;
  start_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  capacity?: number;
  current_registrations: number;
  is_free: boolean;
  price?: number;
  featured: boolean;
  registrationStats?: {
    total_attendees: number;
    confirmed_attendees: number;
    waitlist_attendees: number;
  };
}

export default function EventManagement({ vendorId }: { vendorId: number }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchVendorEvents();
  }, [vendorId]);

  const fetchVendorEvents = async () => {
    try {
      const response = await fetch('/api/events/vendor/my-events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (eventId: number, currentStatus: string) => {
    try {
      const response = await fetch(`/api/events/vendor/${eventId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ publish: currentStatus !== 'published' })
      });

      if (response.ok) {
        fetchVendorEvents();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const EventForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      slug: '',
      description: '',
      long_description: '',
      category: 'workshop',
      event_type: 'one-time',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      venue_name: '',
      venue_address: '',
      capacity: '',
      is_free: true,
      price: '',
      registration_required: false,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      tags: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/events/vendor/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()),
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            price: !formData.is_free && formData.price ? parseFloat(formData.price) : null
          })
        });

        if (response.ok) {
          setShowCreateForm(false);
          fetchVendorEvents();
        }
      } catch (error) {
        console.error('Error creating event:', error);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Create New Event</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Detailed Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="workshop">Workshop</option>
                <option value="dining">Food & Dining</option>
                <option value="cultural">Cultural Event</option>
                <option value="wellness">Wellness</option>
                <option value="market">Market</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              >
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
                <option value="series">Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date (if multi-day)</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Venue Address</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                value={formData.venue_address}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_free}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium">Free Event</span>
            </label>

            {!formData.is_free && (
              <div>
                <label className="block text-sm font-medium mb-1">Price (₪)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.registration_required}
                onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium">Registration Required</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="workshop, vegan, cooking"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              style={{ backgroundColor: '#478c0b' }}
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>Event Management</h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
            style={{ backgroundColor: '#478c0b' }}
          >
            <i className="fas fa-plus"></i>
            Create New Event
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && <EventForm />}

      {/* Events List */}
      {!showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Your Events</h3>
            
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events yet. Create your first event!</p>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold" style={{ color: '#3a3a1d' }}>{event.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                          {event.featured && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {format(new Date(event.start_date), 'MMM d, yyyy')}
                          </span>
                          <span>
                            <i className="fas fa-clock mr-1"></i>
                            {event.start_time} - {event.end_time}
                          </span>
                          <span>
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {event.venue_name}
                          </span>
                          {event.capacity && (
                            <span>
                              <i className="fas fa-users mr-1"></i>
                              {event.current_registrations || 0}/{event.capacity}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handlePublishToggle(event.id, event.status)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            event.status === 'published'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <i className={`fas ${event.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}