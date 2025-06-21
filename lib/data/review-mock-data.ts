// Mock review data with authentic Village of Peace community members and visitors
// Images represent community members, Israeli public, and African diaspora visitors

export interface ReviewAuthor {
  id: string;
  name: string;
  image: string;
  location: string;
  memberType: 'community' | 'local' | 'visitor' | 'diaspora';
  verified: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: ReviewAuthor;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
  images?: string[];
  vendorResponse?: {
    date: string;
    message: string;
  };
}

// Community member profiles with authentic Hebrew-influenced names
export const reviewAuthors: ReviewAuthor[] = [
  // Village of Peace Community Members
  {
    id: 'auth-001',
    name: 'Yahlital Ben-Israel',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_01.jpg',
    location: 'Village of Peace, Dimona',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-002',
    name: 'Toveet Baht-Shalom',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_02.jpg',
    location: 'Kfar Hashalom, Dimona',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-003',
    name: 'Elishai Young',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_03.jpg',
    location: 'Village of Peace',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-004',
    name: 'Ahmeeteeyah Cohen',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_04.jpg',
    location: 'Dimona',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-005',
    name: 'Gadiel Ben-Yehuda',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_05.jpg',
    location: 'Village of Peace',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-006',
    name: 'Koliyah Baht-Israel',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_06.jpg',
    location: 'Kfar Hashalom',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-007',
    name: 'Immanuel Rivers',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_07.jpg',
    location: 'Village of Peace, Dimona',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-008',
    name: 'Ashriel Moore',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_08.jpg',
    location: 'Dimona Community',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-009',
    name: 'Tziporah Baht-Yah',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_09.jpg',
    location: 'Village of Peace',
    memberType: 'community',
    verified: true
  },
  {
    id: 'auth-010',
    name: 'Nathaniel Ben-Israel',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_10.jpg',
    location: 'Kfar Hashalom, Dimona',
    memberType: 'community',
    verified: true
  },
  
  // Local Israeli Residents
  {
    id: 'auth-011',
    name: 'Sarah Goldstein',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_11.jpg',
    location: 'Beer Sheva',
    memberType: 'local',
    verified: true
  },
  {
    id: 'auth-012',
    name: 'David Cohen',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_12.jpg',
    location: 'Tel Aviv',
    memberType: 'local',
    verified: false
  },
  {
    id: 'auth-013',
    name: 'Rachel Mizrahi',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_13.jpg',
    location: 'Jerusalem',
    memberType: 'local',
    verified: true
  },
  {
    id: 'auth-014',
    name: 'Yossi Levi',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_14.jpg',
    location: 'Dimona',
    memberType: 'local',
    verified: true
  },
  {
    id: 'auth-015',
    name: 'Miriam Azoulay',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_15.jpg',
    location: 'Eilat',
    memberType: 'local',
    verified: false
  },
  
  // African Diaspora Visitors
  {
    id: 'auth-016',
    name: 'Kwame Johnson',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_16.jpg',
    location: 'Chicago, USA',
    memberType: 'diaspora',
    verified: true
  },
  {
    id: 'auth-017',
    name: 'Aisha Williams',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_17.jpg',
    location: 'Atlanta, USA',
    memberType: 'diaspora',
    verified: true
  },
  {
    id: 'auth-018',
    name: 'Marcus Thompson',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_18.jpg',
    location: 'London, UK',
    memberType: 'diaspora',
    verified: false
  },
  {
    id: 'auth-019',
    name: 'Fatima Diallo',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_19.jpg',
    location: 'Paris, France',
    memberType: 'diaspora',
    verified: true
  },
  {
    id: 'auth-020',
    name: 'Emmanuel Okonkwo',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_20.jpg',
    location: 'Lagos, Nigeria',
    memberType: 'diaspora',
    verified: true
  },
  
  // International Visitors
  {
    id: 'auth-021',
    name: 'James Mitchell',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_21.jpg',
    location: 'Toronto, Canada',
    memberType: 'visitor',
    verified: false
  },
  {
    id: 'auth-022',
    name: 'Lisa Anderson',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_22.jpg',
    location: 'Sydney, Australia',
    memberType: 'visitor',
    verified: true
  },
  {
    id: 'auth-023',
    name: 'Carlos Rodriguez',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_23.jpg',
    location: 'Mexico City',
    memberType: 'visitor',
    verified: false
  },
  {
    id: 'auth-024',
    name: 'Sophie Laurent',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_24.jpg',
    location: 'Brussels, Belgium',
    memberType: 'visitor',
    verified: true
  },
  {
    id: 'auth-025',
    name: 'Michael O\'Brien',
    image: '/images/community/village_of_peace_community_authentic_dimona_israel_25.jpg',
    location: 'Dublin, Ireland',
    memberType: 'visitor',
    verified: false
  }
];

