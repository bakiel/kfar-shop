// About Page Data Structure
// This file contains all the data for the About page, making it easy to update content

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  highlights: string[];
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface EducationProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  icon: string;
}

export interface WorkshopSchedule {
  day: string;
  workshops: {
    name: string;
    time: string;
  }[];
}

export interface CommunityValue {
  title: string;
  description: string;
  icon: string;
}

export interface AccommodationOption {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
}

// Timeline Data
export const timelineData: TimelineItem[] = [
  {
    year: "1967",
    title: "The Great Journey Begins",
    description: "African Hebrew Israelites begin their spiritual exodus from America to the Holy Land, establishing the foundation of our community.",
    icon: "fa-route"
  },
  {
    year: "1970s",
    title: "Early Settlement",
    description: "Community establishes roots in Dimona, developing agricultural projects and beginning the journey toward official recognition.",
    icon: "fa-seedling"
  },
  {
    year: "1983",
    title: "Teva Deli Founded",
    description: "Launch of Israel's first vegan food manufacturing company, pioneering the plant-based food industry in the country.",
    icon: "fa-store"
  },
  {
    year: "1990s",
    title: "Cultural Recognition",
    description: "Growing recognition of community contributions to Israeli society, including military service and cultural exchange programs.",
    icon: "fa-handshake"
  },
  {
    year: "2003",
    title: "Official Recognition",
    description: "Israeli government grants permanent residency status, officially recognizing the community's place in Israeli society.",
    icon: "fa-certificate"
  },
  {
    year: "2024",
    title: "Digital Marketplace Launch",
    description: "KiFar Marketplace launches, bringing community businesses and culture to the global digital marketplace.",
    icon: "fa-globe"
  }
];

// Tour Packages
export const tourPackages: TourPackage[] = [
  {
    id: "heritage-tour",
    title: "Heritage Walking Tour",
    description: "Explore 50+ years of VOP history with community elders sharing authentic stories and traditions.",
    duration: "3 hours",
    price: "₪120",
    image: "/images/community/14.jpg",
    highlights: [
      "Community history sites",
      "Elder storytelling sessions",
      "Traditional meal included"
    ]
  },
  {
    id: "cooking-workshop",
    title: "Vegan Cooking Workshop",
    description: "Learn traditional AHIC recipes and modern vegan techniques from community chefs.",
    duration: "4 hours",
    price: "₪180",
    image: "/images/community/food/1.jpg",
    highlights: [
      "Hands-on cooking experience",
      "Recipe collection included",
      "Take home your creations"
    ]
  },
  {
    id: "farm-experience",
    title: "Organic Farm Experience",
    description: "Work alongside community farmers and learn sustainable agriculture practices.",
    duration: "5 hours",
    price: "₪150",
    image: "/images/community/16.jpg",
    highlights: [
      "Hands-on farming work",
      "Organic produce to take home",
      "Farm-to-table lunch"
    ]
  }
];

// Service Categories
export const serviceCategories: ServiceCategory[] = [
  {
    id: "construction",
    title: "Construction & Trades",
    description: "Carpentry, plumbing, electrical, and general construction services",
    icon: "fa-hammer",
    color: "#478c0b"
  },
  {
    id: "wellness",
    title: "Health & Wellness",
    description: "Natural healing, massage therapy, and holistic health services",
    icon: "fa-spa",
    color: "#f6af0d"
  },
  {
    id: "education",
    title: "Education & Tutoring",
    description: "Hebrew lessons, academic tutoring, and cultural education",
    icon: "fa-graduation-cap",
    color: "#c23c09"
  },
  {
    id: "arts",
    title: "Arts & Creativity",
    description: "Art classes, music lessons, and creative workshops",
    icon: "fa-palette",
    color: "#478c0b"
  }
];

// Featured Service Providers
export const serviceProviders: ServiceProvider[] = [
  {
    id: "yaacov",
    name: "Brother Yaacov",
    title: "Master Carpenter",
    category: "construction",
    description: "30+ years experience in traditional woodworking and modern construction",
    rating: 5,
    reviews: 47,
    image: "/images/community/service-provider-1.jpg"
  },
  {
    id: "miriam",
    name: "Sister Miriam",
    title: "Healing Arts Practitioner",
    category: "wellness",
    description: "Natural healing, herbal medicine, and spiritual wellness guidance",
    rating: 5,
    reviews: 63,
    image: "/images/community/service-provider-2.jpg"
  },
  {
    id: "david",
    name: "Brother David",
    title: "Hebrew Language Teacher",
    category: "education",
    description: "Biblical Hebrew and modern Hebrew instruction for all levels",
    rating: 5,
    reviews: 28,
    image: "/images/community/service-provider-3.jpg"
  }
];

