import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      
      // Add validated data to request
      (request as any).validatedBody = validated;
      return request;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  };
}

// Common validation schemas
export const schemas = {
  // Order creation
  createOrder: z.object({
    items: z.array(z.object({
      productId: z.string().uuid(),
      vendorId: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive()
    })).min(1),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    deliveryAddress: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string()
    }).optional()
  }),

  // Customer registration
  customerRegistration: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    whatsapp: z.string().optional(),
    preferences: z.object({
      dietary: z.array(z.string()).optional(),
      notifications: z.boolean().optional()
    }).optional()
  }),

  // Vendor registration
  vendorRegistration: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    businessName: z.string().min(2),
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    businessType: z.string(),
    message: z.string().optional()
  }),

  // AI command
  aiCommand: z.object({
    input: z.string().min(1).max(500),
    context: z.object({
      currentProduct: z.any().optional(),
      cart: z.array(z.any()).optional(),
      userPreferences: z.any().optional()
    }).optional()
  })
};