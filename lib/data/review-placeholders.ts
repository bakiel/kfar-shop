// Placeholder review data for system building and testing
// These are generic placeholders - update with real data when available

export interface ReviewPlaceholder {
  id: string;
  authorType: 'community' | 'local' | 'visitor' | 'diaspora';
  imageNumber: number;
  placeholderName: string;
  sampleLocation: string;
  sampleReviewStyle: string;
}

// Note: These are PLACEHOLDERS for building the review system
// The actual images show:
// - Community celebrations and gatherings
// - Traditional African-inspired clothing and headwear
// - Families and children in cultural dress
// - Group events with Israeli flags visible
// - Mix of ages from children to elders

export const reviewPlaceholders: ReviewPlaceholder[] = [
  // Community member placeholders (using celebration/gathering images)
  {
    id: 'placeholder-001',
    authorType: 'community',
    imageNumber: 1,
    placeholderName: 'Community Member 1',
    sampleLocation: 'Village of Peace, Dimona',
    sampleReviewStyle: 'Family-oriented, mentions community values'
  },
  {
    id: 'placeholder-002',
    authorType: 'community',
    imageNumber: 7,
    placeholderName: 'Community Member 2',
    sampleLocation: 'Kfar Hashalom',
    sampleReviewStyle: 'Long-time vegan, appreciates traditional flavors'
  },
  {
    id: 'placeholder-003',
    authorType: 'community',
    imageNumber: 10,
    placeholderName: 'Community Parent',
    sampleLocation: 'Village of Peace',
    sampleReviewStyle: 'Family feedback, children\'s preferences'
  },
  {
    id: 'placeholder-004',
    authorType: 'community',
    imageNumber: 15,
    placeholderName: 'Community Member 4',
    sampleLocation: 'Dimona',
    sampleReviewStyle: 'Celebration meals, group events'
  },
  
  // Visitor placeholders
  {
    id: 'placeholder-005',
    authorType: 'visitor',
    imageNumber: 20,
    placeholderName: 'International Visitor',
    sampleLocation: 'Visiting from abroad',
    sampleReviewStyle: 'Learning about lifestyle, taking ideas home'
  },
  {
    id: 'placeholder-006',
    authorType: 'diaspora',
    imageNumber: 25,
    placeholderName: 'Diaspora Visitor',
    sampleLocation: 'Visiting from USA',
    sampleReviewStyle: 'Connecting with heritage, authentic cuisine'
  }
];

// Sample review templates for different product types
export const reviewTemplates = {
  food: [
    'This product brings authentic flavors to our family table.',
    'Perfect for our community gatherings and celebrations.',
    'My children love this healthy alternative.',
    'Maintains our dietary principles without compromising taste.',
    'A staple in our household for years.'
  ],
  
  iceCream: [
    'The kids ask for this every Shabbat!',
    'Creamy and delicious - can\'t believe it\'s dairy-free.',
    'Perfect treat for hot Dimona days.',
    'Love supporting our local businesses.',
    'Best vegan ice cream in Israel!'
  ],
  
  grocery: [
    'Quality products at fair prices.',
    'The People Store is our go-to for organic goods.',
    'Fresh and well-stocked always.',
    'Appreciate the variety of healthy options.',
    'Community shopping at its best.'
  ]
};

// Vendor owner placeholders
export const vendorOwnerPlaceholders = {
  'teva-deli': {
    placeholderName: 'Teva Deli Founder',
    imageNumber: 7,
    bio: 'Bringing plant-based alternatives to traditional favorites since 2010.'
  },
  'queens-cuisine': {
    placeholderName: 'Queens Cuisine Chef',
    imageNumber: 15,
    bio: 'Master of Middle Eastern vegan cuisine.'
  },
  'gahn-delight': {
    placeholderName: 'Gahn Delight Creator',
    imageNumber: 4,
    bio: 'Artisan ice cream maker specializing in dairy-free desserts.'
  },
  'people-store': {
    placeholderName: 'People Store Manager',
    imageNumber: 10,
    bio: 'Sourcing quality organic products for our community.'
  }
};

// Helper function to generate placeholder review
export function generatePlaceholderReview(
  productType: 'food' | 'iceCream' | 'grocery',
  authorType: 'community' | 'local' | 'visitor' | 'diaspora'
) {
  const templates = reviewTemplates[productType];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    comment: randomTemplate,
    helpful: Math.floor(Math.random() * 30) + 5
  };
}

// Note for implementation:
// 1. These are PLACEHOLDERS - replace with actual names when available
// 2. The images show community celebrations, not individual portraits
// 3. Consider using group photos for vendor "About Us" sections
// 4. Update names to match actual community members if/when provided
// 5. Maintain respectful representation of the community

export const implementationNotes = `
IMPORTANT: These are placeholder profiles for building the review system.
The actual images show:
- Community celebrations and cultural events
- Groups of people in traditional African-inspired clothing
- Families with children
- Festival or holiday gatherings
- Mix of community members of all ages

For production use:
1. Replace placeholder names with actual community member names if available
2. Consider using these images for "Community Life" or "About Us" sections
3. Ensure all representations are respectful and accurate
4. Get proper permissions before using real names/testimonials
`;