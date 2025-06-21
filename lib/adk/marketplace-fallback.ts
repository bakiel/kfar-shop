// Fallback marketplace data for when database is not available
export const FALLBACK_MARKETPLACE_DATA = {
  vendors: [
    {
      id: '1',
      name: 'Teva Deli',
      slug: 'teva-deli',
      description: 'Pioneer vegan meat alternatives factory',
      category: 'food',
      is_active: true,
      product_count: 46
    },
    {
      id: '2',
      name: 'People Store',
      slug: 'people-store',
      description: 'Books, apparel, and household items',
      category: 'retail',
      is_active: true,
      product_count: 23
    },
    {
      id: '3',
      name: "Queen's Cuisine",
      slug: 'queens-cuisine',
      description: 'Vegan burgers and kebabs',
      category: 'food',
      is_active: true,
      product_count: 3
    },
    {
      id: '4',
      name: 'Gahn Delight',
      slug: 'gahn-delight',
      description: 'Vegan ice cream and desserts',
      category: 'food',
      is_active: true,
      product_count: 3
    },
    {
      id: '5',
      name: 'Garden of Light',
      slug: 'garden-of-light',
      description: 'Fresh salads and prepared foods',
      category: 'food',
      is_active: true,
      product_count: 3
    },
    {
      id: '6',
      name: 'VOP Shop',
      slug: 'vop-shop',
      description: 'Community merchandise and heritage items',
      category: 'retail',
      is_active: true,
      product_count: 3
    }
  ],
  stats: {
    vendor_count: 6,
    product_count: 81,
    category_count: 5,
    avg_price: 45
  }
};
