// Menu Configuration for KFAR Marketplace
// This file defines the complete menu structure with role-based visibility

export interface MenuItem {
  id: string;
  label: string;
  labelHe?: string;
  href?: string;
  icon?: string;
  action?: () => void;
  badge?: number;
  visibility?: 'all' | 'guest' | 'customer' | 'vendor' | 'admin';
  divider?: boolean;
}

export interface MenuSection {
  id: string;
  title: string;
  titleHe?: string;
  icon?: string;
  items: MenuItem[];
  visibility?: 'all' | 'guest' | 'customer' | 'vendor' | 'admin';
}

export const getMenuConfig = (userRole: 'guest' | 'customer' | 'vendor' | 'admin', orderCount?: number) => {
  const menuSections: MenuSection[] = [
    // Quick Actions - Context aware
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      titleHe: 'פעולות מהירות',
      icon: 'fa-bolt',
      items: [
        {
          id: 'active-orders',
          label: 'Active Orders',
          labelHe: 'הזמנות פעילות',
          href: '/vendor/orders',
          icon: 'fa-truck',
          badge: orderCount,
          visibility: 'vendor'
        },
        {
          id: 'track-order',
          label: 'Track Order',
          labelHe: 'מעקב הזמנה',
          href: '/customer/track',
          icon: 'fa-map-marker-alt',
          visibility: 'customer'
        },
        {
          id: 'scan-qr',
          label: 'Scan QR Code',
          labelHe: 'סרוק קוד QR',
          icon: 'fa-qrcode',
          action: () => window.dispatchEvent(new CustomEvent('open-qr-scanner')),
          visibility: 'all'
        },
        {
          id: 'voice-assistant',
          label: 'Voice Assistant',
          labelHe: 'עוזר קולי',
          icon: 'fa-microphone',
          action: () => window.dispatchEvent(new CustomEvent('open-voice-chat')),
          visibility: 'all'
        }
      ]
    },

    // Shop & Services
    {
      id: 'shop-services',
      title: 'Shop & Services',
      titleHe: 'חנות ושירותים',
      icon: 'fa-shopping-bag',
      items: [
        {
          id: 'marketplace',
          label: 'Marketplace',
          labelHe: 'שוק',
          href: '/marketplace',
          icon: 'fa-store'
        },
        {
          id: 'food-dining',
          label: 'Food & Dining',
          labelHe: 'אוכל ואוכל',
          href: '/services?category=food',
          icon: 'fa-utensils'
        },
        {
          id: 'home-services',
          label: 'Home Services',
          labelHe: 'שירותי בית',
          href: '/services?category=home',
          icon: 'fa-home'
        },
        {
          id: 'personal-care',
          label: 'Personal Care',
          labelHe: 'טיפול אישי',
          href: '/services?category=personal',
          icon: 'fa-spa'
        },
        {
          id: 'events',
          label: 'Events & Community',
          labelHe: 'אירועים וקהילה',
          href: '/services?category=events',
          icon: 'fa-calendar'
        },
        {
          id: 'special-offers',
          label: 'Special Offers',
          labelHe: 'מבצעים מיוחדים',
          href: '/deals',
          icon: 'fa-tag'
        }
      ]
    },

    // My Account - Dynamic based on user role
    {
      id: 'my-account',
      title: userRole === 'guest' ? 'Sign In' : 'My Account',
      titleHe: userRole === 'guest' ? 'התחבר' : 'החשבון שלי',
      icon: 'fa-user',
      items: userRole === 'guest' ? [
        {
          id: 'sign-in',
          label: 'Sign In',
          labelHe: 'התחבר',
          href: '/login',
          icon: 'fa-sign-in-alt'
        },
        {
          id: 'create-account',
          label: 'Create Account',
          labelHe: 'צור חשבון',
          href: '/register',
          icon: 'fa-user-plus'
        },
        {
          id: 'join-vendor',
          label: 'Join as Vendor',
          labelHe: 'הצטרף כספק',
          href: '/vendor/register',
          icon: 'fa-store'
        }
      ] : userRole === 'customer' ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          labelHe: 'לוח בקרה',
          href: '/customer/dashboard',
          icon: 'fa-tachometer-alt'
        },
        {
          id: 'orders',
          label: 'Orders',
          labelHe: 'הזמנות',
          href: '/customer/orders',
          icon: 'fa-box'
        },
        {
          id: 'rewards',
          label: 'Rewards',
          labelHe: 'תגמולים',
          href: '/customer/rewards',
          icon: 'fa-gift'
        },
        {
          id: 'profile',
          label: 'Profile',
          labelHe: 'פרופיל',
          href: '/customer/profile',
          icon: 'fa-user-circle'
        },
        {
          id: 'logout',
          label: 'Sign Out',
          labelHe: 'התנתק',
          icon: 'fa-sign-out-alt',
          action: () => {
            localStorage.removeItem('customerToken');
            window.location.href = '/';
          }
        }
      ] : userRole === 'vendor' ? [
        {
          id: 'vendor-dashboard',
          label: 'Dashboard',
          labelHe: 'לוח בקרה',
          href: '/vendor/dashboard',
          icon: 'fa-tachometer-alt'
        },
        {
          id: 'vendor-orders',
          label: 'Orders',
          labelHe: 'הזמנות',
          href: '/vendor/orders',
          icon: 'fa-boxes',
          badge: orderCount
        },
        {
          id: 'products',
          label: 'Products',
          labelHe: 'מוצרים',
          href: '/vendor/products',
          icon: 'fa-cube'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          labelHe: 'ניתוח',
          href: '/vendor/analytics',
          icon: 'fa-chart-line'
        },
        {
          id: 'vendor-logout',
          label: 'Sign Out',
          labelHe: 'התנתק',
          icon: 'fa-sign-out-alt',
          action: () => {
            localStorage.removeItem('vendorToken');
            window.location.href = '/';
          }
        }
      ] : [] // Admin items handled separately
    },

    // Community
    {
      id: 'community',
      title: 'Community',
      titleHe: 'קהילה',
      icon: 'fa-users',
      items: [
        {
          id: 'about-village',
          label: 'About Village',
          labelHe: 'על הכפר',
          href: '/about',
          icon: 'fa-info-circle'
        },
        {
          id: 'tourism',
          label: 'Tourism',
          labelHe: 'תיירות',
          href: '/about#tourism',
          icon: 'fa-mountain'
        },
        {
          id: 'cultural-education',
          label: 'Cultural Education',
          labelHe: 'חינוך תרבותי',
          href: '/about#education',
          icon: 'fa-book'
        },
        {
          id: 'events-calendar',
          label: 'Events Calendar',
          labelHe: 'לוח אירועים',
          href: '/events',
          icon: 'fa-calendar-alt'
        },
        {
          id: 'community-forum',
          label: 'Community Forum',
          labelHe: 'פורום קהילתי',
          href: '/forum',
          icon: 'fa-comments'
        }
      ]
    },

    // Settings & Support
    {
      id: 'settings-support',
      title: 'Settings & Support',
      titleHe: 'הגדרות ותמיכה',
      icon: 'fa-cog',
      items: [
        {
          id: 'help-center',
          label: 'Help Center',
          labelHe: 'מרכז עזרה',
          href: '/support',
          icon: 'fa-question-circle'
        },
        {
          id: 'contact-us',
          label: 'Contact Us',
          labelHe: 'צור קשר',
          href: '/support#contact',
          icon: 'fa-headset'
        },
        {
          id: 'privacy',
          label: 'Privacy',
          labelHe: 'פרטיות',
          href: '/privacy',
          icon: 'fa-shield-alt'
        }
      ]
    }
  ];

  // Add admin panel for admin users
  if (userRole === 'admin') {
    menuSections.push({
      id: 'admin-panel',
      title: 'Admin Panel',
      titleHe: 'לוח ניהול',
      icon: 'fa-user-shield',
      visibility: 'admin',
      items: [
        {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          labelHe: 'לוח בקרה מנהל',
          href: '/admin/dashboard',
          icon: 'fa-cog'
        },
        {
          id: 'vendor-management',
          label: 'Vendor Management',
          labelHe: 'ניהול ספקים',
          href: '/admin/vendors',
          icon: 'fa-users-cog'
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          labelHe: 'הגדרות מערכת',
          href: '/admin/settings',
          icon: 'fa-sliders-h'
        },
        {
          id: 'admin-logout',
          label: 'Sign Out',
          labelHe: 'התנתק',
          icon: 'fa-sign-out-alt',
          action: () => {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
          }
        }
      ]
    });
  }

  // Filter sections based on visibility
  return menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!item.visibility || item.visibility === 'all') return true;
      return item.visibility === userRole;
    })
  })).filter(section => section.items.length > 0);
};

export default getMenuConfig;