// Education Programs
export const educationPrograms: EducationProgram[] = [
  {
    id: "hebrew-classes",
    title: "Hebrew Language Classes",
    description: "Learn Biblical and modern Hebrew with native speakers and cultural context.",
    duration: "Beginner to Advanced",
    level: "All levels",
    icon: "fa-language"
  },
  {
    id: "history-course",
    title: "AHIC History Course",
    description: "Comprehensive study of African Hebrew Israelite community history and development.",
    duration: "8-week course",
    level: "Intermediate",
    icon: "fa-history"
  },
  {
    id: "vegan-lifestyle",
    title: "Vegan Lifestyle Workshop",
    description: "Learn the principles and practices of healthy vegan living from community experts.",
    duration: "Monthly workshops",
    level: "Beginner",
    icon: "fa-utensils"
  },
  {
    id: "music-arts",
    title: "Community Music & Arts",
    description: "Explore traditional songs, dances, and artistic expressions of our community.",
    duration: "Weekly sessions",
    level: "All levels",
    icon: "fa-music"
  },
  {
    id: "spiritual-practices",
    title: "Spiritual Practices",
    description: "Learn about community spiritual traditions, meditation, and prayer practices.",
    duration: "Respectful observation",
    level: "Advanced",
    icon: "fa-praying-hands"
  },
  {
    id: "sustainable-living",
    title: "Sustainable Living",
    description: "Discover eco-friendly practices and sustainable agriculture methods used in VOP.",
    duration: "Hands-on learning",
    level: "All levels",
    icon: "fa-seedling"
  }
];

// Workshop Schedule
export const workshopSchedule: WorkshopSchedule[] = [
  {
    day: "Monday",
    workshops: [
      { name: "Hebrew Beginners", time: "10:00-11:30" },
      { name: "Vegan Cooking", time: "15:00-17:00" }
    ]
  },
  {
    day: "Tuesday",
    workshops: [
      { name: "Community History", time: "9:00-10:30" },
      { name: "Music & Dance", time: "16:00-17:30" }
    ]
  },
  {
    day: "Wednesday",
    workshops: [
      { name: "Hebrew Advanced", time: "10:00-11:30" },
      { name: "Sustainable Living", time: "14:00-16:00" }
    ]
  },
  {
    day: "Thursday",
    workshops: [
      { name: "Spiritual Practices", time: "8:00-9:30" },
      { name: "Arts & Crafts", time: "15:00-16:30" }
    ]
  },
  {
    day: "Friday",
    workshops: [
      { name: "Family Programs", time: "10:00-12:00" },
      { name: "Sabbath Prep", time: "14:00-15:00" }
    ]
  },
  {
    day: "Sunday",
    workshops: [
      { name: "Community Tours", time: "9:00-12:00" },
      { name: "Cultural Exchange", time: "15:00-17:00" }
    ]
  }
];

// Community Values
export const communityValues: CommunityValue[] = [
  {
    title: "Healthy Living",
    description: "Complete vegan lifestyle, natural foods, and holistic health practices for optimal well-being.",
    icon: "fa-leaf"
  },
  {
    title: "Peace & Harmony",
    description: "Living in peace with all creation, promoting harmony between peoples and respect for all life.",
    icon: "fa-dove"
  },
  {
    title: "Spiritual Growth",
    description: "Continuous learning, spiritual development, and connection to our Hebrew heritage and identity.",
    icon: "fa-book"
  },
  {
    title: "Community Unity",
    description: "Strong family bonds, mutual support, and collective responsibility for community wellbeing.",
    icon: "fa-heart"
  },
  {
    title: "Environmental Stewardship",
    description: "Sustainable practices, organic agriculture, and responsible use of natural resources.",
    icon: "fa-globe"
  },
  {
    title: "Education & Growth",
    description: "Lifelong learning, cultural education, and sharing knowledge with the world.",
    icon: "fa-graduation-cap"
  }
];

// Accommodation Options
export const accommodationOptions: AccommodationOption[] = [
  {
    id: "guesthouse",
    title: "Community Guesthouse",
    description: "Comfortable rooms within the village community",
    price: "₪200/night",
    image: "/images/community/17.jpg"
  },
  {
    id: "homestay",
    title: "Family Homestay",
    description: "Stay with VOP families for authentic experience",
    price: "₪150/night",
    image: "/images/community/18.jpg"
  },
  {
    id: "camping",
    title: "Desert Camping",
    description: "Eco-friendly camping under the stars",
    price: "₪80/night",
    image: "/images/community/19.jpg"
  }
];

// Community Statistics
export const communityStats = {
  members: "3,000+",
  years: "55+",
  businesses: "100+",
  countries: "40+"
};

// Hero Images
export const heroImages = {
  main: "/images/community/5.jpg", // Welcome to VOP sign
  tourism: "/images/community/14.jpg",
  services: "/images/community/20.jpg",
  education: "/images/community/21.jpg"
};

// Community Images for various sections
export const communityImages = {
  story: "/images/community/1.jpg", // Cultural celebration
  timeline: "/images/community/4.jpg",
  values: "/images/community/7.jpg",
  exchange: "/images/community/8.jpg",
  food: "/images/community/food/1.jpg"
};