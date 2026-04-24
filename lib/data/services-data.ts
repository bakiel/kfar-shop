// Community Services Data Structure
// Comprehensive service listing for Village of Peace community

export interface ServiceOperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface ServiceContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
}

export interface ServiceLocation {
  address: string;
  area: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ServiceEvent {
  date: string;
  time: string;
  venue: string;
  duration?: string;
  capacity?: number;
  registrationRequired?: boolean;
  registrationLink?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: 'active' | 'coming-soon';
  icon: string;
  description: string;
  longDescription?: string;
  provider: string;
  contact: ServiceContact;
  operatingHours: ServiceOperatingHours[];
  location: ServiceLocation;
  priceRange?: string;
  tags: string[];
  featured: boolean;
  images?: string[];
  specialFeatures?: string[];
  event?: ServiceEvent;
  rating?: number;
  reviewCount?: number;
  establishedYear?: number;
  certifications?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  services: Service[];
}

// Full Services Data
export const servicesData: ServiceCategory[] = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    slug: 'food-dining',
    icon: 'fa-utensils',
    color: '#478c0b',
    description: 'Vegan food manufacturers, restaurants, and specialty stores',
    services: [
      {
        id: 'teva-deli',
        name: 'Teva Deli',
        slug: 'teva-deli',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-seedling',
        description: 'Vegan food manufacturing since 1983',
        longDescription: 'Pioneer vegan food manufacturer specializing in seitan products, schnitzels, burgers, and Middle Eastern specialties. Established in 1983 as one of Israel\'s first vegan food companies.',
        provider: 'Teva Deli Ltd.',
        contact: {
          phone: '+972-50-123-4567',
          email: 'info@tevadeli.com',
          whatsapp: '+972501234567',
          website: '/store/teva-deli'
        },
        operatingHours: [
          { day: 'Sunday', open: '08:00', close: '18:00' },
          { day: 'Monday', open: '08:00', close: '18:00' },
          { day: 'Tuesday', open: '08:00', close: '18:00' },
          { day: 'Wednesday', open: '08:00', close: '18:00' },
          { day: 'Thursday', open: '08:00', close: '18:00' },
          { day: 'Friday', open: '08:00', close: '14:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '12 HaShalom Street',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0700, lng: 35.0300 }
        },
        priceRange: '₪15-45',
        tags: ['vegan', 'manufacturing', 'seitan', 'wholesale', 'retail'],
        featured: true,
        rating: 4.8,
        reviewCount: 234,
        establishedYear: 1983,
        certifications: ['Kosher', 'Organic', 'ISO 22000']
      },
      {
        id: 'queens-cuisine',
        name: 'Queens Cuisine',
        slug: 'queens-cuisine',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-crown',
        description: 'Vegan food art & catering',
        longDescription: 'Premium vegan catering service specializing in gourmet plant-based cuisine for events, celebrations, and daily meals. Known for innovative meat alternatives and artistic presentation.',
        provider: 'Queens Cuisine Catering',
        contact: {
          phone: '+972-50-234-5678',
          email: 'orders@queenscuisine.com',
          whatsapp: '+972502345678',
          website: '/store/queens-cuisine'
        },
        operatingHours: [
          { day: 'Sunday', open: '09:00', close: '20:00' },
          { day: 'Monday', open: '09:00', close: '20:00' },
          { day: 'Tuesday', open: '09:00', close: '20:00' },
          { day: 'Wednesday', open: '09:00', close: '20:00' },
          { day: 'Thursday', open: '09:00', close: '20:00' },
          { day: 'Friday', open: '09:00', close: '15:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '45 Ben Gurion Avenue',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0680, lng: 35.0320 }
        },
        priceRange: '₪35-120',
        tags: ['catering', 'gourmet', 'events', 'delivery', 'vegan'],
        featured: true,
        rating: 4.9,
        reviewCount: 189,
        establishedYear: 2010,
        certifications: ['Kosher', 'Food Safety']
      },
      {
        id: 'garden-of-light',
        name: 'Garden of Light Vegan Deli',
        slug: 'garden-of-light',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-sun',
        description: 'Premium vegan deli specialties',
        longDescription: 'Artisanal vegan deli offering handcrafted cheeses, cold cuts, and gourmet spreads. Specializing in fermented foods and raw cuisine.',
        provider: 'Garden of Light Co-op',
        contact: {
          phone: '+972-50-345-6789',
          email: 'hello@gardenoflight.com',
          whatsapp: '+972503456789',
          website: '/store/garden-of-light'
        },
        operatingHours: [
          { day: 'Sunday', open: '08:30', close: '19:00' },
          { day: 'Monday', open: '08:30', close: '19:00' },
          { day: 'Tuesday', open: '08:30', close: '19:00' },
          { day: 'Wednesday', open: '08:30', close: '19:00' },
          { day: 'Thursday', open: '08:30', close: '19:00' },
          { day: 'Friday', open: '08:30', close: '14:30' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '78 Peace Road',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0710, lng: 35.0290 }
        },
        priceRange: '₪25-80',
        tags: ['deli', 'artisanal', 'raw', 'fermented', 'organic'],
        featured: true,
        rating: 4.7,
        reviewCount: 156
      },
      {
        id: 'gahn-delight',
        name: 'Gahn Delight',
        slug: 'gahn-delight',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-ice-cream',
        description: 'Artisanal desserts & ice cream',
        longDescription: 'Handcrafted vegan ice creams, sorbets, and desserts made with natural ingredients and unique flavor combinations.',
        provider: 'Gahn Delight Desserts',
        contact: {
          phone: '+972-50-456-7890',
          email: 'sweet@gahndelight.com',
          whatsapp: '+972504567890',
          website: '/store/gahn-delight'
        },
        operatingHours: [
          { day: 'Sunday', open: '11:00', close: '22:00' },
          { day: 'Monday', open: '11:00', close: '22:00' },
          { day: 'Tuesday', open: '11:00', close: '22:00' },
          { day: 'Wednesday', open: '11:00', close: '22:00' },
          { day: 'Thursday', open: '11:00', close: '23:00' },
          { day: 'Friday', open: '11:00', close: '15:00' },
          { day: 'Saturday', open: '20:00', close: '23:00' }
        ],
        location: {
          address: '23 Harmony Square',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0695, lng: 35.0305 }
        },
        priceRange: '₪15-35',
        tags: ['desserts', 'ice-cream', 'sweets', 'artisanal', 'vegan'],
        featured: true,
        rating: 4.9,
        reviewCount: 298
      },
      {
        id: 'people-store',
        name: 'People Store',
        slug: 'people-store',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-shopping-basket',
        description: 'Community retail & grocery',
        longDescription: 'Community-owned cooperative grocery store offering organic produce, bulk foods, and everyday essentials.',
        provider: 'People Store Cooperative',
        contact: {
          phone: '+972-50-567-8901',
          email: 'info@peoplestore.coop',
          whatsapp: '+972505678901',
          website: '/store/people-store'
        },
        operatingHours: [
          { day: 'Sunday', open: '07:00', close: '21:00' },
          { day: 'Monday', open: '07:00', close: '21:00' },
          { day: 'Tuesday', open: '07:00', close: '21:00' },
          { day: 'Wednesday', open: '07:00', close: '21:00' },
          { day: 'Thursday', open: '07:00', close: '21:00' },
          { day: 'Friday', open: '07:00', close: '15:00' },
          { day: 'Saturday', open: '19:00', close: '22:00' }
        ],
        location: {
          address: '1 Community Center',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0700, lng: 35.0310 }
        },
        priceRange: '₪5-150',
        tags: ['grocery', 'organic', 'bulk', 'cooperative', 'community'],
        featured: true,
        rating: 4.6,
        reviewCount: 412
      },
      {
        id: 'vop-shop',
        name: 'VOP Shop',
        slug: 'vop-shop',
        category: 'food-dining',
        status: 'active',
        icon: 'fa-gift',
        description: 'Official Village merchandise store',
        longDescription: 'Official Village of Peace merchandise store featuring custom t-shirts, hoodies, mugs, tote bags, and other branded accessories celebrating our community heritage.',
        provider: 'Village of Peace Shop',
        contact: {
          phone: '+972-50-678-9012',
          email: 'shop@villageofpeace.org',
          whatsapp: '+972506789012',
          website: '/store/vop-shop'
        },
        operatingHours: [
          { day: 'Sunday', open: '09:00', close: '18:00' },
          { day: 'Monday', open: '09:00', close: '18:00' },
          { day: 'Tuesday', open: '09:00', close: '18:00' },
          { day: 'Wednesday', open: '09:00', close: '18:00' },
          { day: 'Thursday', open: '09:00', close: '18:00' },
          { day: 'Friday', open: '09:00', close: '14:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '5 Heritage Plaza',
          area: 'Village of Peace, Dimona',
          coordinates: { lat: 31.0705, lng: 35.0295 }
        },
        priceRange: '₪20-200',
        tags: ['merchandise', 't-shirts', 'hoodies', 'mugs', 'accessories', 'apparel'],
        featured: true,
        rating: 4.8,
        reviewCount: 267
      },
      {
        id: 'community-bakery',
        name: 'Community Bakery',
        slug: 'community-bakery',
        category: 'food-dining',
        status: 'coming-soon',
        icon: 'fa-bread-slice',
        description: 'Fresh artisan breads & pastries',
        longDescription: 'Traditional sourdough bakery offering daily fresh breads, pastries, and special occasion cakes. Opening soon!',
        provider: 'Village Bakers Collective',
        contact: {
          email: 'info@communitybakery.com'
        },
        operatingHours: [
          { day: 'Opening Soon', open: '', close: '' }
        ],
        location: {
          address: '32 Wheat Field Lane',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪10-45',
        tags: ['bakery', 'bread', 'pastries', 'sourdough', 'artisan'],
        featured: false
      },
      {
        id: 'juice-bar',
        name: 'Green Vitality Juice Bar',
        slug: 'juice-bar',
        category: 'food-dining',
        status: 'coming-soon',
        icon: 'fa-blender',
        description: 'Fresh pressed juices & smoothies',
        longDescription: 'Cold-pressed juices, superfood smoothies, and wellness shots made from organic ingredients.',
        provider: 'Green Vitality Ltd.',
        contact: {
          email: 'hello@greenvitality.com'
        },
        operatingHours: [
          { day: 'Opening Soon', open: '', close: '' }
        ],
        location: {
          address: '15 Health Boulevard',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪15-35',
        tags: ['juice', 'smoothies', 'wellness', 'organic', 'raw'],
        featured: false
      },
      {
        id: 'ethiopian-kitchen',
        name: 'Ethiopian Kitchen',
        slug: 'ethiopian-kitchen',
        category: 'food-dining',
        status: 'coming-soon',
        icon: 'fa-pepper-hot',
        description: 'Authentic Ethiopian vegan cuisine',
        longDescription: 'Traditional Ethiopian restaurant featuring injera bread and authentic vegan stews.',
        provider: 'Ethiopian Kitchen Family',
        contact: {
          email: 'taste@ethiopiankitchen.com'
        },
        operatingHours: [
          { day: 'Opening Soon', open: '', close: '' }
        ],
        location: {
          address: '67 Culture Street',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪30-60',
        tags: ['ethiopian', 'traditional', 'cultural', 'restaurant', 'vegan'],
        featured: false
      }
    ]
  },
  {
    id: 'home-services',
    name: 'Home Services',
    slug: 'home-services',
    icon: 'fa-home',
    color: '#f6af0d',
    description: 'Maintenance, repairs, and home improvement services',
    services: [
      {
        id: 'eco-plumbing',
        name: 'Eco Plumbing Solutions',
        slug: 'eco-plumbing',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-wrench',
        description: '24/7 emergency plumbing service',
        longDescription: 'Professional plumbing services specializing in water conservation and eco-friendly solutions.',
        provider: 'Green Pipe Plumbers',
        contact: {
          phone: '+972-50-111-2222',
          whatsapp: '+972501112222'
        },
        operatingHours: [
          { day: '24/7 Service', open: '00:00', close: '23:59' }
        ],
        location: {
          address: 'Mobile Service',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪150-500',
        tags: ['plumbing', 'emergency', 'eco-friendly', '24/7', 'repairs'],
        featured: false
      },
      {
        id: 'solar-electrical',
        name: 'Solar & Electrical Services',
        slug: 'solar-electrical',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-bolt',
        description: 'Licensed electricians & solar installation',
        longDescription: 'Full electrical services with expertise in solar panel installation and maintenance.',
        provider: 'Bright Future Electric',
        contact: {
          phone: '+972-50-222-3333',
          email: 'info@solarelectric.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '08:00', close: '18:00' },
          { day: 'Friday', open: '08:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '89 Energy Lane',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪200-2000',
        tags: ['electrical', 'solar', 'installation', 'maintenance', 'green-energy'],
        featured: false
      },
      {
        id: 'eco-carpentry',
        name: 'Eco Carpentry Workshop',
        slug: 'eco-carpentry',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-hammer',
        description: 'Custom furniture & woodwork',
        longDescription: 'Sustainable carpentry using reclaimed wood and eco-friendly materials.',
        provider: 'Village Woodworkers',
        contact: {
          phone: '+972-50-333-4444',
          email: 'craft@ecocarpentry.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '08:00', close: '17:00' },
          { day: 'Friday', open: '08:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '12 Craft Workshop Road',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪300-5000',
        tags: ['carpentry', 'furniture', 'custom', 'sustainable', 'woodwork'],
        featured: false
      },
      {
        id: 'natural-painting',
        name: 'Natural Colors Painting',
        slug: 'natural-painting',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-paint-roller',
        description: 'Eco-friendly interior & exterior painting',
        longDescription: 'Professional painting services using non-toxic, natural paints and materials.',
        provider: 'Rainbow Painters Co.',
        contact: {
          phone: '+972-50-444-5555',
          whatsapp: '+972504445555'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '07:00', close: '18:00' },
          { day: 'Friday', open: '07:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: 'Mobile Service',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪150-400/room',
        tags: ['painting', 'eco-friendly', 'non-toxic', 'interior', 'exterior'],
        featured: false
      },
      {
        id: 'green-cleaning',
        name: 'Green Clean Services',
        slug: 'green-cleaning',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-broom',
        description: 'Eco-friendly home & office cleaning',
        longDescription: 'Professional cleaning using only natural, biodegradable products.',
        provider: 'Clean & Green Team',
        contact: {
          phone: '+972-50-555-6666',
          email: 'book@greenclean.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '08:00', close: '17:00' },
          { day: 'Friday', open: '08:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: 'Mobile Service',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪100-250/hour',
        tags: ['cleaning', 'eco-friendly', 'home', 'office', 'natural'],
        featured: false
      },
      {
        id: 'permaculture-landscaping',
        name: 'Permaculture Landscaping',
        slug: 'permaculture-landscaping',
        category: 'home-services',
        status: 'coming-soon',
        icon: 'fa-tree',
        description: 'Sustainable garden design & maintenance',
        longDescription: 'Garden design and maintenance using permaculture principles and native plants.',
        provider: 'Desert Bloom Gardens',
        contact: {
          phone: '+972-50-666-7777',
          email: 'grow@permaculture.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '07:00', close: '17:00' },
          { day: 'Friday', open: '07:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '34 Garden Path',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪200-1000',
        tags: ['landscaping', 'permaculture', 'garden', 'sustainable', 'native-plants'],
        featured: false
      }
    ]
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    slug: 'personal-care',
    icon: 'fa-spa',
    color: '#c23c09',
    description: 'Health, wellness, and beauty services',
    services: [
      {
        id: 'natural-hair-salon',
        name: 'Natural Hair Haven',
        slug: 'natural-hair-salon',
        category: 'personal-care',
        status: 'coming-soon',
        icon: 'fa-cut',
        description: 'Organic hair care & styling',
        longDescription: 'Full-service salon using only natural, chemical-free hair products.',
        provider: 'Natural Beauty Collective',
        contact: {
          phone: '+972-50-777-8888',
          email: 'book@naturalhair.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '19:00' },
          { day: 'Friday', open: '09:00', close: '14:00' },
          { day: 'Saturday', open: '20:00', close: '22:00' }
        ],
        location: {
          address: '23 Beauty Lane',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪80-300',
        tags: ['hair', 'salon', 'organic', 'natural', 'styling'],
        featured: false
      },
      {
        id: 'holistic-wellness-center',
        name: 'Holistic Wellness Center',
        slug: 'holistic-wellness-center',
        category: 'personal-care',
        status: 'coming-soon',
        icon: 'fa-heart',
        description: 'Integrative health & healing',
        longDescription: 'Comprehensive wellness center offering acupuncture, naturopathy, and holistic therapies.',
        provider: 'Village Wellness Institute',
        contact: {
          phone: '+972-50-888-9999',
          email: 'heal@holisticwellness.com',
          website: 'www.holisticwellness.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '08:00', close: '20:00' },
          { day: 'Friday', open: '08:00', close: '14:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '56 Healing Path',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪150-500',
        tags: ['wellness', 'holistic', 'acupuncture', 'naturopathy', 'healing'],
        featured: false
      },
      {
        id: 'movement-studio',
        name: 'Flow Movement Studio',
        slug: 'movement-studio',
        category: 'personal-care',
        status: 'coming-soon',
        icon: 'fa-dumbbell',
        description: 'Yoga, dance & fitness classes',
        longDescription: 'Community fitness studio offering yoga, dance, pilates, and movement therapy classes.',
        provider: 'Flow Fitness Community',
        contact: {
          phone: '+972-50-999-0000',
          email: 'move@flowstudio.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '06:00', close: '21:00' },
          { day: 'Friday', open: '06:00', close: '14:00' },
          { day: 'Saturday', open: '18:00', close: '21:00' }
        ],
        location: {
          address: '78 Movement Plaza',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪40-150/class',
        tags: ['fitness', 'yoga', 'dance', 'pilates', 'wellness'],
        featured: false
      },
      {
        id: 'therapeutic-massage',
        name: 'Healing Hands Massage',
        slug: 'therapeutic-massage',
        category: 'personal-care',
        status: 'coming-soon',
        icon: 'fa-hand-holding-heart',
        description: 'Professional therapeutic massage',
        longDescription: 'Various massage modalities including Swedish, deep tissue, Thai, and reflexology.',
        provider: 'Healing Hands Therapists',
        contact: {
          phone: '+972-50-100-1111',
          whatsapp: '+972501001111'
        },
        operatingHours: [
          { day: 'By Appointment', open: '09:00', close: '20:00' }
        ],
        location: {
          address: '34 Relaxation Road',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪200-400',
        tags: ['massage', 'therapeutic', 'relaxation', 'healing', 'wellness'],
        featured: false
      },
      {
        id: 'natural-medicine',
        name: 'Earth Medicine Clinic',
        slug: 'natural-medicine',
        category: 'personal-care',
        status: 'coming-soon',
        icon: 'fa-leaf',
        description: 'Herbal medicine & natural remedies',
        longDescription: 'Traditional and modern herbal medicine, homeopathy, and natural health consultations.',
        provider: 'Earth Medicine Practitioners',
        contact: {
          phone: '+972-50-200-2222',
          email: 'consult@earthmedicine.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '18:00' },
          { day: 'Friday', open: '09:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '90 Herb Garden Way',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪150-350',
        tags: ['herbal', 'natural-medicine', 'homeopathy', 'consultation', 'remedies'],
        featured: false
      }
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    slug: 'professional-services',
    icon: 'fa-briefcase',
    color: '#3a3a1d',
    description: 'Business, legal, educational, and technical services',
    services: [
      {
        id: 'community-accounting',
        name: 'Community Accounting Services',
        slug: 'community-accounting',
        category: 'professional-services',
        status: 'coming-soon',
        icon: 'fa-calculator',
        description: 'Tax preparation & bookkeeping',
        longDescription: 'Full accounting services for individuals and small businesses, specializing in cooperative structures.',
        provider: 'Village Accountants',
        contact: {
          phone: '+972-50-300-3333',
          email: 'info@communityaccounting.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '17:00' },
          { day: 'Friday', isClosed: true, open: '', close: '' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '12 Business Center',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪200-1000',
        tags: ['accounting', 'tax', 'bookkeeping', 'business', 'cooperative'],
        featured: false
      },
      {
        id: 'legal-aid-center',
        name: 'Village Legal Aid Center',
        slug: 'legal-aid-center',
        category: 'professional-services',
        status: 'coming-soon',
        icon: 'fa-balance-scale',
        description: 'Legal consultation & services',
        longDescription: 'Affordable legal services focusing on community law, cooperatives, and social justice.',
        provider: 'Justice for All Legal Team',
        contact: {
          phone: '+972-50-400-4444',
          email: 'help@villagelegal.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '18:00' },
          { day: 'Friday', isClosed: true, open: '', close: '' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '45 Justice Square',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪150-500',
        tags: ['legal', 'consultation', 'community-law', 'cooperative', 'justice'],
        featured: false
      },
      {
        id: 'tech-support-hub',
        name: 'Tech Support Hub',
        slug: 'tech-support-hub',
        category: 'professional-services',
        status: 'coming-soon',
        icon: 'fa-laptop',
        description: 'IT support & computer services',
        longDescription: 'Computer repair, network setup, and technical support for homes and businesses.',
        provider: 'Village Tech Solutions',
        contact: {
          phone: '+972-50-500-5555',
          email: 'support@techsupporthub.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '19:00' },
          { day: 'Friday', open: '09:00', close: '14:00' },
          { day: 'Saturday', open: '20:00', close: '22:00' }
        ],
        location: {
          address: '67 Digital Drive',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪100-300/hour',
        tags: ['IT', 'computer', 'repair', 'network', 'technical-support'],
        featured: false
      },
      {
        id: 'language-center',
        name: 'Multilingual Translation Center',
        slug: 'language-center',
        category: 'professional-services',
        status: 'coming-soon',
        icon: 'fa-language',
        description: 'Translation & interpretation services',
        longDescription: 'Professional translation services in Hebrew, English, Arabic, Amharic, and Russian.',
        provider: 'Bridge Languages Co.',
        contact: {
          phone: '+972-50-600-6666',
          email: 'translate@bridgelanguages.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '09:00', close: '17:00' },
          { day: 'Friday', open: '09:00', close: '13:00' },
          { day: 'Saturday', isClosed: true, open: '', close: '' }
        ],
        location: {
          address: '89 Communication Center',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪80-200/page',
        tags: ['translation', 'interpretation', 'multilingual', 'documents', 'communication'],
        featured: false
      },
      {
        id: 'learning-center',
        name: 'Community Learning Center',
        slug: 'learning-center',
        category: 'professional-services',
        status: 'coming-soon',
        icon: 'fa-graduation-cap',
        description: 'Tutoring & educational support',
        longDescription: 'Academic tutoring, test preparation, and adult education programs.',
        provider: 'Village Education Initiative',
        contact: {
          phone: '+972-50-700-7777',
          email: 'learn@communitylearning.com'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '14:00', close: '20:00' },
          { day: 'Friday', isClosed: true, open: '', close: '' },
          { day: 'Saturday', open: '18:00', close: '21:00' }
        ],
        location: {
          address: '23 Knowledge Path',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪80-150/hour',
        tags: ['education', 'tutoring', 'learning', 'test-prep', 'adult-education'],
        featured: false
      }
    ]
  },
  {
    id: 'events-community',
    name: 'Events & Community',
    slug: 'events-community',
    icon: 'fa-calendar-alt',
    color: '#8b5cf6',
    description: 'Community gatherings, workshops, and cultural events',
    services: [
      {
        id: 'weekly-market',
        name: 'Village Weekly Market',
        slug: 'weekly-market',
        category: 'events-community',
        status: 'active',
        icon: 'fa-store',
        description: 'Thursday community market',
        longDescription: 'Weekly outdoor market featuring local produce, crafts, prepared foods, and community goods.',
        provider: 'Village Market Committee',
        contact: {
          phone: '+972-50-123-7890',
          email: 'market@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Every Thursday', open: '15:00', close: '20:00' }
        ],
        location: {
          address: 'Community Square',
          area: 'Village of Peace, Dimona'
        },
        tags: ['market', 'weekly', 'community', 'local', 'produce'],
        featured: true,
        event: {
          date: 'Every Thursday',
          time: '15:00-20:00',
          venue: 'Community Square',
          capacity: 500,
          registrationRequired: false
        }
      },
      {
        id: 'shabbat-gatherings',
        name: 'Community Shabbat Dinners',
        slug: 'shabbat-gatherings',
        category: 'events-community',
        status: 'active',
        icon: 'fa-hands',
        description: 'Weekly community Shabbat meals',
        longDescription: 'Traditional vegan Shabbat dinners bringing the community together every Friday evening.',
        provider: 'Shabbat Committee',
        contact: {
          email: 'shabbat@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Every Friday', open: '18:00', close: '21:00' }
        ],
        location: {
          address: 'Community Dining Hall',
          area: 'Village of Peace, Dimona'
        },
        priceRange: 'Donation basis',
        tags: ['shabbat', 'dinner', 'community', 'weekly', 'tradition'],
        featured: true,
        event: {
          date: 'Every Friday',
          time: '18:00-21:00',
          venue: 'Community Dining Hall',
          capacity: 200,
          registrationRequired: true,
          registrationLink: '/events/shabbat-dinner'
        }
      },
      {
        id: 'meditation-circle',
        name: 'Morning Meditation Circle',
        slug: 'meditation-circle',
        category: 'events-community',
        status: 'active',
        icon: 'fa-om',
        description: 'Daily group meditation',
        longDescription: 'Start your day with peaceful group meditation in our serene garden setting.',
        provider: 'Mindfulness Group',
        contact: {
          whatsapp: '+972501234567'
        },
        operatingHours: [
          { day: 'Daily', open: '06:30', close: '07:30' }
        ],
        location: {
          address: 'Peace Garden',
          area: 'Village of Peace, Dimona'
        },
        tags: ['meditation', 'daily', 'mindfulness', 'wellness', 'morning'],
        featured: false,
        event: {
          date: 'Daily',
          time: '06:30-07:30',
          venue: 'Peace Garden',
          capacity: 30,
          registrationRequired: false
        }
      },
      {
        id: 'cultural-workshops',
        name: 'Cultural Heritage Workshops',
        slug: 'cultural-workshops',
        category: 'events-community',
        status: 'active',
        icon: 'fa-palette',
        description: 'Traditional crafts & culture',
        longDescription: 'Learn traditional African Hebrew crafts, music, dance, and cultural practices.',
        provider: 'Heritage Preservation Society',
        contact: {
          phone: '+972-50-234-8901',
          email: 'culture@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Tuesdays & Thursdays', open: '17:00', close: '19:00' }
        ],
        location: {
          address: 'Cultural Center',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪50-100',
        tags: ['workshop', 'culture', 'heritage', 'crafts', 'education'],
        featured: true,
        event: {
          date: 'Tuesdays & Thursdays',
          time: '17:00-19:00',
          venue: 'Cultural Center',
          capacity: 25,
          registrationRequired: true,
          registrationLink: '/events/cultural-workshops'
        }
      },
      {
        id: 'youth-programs',
        name: 'Youth Leadership Programs',
        slug: 'youth-programs',
        category: 'events-community',
        status: 'active',
        icon: 'fa-users',
        description: 'After-school youth activities',
        longDescription: 'Leadership development, sports, arts, and educational programs for village youth.',
        provider: 'Youth Development Council',
        contact: {
          phone: '+972-50-345-9012',
          email: 'youth@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Sunday-Thursday', open: '16:00', close: '19:00' }
        ],
        location: {
          address: 'Youth Center',
          area: 'Village of Peace, Dimona'
        },
        tags: ['youth', 'education', 'leadership', 'activities', 'development'],
        featured: true,
        event: {
          date: 'Sunday-Thursday',
          time: '16:00-19:00',
          venue: 'Youth Center',
          capacity: 50,
          registrationRequired: true,
          registrationLink: '/events/youth-programs'
        }
      },
      {
        id: 'harvest-festival',
        name: 'Annual Harvest Festival',
        slug: 'harvest-festival',
        category: 'events-community',
        status: 'coming-soon',
        icon: 'fa-wheat',
        description: 'Celebration of the harvest season',
        longDescription: 'Annual festival celebrating our agricultural harvest with food, music, and dance.',
        provider: 'Festival Committee',
        contact: {
          email: 'festival@villageofpeace.org'
        },
        operatingHours: [
          { day: 'October 15', open: '10:00', close: '22:00' }
        ],
        location: {
          address: 'Village Fields',
          area: 'Village of Peace, Dimona'
        },
        tags: ['festival', 'harvest', 'annual', 'celebration', 'community'],
        featured: true,
        event: {
          date: '2024-10-15',
          time: '10:00-22:00',
          venue: 'Village Fields',
          capacity: 1000,
          registrationRequired: false
        }
      },
      {
        id: 'wellness-retreats',
        name: 'Wellness Weekend Retreats',
        slug: 'wellness-retreats',
        category: 'events-community',
        status: 'coming-soon',
        icon: 'fa-spa',
        description: 'Monthly wellness retreats',
        longDescription: 'Weekend retreats focusing on holistic health, nutrition, and spiritual wellness.',
        provider: 'Wellness Retreat Center',
        contact: {
          phone: '+972-50-456-0123',
          email: 'retreat@villageofpeace.org'
        },
        operatingHours: [
          { day: 'First weekend of each month', open: 'Friday 14:00', close: 'Sunday 18:00' }
        ],
        location: {
          address: 'Retreat Center',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪800-1500',
        tags: ['retreat', 'wellness', 'weekend', 'health', 'spiritual'],
        featured: false,
        event: {
          date: 'Monthly',
          time: 'Weekend',
          venue: 'Retreat Center',
          capacity: 40,
          registrationRequired: true,
          registrationLink: '/events/wellness-retreats'
        }
      },
      {
        id: 'film-nights',
        name: 'Community Film Nights',
        slug: 'film-nights',
        category: 'events-community',
        status: 'active',
        icon: 'fa-film',
        description: 'Weekly outdoor cinema',
        longDescription: 'Family-friendly film screenings under the stars every Saturday night.',
        provider: 'Cultural Activities Team',
        contact: {
          email: 'films@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Every Saturday', open: '20:00', close: '22:30' }
        ],
        location: {
          address: 'Amphitheater',
          area: 'Village of Peace, Dimona'
        },
        tags: ['film', 'cinema', 'outdoor', 'family', 'entertainment'],
        featured: false,
        event: {
          date: 'Every Saturday',
          time: '20:00-22:30',
          venue: 'Amphitheater',
          capacity: 200,
          registrationRequired: false
        }
      },
      {
        id: 'cooking-classes',
        name: 'Vegan Cooking Classes',
        slug: 'cooking-classes',
        category: 'events-community',
        status: 'active',
        icon: 'fa-utensils',
        description: 'Learn vegan cooking techniques',
        longDescription: 'Hands-on cooking classes teaching traditional and modern vegan recipes.',
        provider: 'Community Kitchen',
        contact: {
          phone: '+972-50-567-1234',
          email: 'cooking@villageofpeace.org'
        },
        operatingHours: [
          { day: 'Wednesdays', open: '18:00', close: '20:00' }
        ],
        location: {
          address: 'Community Kitchen',
          area: 'Village of Peace, Dimona'
        },
        priceRange: '₪80-120',
        tags: ['cooking', 'classes', 'vegan', 'education', 'food'],
        featured: false,
        event: {
          date: 'Every Wednesday',
          time: '18:00-20:00',
          venue: 'Community Kitchen',
          capacity: 20,
          registrationRequired: true,
          registrationLink: '/events/cooking-classes'
        }
      },
      {
        id: 'music-jam',
        name: 'Weekly Music Jam Session',
        slug: 'music-jam',
        category: 'events-community',
        status: 'active',
        icon: 'fa-music',
        description: 'Open mic & jam sessions',
        longDescription: 'Bring your instruments and voice for community music making and performances.',
        provider: 'Village Musicians',
        contact: {
          whatsapp: '+972506781234'
        },
        operatingHours: [
          { day: 'Thursdays', open: '19:00', close: '22:00' }
        ],
        location: {
          address: 'Music Hall',
          area: 'Village of Peace, Dimona'
        },
        tags: ['music', 'jam', 'performance', 'community', 'arts'],
        featured: false,
        event: {
          date: 'Every Thursday',
          time: '19:00-22:00',
          venue: 'Music Hall',
          capacity: 75,
          registrationRequired: false
        }
      }
    ]
  }
];

// Helper functions
export const getServiceById = (id: string): Service | undefined => {
  for (const category of servicesData) {
    const service = category.services.find(s => s.id === id);
    if (service) return service;
  }
  return undefined;
};

export const getServiceBySlug = (slug: string): Service | undefined => {
  for (const category of servicesData) {
    const service = category.services.find(s => s.slug === slug);
    if (service) return service;
  }
  return undefined;
};

export const getServicesByCategory = (categoryId: string): Service[] => {
  const category = servicesData.find(c => c.id === categoryId);
  return category ? category.services : [];
};

export const getActiveServices = (): Service[] => {
  const activeServices: Service[] = [];
  for (const category of servicesData) {
    activeServices.push(...category.services.filter(s => s.status === 'active'));
  }
  return activeServices;
};

export const getFeaturedServices = (): Service[] => {
  const featuredServices: Service[] = [];
  for (const category of servicesData) {
    featuredServices.push(...category.services.filter(s => s.featured));
  }
  return featuredServices;
};

export const getUpcomingEvents = (): Service[] => {
  const eventsCategory = servicesData.find(c => c.id === 'events-community');
  if (!eventsCategory) return [];
  
  return eventsCategory.services.filter(s => s.event && s.status === 'active');
};

export const searchServices = (query: string): Service[] => {
  const lowercaseQuery = query.toLowerCase();
  const results: Service[] = [];
  
  for (const category of servicesData) {
    const matchingServices = category.services.filter(service => 
      service.name.toLowerCase().includes(lowercaseQuery) ||
      service.description.toLowerCase().includes(lowercaseQuery) ||
      service.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      service.provider.toLowerCase().includes(lowercaseQuery)
    );
    results.push(...matchingServices);
  }
  
  return results;
};

// Statistics helpers
export const getServiceStats = () => {
  let totalServices = 0;
  let activeServices = 0;
  let comingSoonServices = 0;
  let categories = servicesData.length;
  
  for (const category of servicesData) {
    totalServices += category.services.length;
    activeServices += category.services.filter(s => s.status === 'active').length;
    comingSoonServices += category.services.filter(s => s.status === 'coming-soon').length;
  }
  
  return {
    total: totalServices,
    active: activeServices,
    comingSoon: comingSoonServices,
    categories
  };
};

export default servicesData;