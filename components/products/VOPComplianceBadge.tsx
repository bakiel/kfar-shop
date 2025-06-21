'use client';

import React from 'react';

interface VOPComplianceBadgeProps {
  status: 'approved' | 'warning' | 'rejected';
  label: string;
  color: string;
  icon: string;
  score?: number;
  size?: 'small' | 'medium' | 'large';
  showScore?: boolean;
}

export default function VOPComplianceBadge({ 
  status, 
  label, 
  color, 
  icon, 
  score, 
  size = 'small',
  showScore = false 
}: VOPComplianceBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const iconSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const tooltipContent = (
    <div className="p-2 max-w-xs">
      <p className="font-semibold mb-1">VOP Dietary Compliance</p>
      <p className="text-sm">
        {status === 'approved' && 'This product meets all Village of Peace dietary standards.'}
        {status === 'warning' && 'This product needs review for full VOP compliance.'}
        {status === 'rejected' && 'This product does not meet VOP dietary requirements.'}
      </p>
      {showScore && score !== undefined && (
        <p className="text-sm mt-1">Health Score: {score}/100</p>
      )}
    </div>
  );

  return (
    <SimpleTooltip content={tooltipContent}>
      <div 
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} transition-all hover:scale-105`}
        style={{ 
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        <i className={`fas ${icon} ${iconSizes[size]}`}></i>
        <span>{label}</span>
        {showScore && score !== undefined && (
          <span className="opacity-75">({score})</span>
        )}
      </div>
    </SimpleTooltip>
  );
}

// Simple tooltip component if not already exists
export function SimpleTooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg">
            {content}
          </div>
          <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
        </div>
      )}
    </div>
  );
}