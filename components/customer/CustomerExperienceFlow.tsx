'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CustomerExperienceFlow() {
  const experiences = [
    {
      icon: '👤',
      title: 'Smart Profile',
      features: ['AI Avatar', 'Dietary Prefs', 'Language Choice'],
      color: '#478c0b'
    },
    {
      icon: '📱',
      title: 'QR Identity',
      features: ['Quick Payment', 'Event Access', 'Points Tracking'],
      color: '#f6af0d'
    },
    {
      icon: '⭐',
      title: 'Reviews & Rewards',
      features: ['Earn Points', 'Tier Benefits', 'Photo Reviews'],
      color: '#c23c09'
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      features: ['Voice Orders', 'Predictions', 'Personalization'],
      color: '#3a3a1d'
    },
    {
      icon: '📊',
      title: 'Dashboard',
      features: ['Order History', 'Analytics', 'Preferences'],
      color: '#478c0b'
    },
    {
      icon: '🌍',
      title: 'Community',
      features: ['Events', 'Volunteering', 'Social Features'],
      color: '#f6af0d'
    }
  ];

  return (
    <div className="p-8 bg-gray-50 rounded-2xl">
      <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
        Complete Customer Experience Journey
      </h2>

      {/* Main Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4 text-center">{exp.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-center" style={{ color: exp.color }}>
              {exp.title}
            </h3>
            <ul className="space-y-2">
              {exp.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check-circle text-xs" style={{ color: exp.color }} />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Customer Journey Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
          Daily Customer Journey
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Timeline Events */}
          <div className="space-y-8">
            {[
              { time: '8:00 AM', event: 'QR scan at village entrance', ai: 'AI suggests morning coffee' },
              { time: '8:30 AM', event: 'Voice order: "My usual breakfast"', ai: 'AI confirms with vendor' },
              { time: '12:00 PM', event: 'Browse marketplace for lunch', ai: 'AI shows personalized deals' },
              { time: '3:00 PM', event: 'Leave review, earn 150 points', ai: 'AI updates recommendations' },
              { time: '6:00 PM', event: 'Check community events', ai: 'AI suggests relevant workshops' },
              { time: '8:00 PM', event: 'Plan tomorrow\'s shopping', ai: 'AI predicts needs' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold z-10"
                     style={{ backgroundColor: '#478c0b' }}>
                  <span className="text-xs">{item.time}</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold" style={{ color: '#3a3a1d' }}>{item.event}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <i className="fas fa-robot mr-1" style={{ color: '#f6af0d' }} />
                    {item.ai}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Map */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
          System Integration Map
        </h3>
        
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl">
            {/* Central Customer Node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl z-20"
                 style={{ backgroundColor: '#478c0b' }}>
              Customer
            </div>
            
            {/* Surrounding Systems */}
            {[
              { name: 'Supabase', angle: 0 },
              { name: 'AI Engine', angle: 60 },
              { name: 'QR System', angle: 120 },
              { name: 'Reviews', angle: 180 },
              { name: 'Rewards', angle: 240 },
              { name: 'Analytics', angle: 300 }
            ].map((system, index) => {
              const radius = 150;
              const angleRad = (system.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute w-24 h-24 rounded-full flex items-center justify-center text-white font-medium shadow-lg"
                  style={{
                    backgroundColor: '#f6af0d',
                    top: `calc(50% + ${y}px - 48px)`,
                    left: `calc(50% + ${x}px - 48px)`
                  }}
                >
                  {system.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}