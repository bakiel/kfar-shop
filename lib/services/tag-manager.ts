// Tag Management System for KiFar Marketplace
// Handles tagging for products, vendors, customers, orders, and support

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  type: TagType;
  color: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, any>;
  count: number;
  priority?: number;
  autoApply?: TagAutoApplyRule[];
  createdAt: Date;
  updatedAt: Date;
}

export type TagCategory = 
  | 'product'      // Product attributes (vegan, kosher, organic, etc.)
  | 'vendor'       // Vendor classifications
  | 'customer'     // Customer segments
  | 'order'        // Order status and attributes
  | 'support'      // Support ticket categorization
  | 'community'    // Community-related tags
  | 'system';      // System-generated tags

export type TagType = 
  | 'attribute'    // Descriptive attribute
  | 'status'       // Status indicator
  | 'category'     // Categorization
  | 'priority'     // Priority level
  | 'access'       // Access control
  | 'benefit'      // Membership benefit
  | 'alert'        // Alert/notification trigger
  | 'analytics';   // Analytics and reporting

export interface TagAutoApplyRule {
  condition: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
  value: any;
}

export interface TaggedEntity {
  entityId: string;
  entityType: 'product' | 'vendor' | 'customer' | 'order' | 'ticket';
  tags: string[];
  autoTags?: string[];
  customTags?: string[];
  taggedAt: Date;
  taggedBy?: string;
}

export interface TagAnalytics {
  tagId: string;
  usageCount: number;
  trendingScore: number;
  associatedTags: { tagId: string; correlation: number }[];
  conversionRate?: number;
  customerSatisfaction?: number;
}

// Predefined system tags
export const SYSTEM_TAGS: Partial<Tag>[] = [
  // Product Tags
  { name: 'vegan', slug: 'vegan', category: 'product', type: 'attribute', color: '#478c0b', icon: 'fa-leaf' },
  { name: 'kosher', slug: 'kosher', category: 'product', type: 'attribute', color: '#3a3a1d', icon: 'fa-check-circle' },
  { name: 'organic', slug: 'organic', category: 'product', type: 'attribute', color: '#478c0b', icon: 'fa-seedling' },
  { name: 'gluten-free', slug: 'gluten-free', category: 'product', type: 'attribute', color: '#f6af0d', icon: 'fa-wheat' },
  { name: 'raw', slug: 'raw', category: 'product', type: 'attribute', color: '#cfe7c1', icon: 'fa-carrot' },
  { name: 'handmade', slug: 'handmade', category: 'product', type: 'attribute', color: '#c23c09', icon: 'fa-hand-sparkles' },
  { name: 'local', slug: 'local', category: 'product', type: 'attribute', color: '#478c0b', icon: 'fa-map-pin' },
  { name: 'seasonal', slug: 'seasonal', category: 'product', type: 'attribute', color: '#f6af0d', icon: 'fa-calendar' },
  { name: 'best-seller', slug: 'best-seller', category: 'product', type: 'status', color: '#c23c09', icon: 'fa-fire' },
  { name: 'new-arrival', slug: 'new-arrival', category: 'product', type: 'status', color: '#478c0b', icon: 'fa-sparkles' },
  { name: 'limited-edition', slug: 'limited-edition', category: 'product', type: 'status', color: '#f6af0d', icon: 'fa-hourglass' },
  
  // Vendor Tags
  { name: 'founding-vendor', slug: 'founding-vendor', category: 'vendor', type: 'status', color: '#f6af0d', icon: 'fa-star' },
  { name: 'certified', slug: 'certified', category: 'vendor', type: 'status', color: '#478c0b', icon: 'fa-certificate' },
  { name: 'community-owned', slug: 'community-owned', category: 'vendor', type: 'attribute', color: '#3a3a1d', icon: 'fa-users' },
  { name: 'eco-friendly', slug: 'eco-friendly', category: 'vendor', type: 'attribute', color: '#478c0b', icon: 'fa-recycle' },
  { name: 'woman-owned', slug: 'woman-owned', category: 'vendor', type: 'attribute', color: '#c23c09', icon: 'fa-female' },
  
  // Customer Tags
  { name: 'vip', slug: 'vip', category: 'customer', type: 'status', color: '#f6af0d', icon: 'fa-crown' },
  { name: 'community-member', slug: 'community-member', category: 'customer', type: 'status', color: '#478c0b', icon: 'fa-id-card' },
  { name: 'tourist', slug: 'tourist', category: 'customer', type: 'category', color: '#3a3a1d', icon: 'fa-globe' },
  { name: 'wholesale', slug: 'wholesale', category: 'customer', type: 'category', color: '#c23c09', icon: 'fa-warehouse' },
  { name: 'first-time', slug: 'first-time', category: 'customer', type: 'status', color: '#cfe7c1', icon: 'fa-user-plus' },
  { name: 'returning', slug: 'returning', category: 'customer', type: 'status', color: '#478c0b', icon: 'fa-redo' },
  
  // Order Tags
  { name: 'express', slug: 'express', category: 'order', type: 'priority', color: '#c23c09', icon: 'fa-bolt' },
  { name: 'gift', slug: 'gift', category: 'order', type: 'category', color: '#f6af0d', icon: 'fa-gift' },
  { name: 'subscription', slug: 'subscription', category: 'order', type: 'category', color: '#478c0b', icon: 'fa-sync' },
  { name: 'bulk-order', slug: 'bulk-order', category: 'order', type: 'category', color: '#3a3a1d', icon: 'fa-boxes' },
  { name: 'fragile', slug: 'fragile', category: 'order', type: 'alert', color: '#c23c09', icon: 'fa-exclamation-triangle' },
  
  // Support Tags
  { name: 'urgent', slug: 'urgent', category: 'support', type: 'priority', color: '#c23c09', icon: 'fa-exclamation-circle', priority: 1 },
  { name: 'payment-issue', slug: 'payment-issue', category: 'support', type: 'category', color: '#f6af0d', icon: 'fa-credit-card' },
  { name: 'shipping-delay', slug: 'shipping-delay', category: 'support', type: 'category', color: '#c23c09', icon: 'fa-truck' },
  { name: 'product-quality', slug: 'product-quality', category: 'support', type: 'category', color: '#3a3a1d', icon: 'fa-exclamation' },
  { name: 'technical', slug: 'technical', category: 'support', type: 'category', color: '#478c0b', icon: 'fa-cog' },
  { name: 'resolved', slug: 'resolved', category: 'support', type: 'status', color: '#478c0b', icon: 'fa-check' },
  
  // Community Tags
  { name: 'ahic-values', slug: 'ahic-values', category: 'community', type: 'attribute', color: '#478c0b', icon: 'fa-heart' },
  { name: 'heritage-item', slug: 'heritage-item', category: 'community', type: 'attribute', color: '#f6af0d', icon: 'fa-landmark' },
  { name: 'celebration', slug: 'celebration', category: 'community', type: 'category', color: '#c23c09', icon: 'fa-star' },
  { name: 'educational', slug: 'educational', category: 'community', type: 'category', color: '#3a3a1d', icon: 'fa-graduation-cap' }
];