// Sample product reviews for Teva Deli products
export const productReviews: ProductReview[] = [
  // Teva Deli Schnitzel Reviews
  {
    id: 'rev-001',
    productId: 'td-001',
    author: reviewAuthors[0], // Yahlital Ben-Israel
    rating: 5,
    date: '2025-01-15',
    title: 'Best vegan schnitzel I\'ve ever had!',
    comment: 'As a community member who\'s been vegan for over 20 years, this schnitzel brings back memories of traditional cooking with a healthy twist. The texture is perfect and the seasoning is spot on. My whole family loves it!',
    helpful: 24,
    images: ['/images/vendors/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg']
  },
  {
    id: 'rev-002',
    productId: 'td-001',
    author: reviewAuthors[11], // Sarah Goldstein
    rating: 4,
    date: '2025-01-10',
    title: 'Impressed local customer',
    comment: 'I\'m not vegan but tried this at a friend\'s house in the Village. Was really surprised by how much it tastes like real schnitzel. Will definitely buy for my mixed diet family.',
    helpful: 18,
    vendorResponse: {
      date: '2025-01-11',
      message: 'Thank you Sarah! We\'re so glad you enjoyed it. Our products are made with love for everyone to enjoy!'
    }
  },
  
  // People Store Maple Syrup Reviews
  {
    id: 'rev-003',
    productId: 'ps-004',
    author: reviewAuthors[2], // Elishai Young
    rating: 5,
    date: '2025-01-20',
    title: 'Pure quality from the People Store',
    comment: 'The People Store never disappoints. This maple syrup is so pure and rich. Perfect for our vegan pancakes on Shabbat morning. Supporting community businesses is important to us.',
    helpful: 31
  },
  {
    id: 'rev-004',
    productId: 'ps-004',
    author: reviewAuthors[16], // Kwame Johnson
    rating: 5,
    date: '2025-01-18',
    title: 'Visiting from Chicago - Amazing!',
    comment: 'Came to visit the community and had to stock up at the People Store. This maple syrup reminds me of the quality we get at Soul Vegetarian back home. Truly blessed products!',
    helpful: 27
  },
  
  // Gahn Delight Ice Cream Reviews
  {
    id: 'rev-005',
    productId: 'gd-001', // Chocolate Tahini Swirl
    author: reviewAuthors[5], // Koliyah Baht-Israel
    rating: 5,
    date: '2025-01-22',
    title: 'Children\'s favorite treat!',
    comment: 'My children beg for Gahn Delight ice cream! The chocolate tahini is creamy and not too sweet. Love that it\'s made right here in our community with wholesome ingredients.',
    helpful: 45,
    images: ['/images/vendors/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg']
  },
  {
    id: 'rev-006',
    productId: 'gd-002', // Passion Mango
    author: reviewAuthors[14], // Miriam Azoulay
    rating: 4,
    date: '2025-01-19',
    title: 'Tropical paradise in Dimona',
    comment: 'Discovered this at the market. The passion mango flavor is incredible - tastes like real fruit! A bit pricey but worth it for special occasions.',
    helpful: 22
  },
  
  // Queens Cuisine Reviews
  {
    id: 'rev-007',
    productId: 'qc-001', // Seitan Shawarma
    author: reviewAuthors[3], // Ahmeeteeyah Cohen
    rating: 5,
    date: '2025-01-25',
    title: 'Better than the original!',
    comment: 'Queens Cuisine has perfected the art of plant-based Middle Eastern food. This shawarma is so flavorful and the texture is unbelievable. My non-vegan guests couldn\'t tell the difference!',
    helpful: 38
  },
  {
    id: 'rev-008',
    productId: 'qc-001',
    author: reviewAuthors[19], // Fatima Diallo
    rating: 5,
    date: '2025-01-23',
    title: 'Visiting from Paris - Magnifique!',
    comment: 'I came to learn about the Village of Peace lifestyle. This shawarma exceeded all expectations. Taking the recipe ideas back to our vegan community in France!',
    helpful: 29,
    vendorResponse: {
      date: '2025-01-24',
      message: 'Merci beaucoup Fatima! We\'re honored to share our cuisine with the global community. Bon appétit!'
    }
  },
  
  // Mixed Product Reviews
  {
    id: 'rev-009',
    productId: 'td-046', // Teva Deli Tofu Natural
    author: reviewAuthors[7], // Ashriel Moore
    rating: 5,
    date: '2025-01-26',
    title: 'Freshest tofu in Israel',
    comment: 'Been buying Teva Deli tofu for years. It\'s always fresh, firm, and perfect for any dish. Great protein source for our athletic training.',
    helpful: 19
  },
  {
    id: 'rev-010',
    productId: 'ps-009', // Sesame Oil
    author: reviewAuthors[9], // Nathaniel Ben-Israel
    rating: 4,
    date: '2025-01-24',
    title: 'Quality oil for healing cuisine',
    comment: 'This sesame oil is pure and adds great flavor to our dishes. A bit expensive but the quality justifies the price. People Store always stocks the best.',
    helpful: 15
  }
];

// Helper function to get reviews by product
export function getProductReviews(productId: string): ProductReview[] {
  return productReviews.filter(review => review.productId === productId);
}

// Helper function to get reviews by vendor
export function getVendorReviews(vendorId: string): ProductReview[] {
  return productReviews.filter(review => 
    review.productId.startsWith(vendorId.substring(0, 2))
  );
}

// Helper function to calculate average rating
export function getAverageRating(productId: string): number {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / reviews.length) * 10) / 10;
}

// Helper function to get review stats
export function getReviewStats(productId: string) {
  const reviews = getProductReviews(productId);
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    ratingCounts[review.rating as keyof typeof ratingCounts]++;
  });
  
  return {
    total: reviews.length,
    average: getAverageRating(productId),
    distribution: ratingCounts
  };
}