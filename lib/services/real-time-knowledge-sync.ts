// lib/services/real-time-knowledge-sync.ts
// Real-time sync functionality using PostgreSQL instead of Supabase realtime
import { query } from '@/lib/db/postgres-client';
import { kfarKnowledgeBase } from '@/lib/ai/knowledge-base';
import { masterOrchestrator } from '@/lib/ai/master-orchestrator-agent';

// Real-time subscription manager
// Note: PostgreSQL doesn't have built-in realtime like Supabase
// For production, consider using PostgreSQL LISTEN/NOTIFY with pg-listen
// or polling mechanism
export class RealTimeKnowledgeSync {
  private isInitialized = false;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastChecked: Map<string, Date> = new Map();

  // Initialize sync (polling-based for now)
  async initialize() {
    if (this.isInitialized) return;

    console.log('🔄 Initializing knowledge sync (polling mode)...');

    // For now, we use polling - can be upgraded to LISTEN/NOTIFY later
    // Start polling for changes every 30 seconds
    this.startPolling('products', 30000);
    this.startPolling('vendors', 60000);
    this.startPolling('promotions', 60000);

    this.isInitialized = true;
    console.log('✅ Knowledge sync initialized (polling mode)');
  }

  // Start polling for a table
  private startPolling(table: string, intervalMs: number) {
    this.lastChecked.set(table, new Date());

    const interval = setInterval(async () => {
      try {
        await this.checkForChanges(table);
      } catch (error) {
        console.error(`[Sync] Error polling ${table}:`, error);
      }
    }, intervalMs);

    this.pollingIntervals.set(table, interval);
  }

  // Check for changes since last poll
  private async checkForChanges(table: string) {
    const lastCheck = this.lastChecked.get(table) || new Date(0);
    this.lastChecked.set(table, new Date());

    try {
      const { rows } = await query(
        `SELECT * FROM ${table} WHERE updated_at > $1 ORDER BY updated_at DESC LIMIT 50`,
        [lastCheck.toISOString()]
      );

      for (const row of rows) {
        await this.handleDatabaseChange(table, {
          eventType: 'UPDATE',
          new: row,
          old: null
        });
      }
    } catch (error) {
      // Table might not exist or have updated_at column
      console.log(`[Sync] Could not poll ${table}:`, error);
    }
  }

  // Handle database changes
  private async handleDatabaseChange(table: string, payload: any) {
    const { eventType, new: newData, old: oldData } = payload;

    try {
      switch (table) {
        case 'products':
          await this.handleProductChange(eventType, newData, oldData);
          break;

        case 'vendors':
          await this.handleVendorChange(eventType, newData, oldData);
          break;

        case 'promotions':
          await this.handlePromotionChange(eventType, newData, oldData);
          break;

        case 'reviews':
          await this.handleReviewChange(eventType, newData);
          break;

        case 'orders':
          await this.handleOrderChange(eventType, newData);
          break;
      }

      // Notify the orchestrator agent
      if (masterOrchestrator?.handleDatabaseChange) {
        await masterOrchestrator.handleDatabaseChange(table, eventType, newData);
      }
    } catch (error) {
      console.error(`[Sync] Error handling ${table} change:`, error);
    }
  }

  // Handle product changes
  private async handleProductChange(event: string, newData: any, oldData?: any) {
    const docId = `product_${newData?.id || oldData?.id}`;

    switch (event) {
      case 'INSERT':
      case 'UPDATE':
        if (newData && kfarKnowledgeBase?.updateDocument) {
          // Get vendor info
          let vendorName = 'KFAR Vendor';
          try {
            const { rows } = await query(
              `SELECT name FROM vendors WHERE id = $1`,
              [newData.vendor_id]
            );
            vendorName = rows[0]?.name || 'KFAR Vendor';
          } catch (e) {
            // Use default vendor name
          }

          await kfarKnowledgeBase.updateDocument(docId, {
            type: 'product',
            title: newData.name,
            content: this.formatProductContent(newData, vendorName),
            metadata: {
              vendorId: newData.vendor_id,
              vendorName: vendorName,
              price: newData.price,
              category: newData.category,
              inStock: newData.in_stock,
              kosher: newData.kosher,
              organic: newData.organic,
              glutenFree: newData.gluten_free,
            },
          });

          console.log(`[Knowledge] Product ${event}: ${newData.name}`);
        }
        break;

      case 'DELETE':
        // Mark as deleted in knowledge base (don't remove completely)
        if (oldData && kfarKnowledgeBase?.getDocument) {
          const doc = kfarKnowledgeBase.getDocument(docId);
          if (doc && kfarKnowledgeBase?.updateDocument) {
            await kfarKnowledgeBase.updateDocument(docId, {
              ...doc,
              metadata: {
                ...doc.metadata,
                deleted: true,
                deletedAt: new Date().toISOString(),
              },
            });
          }
        }
        break;
    }
  }

