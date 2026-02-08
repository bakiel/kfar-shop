/**
 * Shopping Tools for Gemini Function Calling
 * KFAR AI Shopping Assistant
 */

import {
  FunctionDeclaration,
  FunctionDeclarationsTool,
  SchemaType
} from '@google/generative-ai';

// Tool function declarations for Gemini
export const searchProductsTool: FunctionDeclaration = {
  name: 'search_products',
  description: 'Search for products by name, category, description, or dietary requirements. Use this when the user wants to find or browse products.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'The search query - product name, type, or description keywords',
      },
      category: {
        type: SchemaType.STRING,
        description: 'Filter by category: schnitzels, burgers, shawarma, kebabs, tofu, seitan, spreads, cheeses, salads, chocolates, ice-cream, sorbet, parfait, popsicles, apparel, mugs, accessories, home-decor, bulk-foods, pantry, snacks, beverages, ready-meals, meatballs',
      },
      dietary: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Dietary filters: vegan, kosher, organic, gluten-free, sugar-free, raw',
      },
      vendor: {
        type: SchemaType.STRING,
        description: 'Filter by vendor ID: teva-deli, garden-of-light, queens-cuisine, gahn-delight, vop-shop, people-store',
      },
      priceMax: {
        type: SchemaType.NUMBER,
        description: 'Maximum price filter in ILS',
      },
    },
    required: ['query'],
  },
};

export const addToCartTool: FunctionDeclaration = {
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart. Use when user wants to buy or add something to their cart.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: {
        type: SchemaType.STRING,
        description: 'The product ID to add',
      },
      quantity: {
        type: SchemaType.NUMBER,
        description: 'Quantity to add (default: 1)',
      },
    },
    required: ['productId'],
  },
};

export const viewCartTool: FunctionDeclaration = {
  name: 'view_cart',
  description: 'Show the current shopping cart contents and total. Use when user asks about their cart.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
    required: [],
  },
};

export const removeFromCartTool: FunctionDeclaration = {
  name: 'remove_from_cart',
  description: 'Remove a product from the shopping cart.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: {
        type: SchemaType.STRING,
        description: 'The product ID to remove',
      },
    },
    required: ['productId'],
  },
};

export const updateCartQuantityTool: FunctionDeclaration = {
  name: 'update_cart_quantity',
  description: 'Update the quantity of a product in the cart.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: {
        type: SchemaType.STRING,
        description: 'The product ID to update',
      },
      quantity: {
        type: SchemaType.NUMBER,
        description: 'New quantity (0 to remove)',
      },
    },
    required: ['productId', 'quantity'],
  },
};

export const getProductDetailsTool: FunctionDeclaration = {
  name: 'get_product_details',
  description: 'Get detailed information about a specific product including description, ingredients, and nutritional info.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: {
        type: SchemaType.STRING,
        description: 'The product ID to get details for',
      },
    },
    required: ['productId'],
  },
};

export const browseVendorTool: FunctionDeclaration = {
  name: 'browse_vendor',
  description: 'Show all products from a specific vendor/store. Use when user asks about a specific vendor.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      vendorId: {
        type: SchemaType.STRING,
        description: 'Vendor ID: teva-deli, garden-of-light, queens-cuisine, gahn-delight, vop-shop, people-store',
      },
      category: {
        type: SchemaType.STRING,
        description: 'Optional category filter within the vendor',
      },
    },
    required: ['vendorId'],
  },
};

export const getRecommendationsTool: FunctionDeclaration = {
  name: 'get_recommendations',
  description: 'Get product recommendations - similar products, deals, trending, or personalized suggestions.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      type: {
        type: SchemaType.STRING,
        format: 'enum',
        enum: ['similar', 'deals', 'trending', 'personalized'],
        description: 'Type of recommendations to get',
      },
      productId: {
        type: SchemaType.STRING,
        description: 'Reference product ID for similar recommendations',
      },
      category: {
        type: SchemaType.STRING,
        description: 'Category for trending/deals',
      },
    },
    required: ['type'],
  },
};

export const listVendorsTool: FunctionDeclaration = {
  name: 'list_vendors',
  description: 'List all available vendors/stores in the marketplace.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
    required: [],
  },
};

export const listCategoriesTool: FunctionDeclaration = {
  name: 'list_categories',
  description: 'List all available product categories with counts.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
    required: [],
  },
};

// All tools combined for Gemini
export const SHOPPING_TOOLS: FunctionDeclarationsTool[] = [
  {
    functionDeclarations: [
      searchProductsTool,
      addToCartTool,
      viewCartTool,
      removeFromCartTool,
      updateCartQuantityTool,
      getProductDetailsTool,
      browseVendorTool,
      getRecommendationsTool,
      listVendorsTool,
      listCategoriesTool,
    ],
  },
];

// Tool name type for type safety
export type ShoppingToolName =
  | 'search_products'
  | 'add_to_cart'
  | 'view_cart'
  | 'remove_from_cart'
  | 'update_cart_quantity'
  | 'get_product_details'
  | 'browse_vendor'
  | 'get_recommendations'
  | 'list_vendors'
  | 'list_categories';

// Tool call result type
export interface ToolCallResult {
  toolName: ShoppingToolName;
  args: Record<string, unknown>;
  result: unknown;
  success: boolean;
  error?: string;
}
