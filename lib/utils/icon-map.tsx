import React from 'react';
import {
  Zap, Truck, MapPin, QrCode, Mic, ShoppingBag, Store, UtensilsCrossed,
  Home, Sparkles, Calendar, Tag, User, LogIn, UserPlus, Gauge, Package,
  Gift, UserCircle, LogOut, Package2, Box, BarChart3, TrendingUp, Info,
  Mountain, BookOpen, CalendarDays, MessageCircle, HelpCircle, Headphones,
  Shield, ShieldCheck, Settings, SlidersHorizontal, Users, Crown
} from 'lucide-react';

// Maps FontAwesome icon class names to Lucide React components
// Used by menu-config.ts dynamic icon rendering
const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'fa-bolt': Zap,
  'fa-truck': Truck,
  'fa-map-marker-alt': MapPin,
  'fa-qrcode': QrCode,
  'fa-microphone': Mic,
  'fa-shopping-bag': ShoppingBag,
  'fa-store': Store,
  'fa-utensils': UtensilsCrossed,
  'fa-home': Home,
  'fa-spa': Sparkles,
  'fa-calendar': Calendar,
  'fa-tag': Tag,
  'fa-user': User,
  'fa-sign-in-alt': LogIn,
  'fa-user-plus': UserPlus,
  'fa-tachometer-alt': Gauge,
  'fa-box': Package,
  'fa-boxes': Package2,
  'fa-gift': Gift,
  'fa-user-circle': UserCircle,
  'fa-sign-out-alt': LogOut,
  'fa-cube': Box,
  'fa-chart-line': TrendingUp,
  'fa-chart-bar': BarChart3,
  'fa-users': Users,
  'fa-info-circle': Info,
  'fa-mountain': Mountain,
  'fa-book': BookOpen,
  'fa-book-open': BookOpen,
  'fa-calendar-alt': CalendarDays,
  'fa-comments': MessageCircle,
  'fa-cog': Settings,
  'fa-question-circle': HelpCircle,
  'fa-headset': Headphones,
  'fa-shield-alt': Shield,
  'fa-user-shield': ShieldCheck,
  'fa-users-cog': Users,
  'fa-sliders-h': SlidersHorizontal,
  'fa-crown': Crown,
};

interface FaIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a Lucide icon from a FontAwesome class name string.
 * Used for dynamic icon rendering from menu-config.ts.
 */
export const FaIcon: React.FC<FaIconProps> = ({ icon, className = 'w-5 h-5 stroke-[1.5]', style }) => {
  const IconComponent = iconComponents[icon];
  if (!IconComponent) {
    // Fallback: render nothing for unknown icons
    return null;
  }
  return <IconComponent className={className} style={style} />;
};

export default FaIcon;