  // Handle vendor changes
  private async handleVendorChange(event: string, newData: any, oldData?: any) {
    const docId = `vendor_${newData?.id || oldData?.id}`;

    switch (event) {
      case 'INSERT':
      case 'UPDATE':
        if (newData && kfarKnowledgeBase?.updateDocument) {
          // Get product count
          let productCount = 0;
          try {
            const { rows } = await query(
              `SELECT COUNT(*) as count FROM products WHERE vendor_id = $1`,
              [newData.id]
            );
            productCount = parseInt(rows[0]?.count || '0');
          } catch (e) {
            // Use 0 as default
          }

          await kfarKnowledgeBase.updateDocument(docId, {
            type: 'vendor',
            title: newData.name,
            content: this.formatVendorContent(newData, productCount),
            metadata: {
              vendorId: newData.id,
              productCount: productCount,
              specialties: newData.specialties || [],
              status: newData.status,
            },
          });

          console.log(`[Knowledge] Vendor ${event}: ${newData.name}`);
        }
        break;

      case 'DELETE':
        // Archive vendor in knowledge base
        if (oldData && kfarKnowledgeBase?.getDocument) {
          const doc = kfarKnowledgeBase.getDocument(docId);
          if (doc && kfarKnowledgeBase?.updateDocument) {
            await kfarKnowledgeBase.updateDocument(docId, {
              ...doc,
              metadata: {
                ...doc.metadata,
                archived: true,
                archivedAt: new Date().toISOString(),
              },
            });
          }
        }
        break;
    }
  }

  // Handle promotion changes
  private async handlePromotionChange(event: string, newData: any, oldData?: any) {
    const docId = `promo_${newData?.id || oldData?.id}`;

    switch (event) {
      case 'INSERT':
      case 'UPDATE':
        if (newData && kfarKnowledgeBase?.updateDocument) {
          // Check if promotion is active
          const now = new Date();
          const start = new Date(newData.start_date);
          const end = new Date(newData.end_date);
          const isActive = now >= start && now <= end && newData.status === 'active';

          if (isActive) {
            await kfarKnowledgeBase.updateDocument(docId, {
              type: 'general',
              title: `🎉 ${newData.name}`,
              content: this.formatPromotionContent(newData),
              metadata: {
                promoId: newData.id,
                type: newData.type,
                active: true,
                vendorId: newData.vendor_id,
                endDate: newData.end_date,
              },
            });

            console.log(`[Knowledge] Promotion ${event}: ${newData.name}`);
          } else {
            // Remove inactive promotions from knowledge base
            const doc = kfarKnowledgeBase.getDocument(docId);
            if (doc) {
              await kfarKnowledgeBase.updateDocument(docId, {
                ...doc,
                metadata: {
                  ...doc.metadata,
                  active: false,
                },
              });
            }
          }
        }
        break;

      case 'DELETE':
        // Remove promotion from knowledge base
        if (oldData && kfarKnowledgeBase?.getDocument) {
          const doc = kfarKnowledgeBase.getDocument(docId);
          if (doc && kfarKnowledgeBase?.updateDocument) {
            await kfarKnowledgeBase.updateDocument(docId, {
              ...doc,
              metadata: {
                ...doc.metadata,
                deleted: true,
              },
            });
          }
        }
        break;
    }
  }

  // Handle review changes
  private async handleReviewChange(event: string, newData: any) {
    if (event === 'INSERT' && newData && kfarKnowledgeBase?.getDocument) {
      // Update product rating in knowledge base
      try {
        const { rows } = await query(
          `SELECT name, average_rating, review_count FROM products WHERE id = $1`,
          [newData.product_id]
        );
        const product = rows[0];

        if (product) {
          const docId = `product_${newData.product_id}`;
          const doc = kfarKnowledgeBase.getDocument(docId);

          if (doc && kfarKnowledgeBase?.updateDocument) {
            await kfarKnowledgeBase.updateDocument(docId, {
              ...doc,
              metadata: {
                ...doc.metadata,
                averageRating: product.average_rating,
                reviewCount: product.review_count,
                lastReview: {
                  rating: newData.rating,
                  comment: newData.comment,
                  date: newData.created_at,
                },
              },
            });
          }
        }
      } catch (e) {
        console.log('[Knowledge] Could not update product review data');
      }

      console.log(`[Knowledge] New review for product ${newData.product_id}`);
    }
  }