export class TagManager {
  private tags: Map<string, Tag> = new Map();
  private entityTags: Map<string, TaggedEntity> = new Map();
  private tagAnalytics: Map<string, TagAnalytics> = new Map();

  constructor() {
    this.initializeSystemTags();
  }

  private initializeSystemTags(): void {
    SYSTEM_TAGS.forEach((tag, index) => {
      const fullTag: Tag = {
        id: `tag_${tag.slug}`,
        name: tag.name!,
        slug: tag.slug!,
        category: tag.category!,
        type: tag.type!,
        color: tag.color!,
        icon: tag.icon,
        count: 0,
        priority: tag.priority,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.tags.set(fullTag.id, fullTag);
    });
  }

  // Tag CRUD Operations
  createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'count'>): Tag {
    const newTag: Tag = {
      ...tag,
      id: `tag_${tag.slug}`,
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tags.set(newTag.id, newTag);
    return newTag;
  }

  getTag(tagId: string): Tag | undefined {
    return this.tags.get(tagId);
  }

  getTagBySlug(slug: string): Tag | undefined {
    return Array.from(this.tags.values()).find(tag => tag.slug === slug);
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  getTagsByCategory(category: TagCategory): Tag[] {
    return Array.from(this.tags.values()).filter(tag => tag.category === category);
  }

  updateTag(tagId: string, updates: Partial<Tag>): Tag | undefined {
    const tag = this.tags.get(tagId);
    if (!tag) return undefined;

    const updatedTag = {
      ...tag,
      ...updates,
      updatedAt: new Date()
    };
    this.tags.set(tagId, updatedTag);
    return updatedTag;
  }

  deleteTag(tagId: string): boolean {
    return this.tags.delete(tagId);
  }

  // Entity Tagging Operations
  tagEntity(
    entityId: string, 
    entityType: TaggedEntity['entityType'], 
    tagIds: string[], 
    taggedBy?: string
  ): TaggedEntity {
    const entityKey = `${entityType}_${entityId}`;
    const existingEntity = this.entityTags.get(entityKey);

    const taggedEntity: TaggedEntity = {
      entityId,
      entityType,
      tags: [...new Set([...(existingEntity?.tags || []), ...tagIds])],
      taggedAt: new Date(),
      taggedBy
    };

    this.entityTags.set(entityKey, taggedEntity);
    
    // Update tag counts
    tagIds.forEach(tagId => {
      const tag = this.tags.get(tagId);
      if (tag) {
        tag.count++;
        this.tags.set(tagId, tag);
      }
    });

    return taggedEntity;
  }

  untagEntity(
    entityId: string, 
    entityType: TaggedEntity['entityType'], 
    tagIds: string[]
  ): TaggedEntity | undefined {
    const entityKey = `${entityType}_${entityId}`;
    const entity = this.entityTags.get(entityKey);
    if (!entity) return undefined;

    entity.tags = entity.tags.filter(tag => !tagIds.includes(tag));
    this.entityTags.set(entityKey, entity);

    // Update tag counts
    tagIds.forEach(tagId => {
      const tag = this.tags.get(tagId);
      if (tag && tag.count > 0) {
        tag.count--;
        this.tags.set(tagId, tag);
      }
    });

    return entity;
  }

  getEntityTags(entityId: string, entityType: TaggedEntity['entityType']): string[] {
    const entityKey = `${entityType}_${entityId}`;
    return this.entityTags.get(entityKey)?.tags || [];
  }

  getEntitiesByTag(tagId: string): TaggedEntity[] {
    return Array.from(this.entityTags.values()).filter(
      entity => entity.tags.includes(tagId)
    );
  }

  // Smart Tag Suggestions
  suggestTags(
    entityType: TaggedEntity['entityType'], 
    context: Record<string, any>
  ): Tag[] {
    const suggestions: Tag[] = [];
    const relevantTags = this.getTagsByCategory(entityType as TagCategory);

    relevantTags.forEach(tag => {
      if (tag.autoApply) {
        const shouldApply = tag.autoApply.some(rule => {
          const value = context[rule.field];
          switch (rule.operator) {
            case 'equals':
              return value === rule.value;
            case 'contains':
              return String(value).includes(rule.value);
            case 'greater':
              return Number(value) > Number(rule.value);
            case 'less':
              return Number(value) < Number(rule.value);
            case 'regex':
              return new RegExp(rule.value).test(String(value));
            default:
              return false;
          }
        });
        
        if (shouldApply) {
          suggestions.push(tag);
        }
      }
    });

    // Sort by priority and usage count
    return suggestions.sort((a, b) => {
      if (a.priority && b.priority) return a.priority - b.priority;
      return b.count - a.count;
    });
  }

  // Tag Analytics
  getTagAnalytics(tagId: string): TagAnalytics | undefined {
    return this.tagAnalytics.get(tagId);
  }

  updateTagAnalytics(tagId: string, analytics: Partial<TagAnalytics>): void {
    const existing = this.tagAnalytics.get(tagId) || {
      tagId,
      usageCount: 0,
      trendingScore: 0,
      associatedTags: []
    };

    this.tagAnalytics.set(tagId, { ...existing, ...analytics });
  }

  getTrendingTags(category?: TagCategory, limit: number = 10): Tag[] {
    let tags = category 
      ? this.getTagsByCategory(category)
      : this.getAllTags();

    return tags
      .map(tag => ({
        tag,
        analytics: this.getTagAnalytics(tag.id)
      }))
      .sort((a, b) => {
        const scoreA = a.analytics?.trendingScore || 0;
        const scoreB = b.analytics?.trendingScore || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(item => item.tag);
  }

  // Tag Relationships
  findRelatedTags(tagId: string, limit: number = 5): Tag[] {
    const analytics = this.getTagAnalytics(tagId);
    if (!analytics || !analytics.associatedTags.length) return [];

    return analytics.associatedTags
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, limit)
      .map(assoc => this.getTag(assoc.tagId))
      .filter(tag => tag !== undefined) as Tag[];
  }

  // Bulk Operations
  bulkTagEntities(
    entities: { entityId: string; entityType: TaggedEntity['entityType'] }[],
    tagIds: string[],
    taggedBy?: string
  ): void {
    entities.forEach(({ entityId, entityType }) => {
      this.tagEntity(entityId, entityType, tagIds, taggedBy);
    });
  }

  // Search and Filter
  searchTags(query: string): Tag[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTags().filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery) ||
      tag.slug.includes(lowerQuery) ||
      tag.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Export for persistence
  exportTags(): { tags: Tag[]; entityTags: TaggedEntity[] } {
    return {
      tags: this.getAllTags(),
      entityTags: Array.from(this.entityTags.values())
    };
  }

  // Import from persistence
  importTags(data: { tags: Tag[]; entityTags: TaggedEntity[] }): void {
    data.tags.forEach(tag => this.tags.set(tag.id, tag));
    data.entityTags.forEach(entity => {
      const key = `${entity.entityType}_${entity.entityId}`;
      this.entityTags.set(key, entity);
    });
  }
}

// Singleton instance
export const tagManager = new TagManager();