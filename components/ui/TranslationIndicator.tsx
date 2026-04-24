import React from 'react';
import { Languages } from 'lucide-react';

interface TranslationIndicatorProps {
  isTranslating: boolean;
  position?: 'right' | 'left';
  top?: string;
}

export default function TranslationIndicator({ 
  isTranslating, 
  position = 'right',
  top = 'top-1/2 -translate-y-1/2' 
}: TranslationIndicatorProps) {
  if (!isTranslating) return null;

  const positionClass = position === 'right' ? 'right-3' : 'left-3';

  return (
    <div className={`absolute ${positionClass} ${top} flex items-center gap-2`}>
      <div className="flex items-center gap-1 px-2 py-1 bg-leaf-green/10 rounded-full">
        <Languages className="w-4 h-4 stroke-[1.5] text-leaf-green animate-pulse" />
        <span className="text-xs text-leaf-green font-medium">Translating...</span>
      </div>
    </div>
  );
}

export function TranslationBadge({ 
  active, 
  compact = false 
}: { 
  active: boolean; 
  compact?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full transition-all duration-300 ${
      active 
        ? 'bg-leaf-green/20 border border-leaf-green/30' 
        : 'bg-gray-100 border border-gray-200'
    }`}>
      <Languages className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} stroke-[1.5] ${
        active ? 'text-leaf-green' : 'text-gray-400'
      }`} />
      {!compact && (
        <span className={`text-xs font-medium ${
          active ? 'text-leaf-green' : 'text-gray-500'
        }`}>
          {active ? 'Auto-Translate ON' : 'Auto-Translate OFF'}
        </span>
      )}
    </div>
  );
}