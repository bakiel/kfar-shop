import { NextRequest, NextResponse } from 'next/server';
import { dataIntegration } from '@/lib/services/data-integration';
import { tagManager } from '@/lib/services/tag-manager';
import { qrService } from '@/lib/services/qr-service';
import { customerAnalytics } from '@/lib/services/customer-analytics';

// GET /api/integrated - Unified data endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const customerId = searchParams.get('customerId');

    switch (action) {
      case 'product':
        if (!id) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        const product = await dataIntegration.getProduct(id);
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        // Track view if customer ID provided
        if (customerId) {
          await dataIntegration.trackProductView(id, customerId);
        }
        
        return NextResponse.json(product);

      case 'vendor-products':
        if (!id) {
          return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
        }
        const vendorProducts = await dataIntegration.getProductsByVendor(id);
        return NextResponse.json(vendorProducts);

      case 'products-by-tags':
        if (!tags || tags.length === 0) {
          return NextResponse.json({ error: 'Tags required' }, { status: 400 });
        }
        const taggedProducts = await dataIntegration.getProductsByTags(tags);
        return NextResponse.json(taggedProducts);

      case 'recommendations':
        if (!customerId) {
          return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
        }
        const currentProduct = searchParams.get('currentProduct');
        const category = searchParams.get('category');
        const recommendations = await dataIntegration.getRecommendations(
          customerId,
          { currentProduct, category }
        );
        return NextResponse.json(recommendations);

      case 'customer':
        if (!id) {
          return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
        }
        const customer = customerAnalytics.getCustomer(id);
        if (!customer) {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json(customer);

      case 'trending-tags':
        const trendingCategory = searchParams.get('category') as any;
        const limit = parseInt(searchParams.get('limit') || '10');
        const trendingTags = tagManager.getTrendingTags(trendingCategory, limit);
        return NextResponse.json(trendingTags);

      case 'analytics':
        const period = searchParams.get('period') as any || 'month';
        const analytics = customerAnalytics.getAnalytics(period);
        return NextResponse.json(analytics);

      case 'data-thread':
        if (!id) {
          return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
        }
        const thread = dataIntegration.getDataThread(id);
        if (!thread) {
          return NextResponse.json({ error: 'Data thread not found' }, { status: 404 });
        }
        return NextResponse.json(thread);

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: [
            'product',
            'vendor-products',
            'products-by-tags',
            'recommendations',
            'customer',
            'trending-tags',
            'analytics',
            'data-thread'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrated API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/integrated - Track interactions and manage data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track-view':
        const { productId, customerId, source } = data;
        await dataIntegration.trackProductView(productId, customerId, source);
        return NextResponse.json({ success: true });

      case 'track-cart':
        const { productId: cartProductId, customerId: cartCustomerId, quantity } = data;
        await dataIntegration.trackAddToCart(cartProductId, cartCustomerId, quantity);
        return NextResponse.json({ success: true });

      case 'track-purchase':
        const { orderId, customerId: purchaseCustomerId, items } = data;
        await dataIntegration.trackPurchase(orderId, purchaseCustomerId, items);
        
        // Generate QR code for order
        const orderQR = await qrService.generateQRCode('order', {
          orderId,
          customerId: purchaseCustomerId,
          amount: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
          items
        });
        
        return NextResponse.json({ 
          success: true,
          orderQR: {
            id: orderQR.id,
            code: orderQR.shortCode,
            url: orderQR.fullUrl
          }
        });

      case 'scan-qr':
        const { code, scannerId } = data;
        const scanResult = await dataIntegration.processQRScan(code, scannerId);
        return NextResponse.json(scanResult);

      case 'create-customer':
        const newCustomer = customerAnalytics.createCustomer(data.customer);
        
        // Issue digital ID if community member or VIP
        if (newCustomer.memberType === 'community' || newCustomer.memberType === 'vip') {
          const digitalId = await customerAnalytics.issueDigitalID(newCustomer.id);
          newCustomer.digitalId = digitalId;
        }
        
        return NextResponse.json(newCustomer);

      case 'update-customer':
        const { customerId: updateCustomerId, updates } = data;
        const updatedCustomer = customerAnalytics.updateCustomer(updateCustomerId, updates);
        if (!updatedCustomer) {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json(updatedCustomer);

      case 'tag-entity':
        const { entityId, entityType, tags, taggedBy } = data;
        const taggedEntity = tagManager.tagEntity(entityId, entityType, tags, taggedBy);
        return NextResponse.json(taggedEntity);

      case 'track-touchpoint':
        const { customerId: touchpointCustomerId, touchpoint } = data;
        customerAnalytics.trackTouchpoint(touchpointCustomerId, touchpoint);
        return NextResponse.json({ success: true });

      case 'generate-qr':
        const { type, qrData, options } = data;
        const qrCode = await qrService.generateQRCode(type, qrData, options);
        return NextResponse.json({
          id: qrCode.id,
          code: qrCode.shortCode,
          url: qrCode.fullUrl,
          image: qrCode.metadata?.qrImage
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: [
            'track-view',
            'track-cart',
            'track-purchase',
            'scan-qr',
            'create-customer',
            'update-customer',
            'tag-entity',
            'track-touchpoint',
            'generate-qr'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrated API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/integrated - Update configurations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-tag':
        const newTag = tagManager.createTag(data);
        return NextResponse.json(newTag);

      case 'update-tag':
        const { tagId, updates } = data;
        const updatedTag = tagManager.updateTag(tagId, updates);
        if (!updatedTag) {
          return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }
        return NextResponse.json(updatedTag);

      case 'create-segment':
        customerAnalytics.createSegment(data.segment);
        return NextResponse.json({ success: true });

      case 'import-data':
        await dataIntegration.importData(data);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: [
            'create-tag',
            'update-tag',
            'create-segment',
            'import-data'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrated API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrated - Remove data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    switch (action) {
      case 'tag':
        const deleted = tagManager.deleteTag(id);
        return NextResponse.json({ success: deleted });

      case 'deactivate-qr':
        const deactivated = qrService.deactivateQRCode(id);
        return NextResponse.json({ success: deactivated });

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: ['tag', 'deactivate-qr']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrated API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}