  // Handle order changes
  private async handleOrderChange(event: string, newData: any) {
    if (event === 'INSERT' && newData && kfarKnowledgeBase?.getDocument) {
      // Update vendor sales metrics
      try {
        const { rows: orderItems } = await query(
          `SELECT oi.*, p.vendor_id, p.name as product_name
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [newData.id]
        );

        if (orderItems) {
          // Group by vendor
          const vendorSales = new Map<string, number>();

          for (const item of orderItems) {
            const vendorId = item.vendor_id;
            if (vendorId) {
              const current = vendorSales.get(vendorId) || 0;
              vendorSales.set(vendorId, current + (item.price * item.quantity));
            }
          }

          // Update vendor documents with latest sales info
          for (const [vendorId, salesAmount] of vendorSales) {
            const docId = `vendor_${vendorId}`;
            const doc = kfarKnowledgeBase.getDocument(docId);

            if (doc && kfarKnowledgeBase?.updateDocument) {
              const todaySales = (doc.metadata.todaySales || 0) + salesAmount;
              await kfarKnowledgeBase.updateDocument(docId, {
                ...doc,
                metadata: {
                  ...doc.metadata,
                  lastSale: new Date().toISOString(),
                  todaySales,
                },
              });
            }
          }
        }
      } catch (e) {
        console.log('[Knowledge] Could not update vendor sales data');
      }

      console.log(`[Knowledge] New order processed: ${newData.id}`);
    }
  }

  // Format content helpers
  private formatProductContent(product: any, vendorName?: string): string {
    return `${product.name} by ${vendorName || 'KFAR Vendor'}

    Price: ₪${product.price}
    Category: ${product.category || 'General'}

    ${product.description || 'Premium vegan product from KFAR Marketplace'}

    Dietary Info:
    - 100% Vegan ✓
    ${product.kosher ? '- Kosher Certified ⓚ' : ''}
    ${product.organic ? '- Organic 🌱' : ''}
    ${product.gluten_free ? '- Gluten-Free' : ''}
    ${product.sugar_free ? '- Sugar-Free' : ''}

    ${product.ingredients ? `Ingredients: ${product.ingredients}` : ''}
    ${product.allergens ? `Allergens: ${product.allergens}` : ''}

    Stock: ${product.in_stock ? 'Available' : 'Out of Stock'}
    ${product.average_rating ? `Rating: ${product.average_rating}/5 (${product.review_count} reviews)` : ''}`;
  }

  private formatVendorContent(vendor: any, productCount: number): string {
    return `${vendor.name}

    ${vendor.description || 'Premium vendor at KFAR Marketplace'}

    Products: ${productCount} items
    Specialties: ${vendor.specialties?.join(', ') || 'Vegan products'}

    ${vendor.story || ''}

    Contact: ${vendor.contact_email || 'Through marketplace'}
    Status: ${vendor.status === 'active' ? 'Active ✓' : vendor.status}

    ${vendor.certifications ? `Certifications: ${vendor.certifications.join(', ')}` : ''}`;
  }

  private formatPromotionContent(promo: any): string {
    return `${promo.name}

    Type: ${promo.type}
    ${promo.discount_percent ? `Discount: ${promo.discount_percent}% OFF` : ''}
    ${promo.discount_amount ? `Save: ₪${promo.discount_amount}` : ''}

    Valid: ${new Date(promo.start_date).toLocaleDateString()} - ${new Date(promo.end_date).toLocaleDateString()}

    ${promo.description || ''}

    ${promo.conditions?.min_purchase ? `Minimum purchase: ₪${promo.conditions.min_purchase}` : ''}
    ${promo.conditions?.max_uses ? `Limited: ${promo.conditions.max_uses} uses` : ''}
    ${promo.product_ids ? `Applies to specific products` : 'Storewide promotion'}`;
  }

  // Cleanup polling intervals
  async cleanup() {
    for (const [table, interval] of this.pollingIntervals) {
      clearInterval(interval);
      console.log(`[Sync] Stopped polling ${table}`);
    }
    this.pollingIntervals.clear();
    this.lastChecked.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const realTimeSync = new RealTimeKnowledgeSync();

// Auto-initialize if in production
if (process.env.NODE_ENV === 'production') {
  realTimeSync.initialize().catch(console.error);
}
