// Notification Service - Uses mock data for demo, can be connected to PostgreSQL
// No external dependencies required

export interface Notification {
  id: string;
  customerId: string;
  type: 'order' | 'reward' | 'product' | 'vendor' | 'system' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    orders: boolean;
    rewards: boolean;
    products: boolean;
    vendors: boolean;
    promotions: boolean;
  };
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Generate personalized notifications based on customer behavior
  async generatePersonalizedNotifications(customerId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    try {
      // Get customer data for personalization
      const customerData = await this.getCustomerData(customerId);

      // Check for abandoned cart
      const abandonedCartNotif = await this.checkAbandonedCart(customerId, customerData);
      if (abandonedCartNotif) notifications.push(abandonedCartNotif);

      // Check for loyalty rewards
      const rewardNotifs = await this.checkLoyaltyRewards(customerId, customerData);
      notifications.push(...rewardNotifs);

      // Check for product recommendations
      const productNotifs = await this.checkProductRecommendations(customerId, customerData);
      notifications.push(...productNotifs);

      // Check for vendor updates
      const vendorNotifs = await this.checkVendorUpdates(customerId, customerData);
      notifications.push(...vendorNotifs);

      // Check for order updates
      const orderNotifs = await this.checkOrderUpdates(customerId);
      notifications.push(...orderNotifs);

      return notifications;
    } catch (error) {
      console.error('Error generating notifications:', error);
      return notifications;
    }
  }

  private async getCustomerData(customerId: string): Promise<any> {
    // Mock customer data for demo
    return {
      id: customerId,
      name: 'Sarah Cohen',
      loyaltyTier: 'gold',
      points: 5250,
      preferences: {
        dietaryRestrictions: ['vegan', 'gluten-free'],
        favoriteCategories: ['dairy-alternatives', 'prepared-foods'],
        preferredVendors: ['teva-deli', 'gahn-delight']
      },
      lastOrderDate: new Date('2024-12-20'),
      averageOrderValue: 85,
      shoppingFrequency: 8 // days
    };
  }

  private async checkAbandonedCart(customerId: string, customerData: any): Promise<Notification | null> {
    // Check if customer has items in cart for more than 24 hours
    const hasAbandonedCart = Math.random() > 0.7; // Mock check

    if (hasAbandonedCart) {
      return {
        id: `notif-${Date.now()}-cart`,
        customerId,
        type: 'order',
        priority: 'medium',
        title: '🛒 Complete Your Order',
        message: `You have 3 items waiting in your cart. Complete your order and earn 50 bonus points!`,
        actionUrl: '/cart',
        actionLabel: 'View Cart',
        metadata: {
          cartItems: 3,
          cartValue: 125,
          bonusPoints: 50
        },
        read: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      };
    }

    return null;
  }

  private async checkLoyaltyRewards(customerId: string, customerData: any): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Check if close to next tier
    const pointsToNextTier = 750; // Mock calculation
    if (pointsToNextTier < 1000) {
      notifications.push({
        id: `notif-${Date.now()}-tier`,
        customerId,
        type: 'reward',
        priority: 'high',
        title: '⭐ Almost Platinum!',
        message: `You're only ${pointsToNextTier} points away from Platinum tier and 20% discounts!`,
        actionUrl: '/customer/dashboard/enhanced?tab=rewards',
        actionLabel: 'View Rewards',
        metadata: {
          currentTier: customerData.loyaltyTier,
          nextTier: 'platinum',
          pointsNeeded: pointsToNextTier
        },
        read: false,
        createdAt: new Date()
      });
    }

    // Check for expiring points
    const expiringPoints = 500; // Mock
    if (expiringPoints > 0) {
      notifications.push({
        id: `notif-${Date.now()}-points`,
        customerId,
        type: 'reward',
        priority: 'medium',
        title: '⏰ Points Expiring Soon',
        message: `${expiringPoints} points will expire in 30 days. Use them before they're gone!`,
        actionUrl: '/customer/dashboard/enhanced?tab=rewards',
        actionLabel: 'Redeem Points',
        metadata: {
          expiringPoints,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        read: false,
        createdAt: new Date()
      });
    }

    return notifications;
  }

  private async checkProductRecommendations(customerId: string, customerData: any): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // New products matching preferences
    if (customerData.preferences.dietaryRestrictions.includes('gluten-free')) {
      notifications.push({
        id: `notif-${Date.now()}-product-new`,
        customerId,
        type: 'product',
        priority: 'low',
        title: '🆕 New Gluten-Free Arrivals',
        message: 'Check out our latest gluten-free products from Gahn Delight!',
        actionUrl: '/store/gahn-delight?filter=gluten-free',
        actionLabel: 'Shop Now',
        metadata: {
          vendorId: 'gahn-delight',
          category: 'gluten-free',
          newProducts: 5
        },
        read: false,
        createdAt: new Date()
      });
    }

    // Restocked favorites
    notifications.push({
      id: `notif-${Date.now()}-restock`,
      customerId,
      type: 'product',
      priority: 'medium',
      title: '📦 Your Favorite is Back!',
      message: 'Organic Almond Butter is back in stock at Teva Deli',
      actionUrl: '/product/almond-butter-001',
      actionLabel: 'Order Now',
      metadata: {
        productId: 'almond-butter-001',
        vendorId: 'teva-deli'
      },
      read: false,
      createdAt: new Date()
    });

    return notifications;
  }

  private async checkVendorUpdates(customerId: string, customerData: any): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Special promotion from favorite vendor
    if (customerData.preferences.preferredVendors.includes('teva-deli')) {
      notifications.push({
        id: `notif-${Date.now()}-vendor-promo`,
        customerId,
        type: 'promotion',
        priority: 'high',
        title: '🎉 Exclusive Offer from Teva Deli',
        message: 'As a loyal customer, enjoy 25% off all dairy alternatives this week!',
        actionUrl: '/store/teva-deli',
        actionLabel: 'Shop Sale',
        metadata: {
          vendorId: 'teva-deli',
          discount: 25,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        read: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // New vendor matching preferences
    notifications.push({
      id: `notif-${Date.now()}-vendor-new`,
      customerId,
      type: 'vendor',
      priority: 'low',
      title: '🏪 New Vegan Vendor!',
      message: 'Green Garden just joined KFAR with amazing vegan options',
      actionUrl: '/store/green-garden',
      actionLabel: 'Explore',
      metadata: {
        vendorId: 'green-garden',
        matchingPreferences: ['vegan']
      },
      read: false,
      createdAt: new Date()
    });

    return notifications;
  }

  private async checkOrderUpdates(customerId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Order ready for pickup
    notifications.push({
      id: `notif-${Date.now()}-order-ready`,
      customerId,
      type: 'order',
      priority: 'high',
      title: '✅ Order Ready!',
      message: 'Your order #000042 is ready for pickup at Collection Point A',
      actionUrl: '/customer/orders/000042',
      actionLabel: 'View Details',
      metadata: {
        orderId: '000042',
        collectionPoint: 'A',
        pickupCode: '1234'
      },
      read: false,
      createdAt: new Date()
    });

    return notifications;
  }

  // Get all notifications for a customer
  async getNotifications(customerId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; unreadCount: number }> {
    try {
      // Generate fresh notifications
      const allNotifications = await this.generatePersonalizedNotifications(customerId);

      // Filter based on options
      let filtered = allNotifications;
      if (options?.unreadOnly) {
        filtered = filtered.filter(n => !n.read);
      }

      // Remove expired notifications
      filtered = filtered.filter(n => !n.expiresAt || n.expiresAt > new Date());

      // Sort by priority and date
      filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Apply pagination
      const start = options?.offset || 0;
      const limit = options?.limit || 10;
      const paginated = filtered.slice(start, start + limit);

      return {
        notifications: paginated,
        unreadCount: filtered.filter(n => !n.read).length
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // In production, update in database
      console.log('Marking notification as read:', notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(customerId: string): Promise<boolean> {
    try {
      // In production, update all in database
      console.log('Marking all notifications as read for:', customerId);
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      // In production, delete from database
      console.log('Deleting notification:', notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get notification preferences
  async getPreferences(customerId: string): Promise<NotificationPreferences> {
    try {
      // In production, fetch from database
      return {
        email: true,
        sms: true,
        push: false,
        inApp: true,
        categories: {
          orders: true,
          rewards: true,
          products: true,
          vendors: true,
          promotions: true
        }
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Update notification preferences
  async updatePreferences(
    customerId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      // In production, update in database
      console.log('Updating preferences for:', customerId, preferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      email: true,
      sms: false,
      push: false,
      inApp: true,
      categories: {
        orders: true,
        rewards: true,
        products: true,
        vendors: true,
        promotions: true
      }
    };
  }

  // Send notification through various channels
  async sendNotification(notification: Notification, preferences: NotificationPreferences): Promise<void> {
    try {
      // Check category preference
      const categoryEnabled = preferences.categories[
        notification.type === 'promotion' ? 'promotions' : `${notification.type}s` as keyof typeof preferences.categories
      ];

      if (!categoryEnabled) return;

      // Send through enabled channels
      if (preferences.inApp) {
        // In-app notification is handled by the UI
        console.log('In-app notification sent:', notification.title);
      }

      if (preferences.email && notification.priority !== 'low') {
        // Send email notification
        console.log('Email notification sent:', notification.title);
      }

      if (preferences.sms && notification.priority === 'high') {
        // Send SMS notification
        console.log('SMS notification sent:', notification.title);
      }

      if (preferences.push) {
        // Send push notification
        console.log('Push notification sent:', notification.title);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
