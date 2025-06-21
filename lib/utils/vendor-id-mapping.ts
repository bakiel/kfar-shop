// Vendor ID mapping between frontend string IDs and database numeric IDs
export const vendorIdMapping = {
  // String ID to Numeric ID
  'queens-cuisine': 1,
  'gahn-delight': 2,
  'teva-deli': 3,
  'vop-shop': 4,
  'garden-of-light': 5,
  'people-store': 6,
  
  // Numeric ID to String ID (for reverse lookup)
  1: 'queens-cuisine',
  2: 'gahn-delight',
  3: 'teva-deli',
  4: 'vop-shop',
  5: 'garden-of-light',
  6: 'people-store'
};

// Helper functions
export function getNumericVendorId(stringId: string): number | null {
  return vendorIdMapping[stringId as keyof typeof vendorIdMapping] as number || null;
}

export function getStringVendorId(numericId: number): string | null {
  return vendorIdMapping[numericId as keyof typeof vendorIdMapping] as string || null;
}

// Vendor metadata for additional info
export const vendorMetadata = {
  'queens-cuisine': {
    name: 'Queens Cuisine',
    dbId: 1
  },
  'gahn-delight': {
    name: 'Gahn Delight',
    dbId: 2
  },
  'teva-deli': {
    name: 'Teva Deli',
    dbId: 3
  },
  'vop-shop': {
    name: 'VOP Shop',
    dbId: 4
  },
  'garden-of-light': {
    name: 'Garden of Light',
    dbId: 5
  },
  'people-store': {
    name: 'People Store',
    dbId: 6
  }
};