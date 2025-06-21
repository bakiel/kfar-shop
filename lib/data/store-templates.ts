// Store Template System for Admin Management

export interface StoreTemplate {
  id: string;
  name: string;
  description: string;
  theme: 'modern' | 'artisanal' | 'premium' | 'community' | 'fresh' | 'heritage';
  preview: string;
  features: string[];
  sections: StoreSection[];
  colorScheme: ColorScheme;
  typography: Typography;
  layout: LayoutConfig;
}

export interface StoreSection {
  id: string;
  type: 'hero' | 'products' | 'about' | 'features' | 'testimonials' | 'contact' | 'custom';
  enabled: boolean;
  order: number;
  config: any;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  sizes: {
    hero: string;
    heading: string;
    subheading: string;
    body: string;
    small: string;
  };
}

export interface LayoutConfig {
  productGrid: 'grid' | 'list' | 'masonry';
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  spacing: 'compact' | 'normal' | 'spacious';
  cornerRadius: 'none' | 'small' | 'medium' | 'large';
}

// Pre-built templates that can be customized
export const storeTemplates: StoreTemplate[] = [
  {
    id: 'modern-clean',
    name: 'Modern & Clean',
    description: 'Perfect for professional plant-based businesses',
    theme: 'modern',
    preview: '/images/templates/modern-preview.jpg',
    features: ['Minimalist design', 'Focus on products', 'Quick loading', 'Mobile optimized'],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        config: {
          height: '60vh',
          overlay: 'gradient',
          showStats: true,
          animationType: 'fade'
        }
      },
      {
        id: 'products',
        type: 'products',
        enabled: true,
        order: 2,
        config: {
          showFilters: true,
          showSearch: true,
          defaultView: 'grid',
          productsPerPage: 12
        }
      },
      {
        id: 'about',
        type: 'about',
        enabled: true,
        order: 3,
        config: {
          layout: 'split',
          showImage: true,
          showMission: true
        }
      },
      {
        id: 'contact',
        type: 'contact',
        enabled: true,
        order: 4,
        config: {
          showMap: false,
          showHours: true,
          showSocial: true
        }
      }
    ],
    colorScheme: {
      primary: '#478c0b',
      secondary: '#f6af0d',
      accent: '#c23c09',
      background: '#ffffff',
      text: '#1a1a1a',
      muted: '#6b7280'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sizes: {
        hero: '4rem',
        heading: '2.5rem',
        subheading: '1.5rem',
        body: '1rem',
        small: '0.875rem'
      }
    },
    layout: {
      productGrid: 'grid',
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 4
      },
      spacing: 'normal',
      cornerRadius: 'medium'
    }
  },
  {
    id: 'artisanal-warm',
    name: 'Artisanal & Warm',
    description: 'Handcrafted feel for traditional businesses',
    theme: 'artisanal',
    preview: '/images/templates/artisanal-preview.jpg',
    features: ['Warm colors', 'Story-driven', 'Recipe integration', 'Craft emphasis'],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        config: {
          height: '70vh',
          overlay: 'soft',
          showTagline: true,
          backgroundPattern: 'texture'
        }
      },
      {
        id: 'story',
        type: 'about',
        enabled: true,
        order: 2,
        config: {
          layout: 'centered',
          showTimeline: true,
          emphasis: 'heritage'
        }
      },
      {
        id: 'products',
        type: 'products',
        enabled: true,
        order: 3,
        config: {
          showCategories: true,
          layout: 'cards',
          showIngredients: true
        }
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        enabled: true,
        order: 4,
        config: {
          layout: 'carousel',
          showRatings: true
        }
      }
    ],
    colorScheme: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#FFD700',
      background: '#FFF8E7',
      text: '#3E2723',
      muted: '#8D6E63'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
      sizes: {
        hero: '4.5rem',
        heading: '3rem',
        subheading: '1.75rem',
        body: '1.125rem',
        small: '0.875rem'
      }
    },
    layout: {
      productGrid: 'grid',
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3
      },
      spacing: 'spacious',
      cornerRadius: 'large'
    }
  },
  {
    id: 'premium-elegant',
    name: 'Premium & Elegant',
    description: 'Sophisticated design for high-end products',
    theme: 'premium',
    preview: '/images/templates/premium-preview.jpg',
    features: ['Luxury feel', 'High contrast', 'Premium photography', 'Exclusive vibe'],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        config: {
          height: '100vh',
          overlay: 'dark',
          animation: 'parallax',
          showLogo: true
        }
      },
      {
        id: 'features',
        type: 'features',
        enabled: true,
        order: 2,
        config: {
          layout: 'icons',
          emphasis: 'quality',
          showCertifications: true
        }
      },
      {
        id: 'products',
        type: 'products',
        enabled: true,
        order: 3,
        config: {
          layout: 'showcase',
          showDetails: true,
          zoomOnHover: true
        }
      }
    ],
    colorScheme: {
      primary: '#1a1a1a',
      secondary: '#f6af0d',
      accent: '#ffffff',
      background: '#fafafa',
      text: '#1a1a1a',
      muted: '#666666'
    },
    typography: {
      headingFont: 'Montserrat',
      bodyFont: 'Open Sans',
      sizes: {
        hero: '5rem',
        heading: '3rem',
        subheading: '1.5rem',
        body: '1rem',
        small: '0.875rem'
      }
    },
    layout: {
      productGrid: 'masonry',
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3
      },
      spacing: 'spacious',
      cornerRadius: 'none'
    }
  },
  {
    id: 'community-friendly',
    name: 'Community & Trust',
    description: 'Welcoming design for community-focused stores',
    theme: 'community',
    preview: '/images/templates/community-preview.jpg',
    features: ['Inclusive design', 'Member focus', 'Trust building', 'Local emphasis'],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        config: {
          height: '50vh',
          showCommunityBadge: true,
          welcomeMessage: true
        }
      },
      {
        id: 'values',
        type: 'about',
        enabled: true,
        order: 2,
        config: {
          showValues: true,
          showTeam: true,
          communityFocus: true
        }
      },
      {
        id: 'products',
        type: 'products',
        enabled: true,
        order: 3,
        config: {
          showSuppliers: true,
          showOrigin: true,
          memberPricing: true
        }
      }
    ],
    colorScheme: {
      primary: '#478c0b',
      secondary: '#8B4513',
      accent: '#f6af0d',
      background: '#F0F9FF',
      text: '#1F2937',
      muted: '#6B7280'
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      sizes: {
        hero: '3.5rem',
        heading: '2.25rem',
        subheading: '1.5rem',
        body: '1rem',
        small: '0.875rem'
      }
    },
    layout: {
      productGrid: 'grid',
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3
      },
      spacing: 'normal',
      cornerRadius: 'medium'
    }
  }
];

// Template customization options for admin
export const customizationOptions = {
  colorPresets: [
    { name: 'KFAR Classic', colors: { primary: '#478c0b', secondary: '#f6af0d', accent: '#c23c09' } },
    { name: 'Ocean Blue', colors: { primary: '#0369A1', secondary: '#0EA5E9', accent: '#38BDF8' } },
    { name: 'Sunset', colors: { primary: '#DC2626', secondary: '#F97316', accent: '#FCD34D' } },
    { name: 'Forest', colors: { primary: '#059669', secondary: '#34D399', accent: '#86EFAC' } },
    { name: 'Royal Purple', colors: { primary: '#7C3AED', secondary: '#A78BFA', accent: '#C4B5FD' } }
  ],
  fonts: {
    headings: ['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Roboto', 'Open Sans'],
    body: ['Inter', 'Lato', 'Open Sans', 'Roboto', 'Source Sans Pro', 'Nunito']
  },
  animations: ['none', 'subtle', 'smooth', 'dynamic'],
  patterns: ['none', 'dots', 'lines', 'waves', 'geometric']
};

// Function to apply template to vendor
export function applyTemplateToVendor(vendorId: string, templateId: string, customizations?: any) {
  const template = storeTemplates.find(t => t.id === templateId);
  if (!template) return null;

  // Merge template with customizations
  const vendorStore = {
    vendorId,
    template: templateId,
    ...template,
    customizations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to database (in real implementation)
  // await saveVendorStore(vendorStore);

  return vendorStore;
}

// Function to get vendor's current template
export function getVendorTemplate(vendorId: string) {
  // In real implementation, fetch from database
  // return await fetchVendorTemplate(vendorId);
  
  // For now, return default based on vendor
  const defaultTemplates: Record<string, string> = {
    'teva-deli': 'modern-clean',
    'queens-cuisine': 'artisanal-warm',
    'garden-of-light': 'premium-elegant',
    'people-store': 'community-friendly',
    'gahn-delight': 'modern-clean',
    'vop-shop': 'artisanal-warm'
  };

  return defaultTemplates[vendorId] || 'modern-clean';
}