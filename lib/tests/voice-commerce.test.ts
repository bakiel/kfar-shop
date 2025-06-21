// Comprehensive test suite for voice commerce

import { aiService } from '../services/ai-service';
import { commandValidator } from '../utils/command-validation';
import { performanceTracker } from '../utils/performance-tracker';
import { 
  levenshteinDistance, 
  stringSimilarity, 
  findBestMatch, 
  partialMatch,
  applyVoiceCorrections 
} from '../utils/string-matching';

describe('Voice Commerce Test Suite', () => {
  
  describe('String Matching Utilities', () => {
    test('Levenshtein distance calculation', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
      expect(levenshteinDistance('', 'abc')).toBe(3);
      expect(levenshteinDistance('abc', 'abc')).toBe(0);
    });
    
    test('String similarity score', () => {
      expect(stringSimilarity('hello', 'hello')).toBe(1);
      expect(stringSimilarity('hello', 'helo')).toBeCloseTo(0.8, 1);
      expect(stringSimilarity('hummus', 'humus')).toBeCloseTo(0.83, 2);
      expect(stringSimilarity('', '')).toBe(1);
    });
    
    test('Find best match from candidates', () => {
      const candidates = ['hummus', 'tahini', 'schnitzel', 'falafel'];
      
      const result1 = findBestMatch('humus', candidates);
      expect(result1.match).toBe('hummus');
      expect(result1.confidence).toBeGreaterThan(0.8);
      
      const result2 = findBestMatch('shnitzl', candidates);
      expect(result2.match).toBe('schnitzel');
      
      const result3 = findBestMatch('pizza', candidates, 0.8);
      expect(result3.match).toBeNull();
    });
    
    test('Partial match detection', () => {
      expect(partialMatch('ice cream', 'vanilla ice cream sundae')).toBe(true);
      expect(partialMatch('vegan burger', 'vegan seitan burger')).toBe(true);
      expect(partialMatch('pizza cheese', 'hummus and tahini')).toBe(false);
    });
    
    test('Voice corrections application', () => {
      expect(applyVoiceCorrections('satan schnitzel')).toBe('seitan schnitzel');
      expect(applyVoiceCorrections('homos and bread')).toBe('hummus and bread');
      expect(applyVoiceCorrections('gun delight ice cream')).toBe('gahn delight ice cream');
      expect(applyVoiceCorrections("people's store tahiny")).toBe('peoples store tahini');
    });
  });
  
  describe('AI Service', () => {
    test('Phonetic corrections', () => {
      const corrected1 = aiService.applyPhoneticCorrections('satan');
      expect(corrected1).toBe('seitan');
      
      const corrected2 = aiService.applyPhoneticCorrections('Show me satan schnitzel');
      expect(corrected2).toBe('show me seitan schnitzel');
      
      const corrected3 = aiService.applyPhoneticCorrections('gun delight');
      expect(corrected3).toBe('gahn delight');
    });
    
    test('JSON response cleaning', () => {
      // Test markdown removal
      const markdown = '```json\n{"intent": "search_product"}\n```';
      const cleaned = aiService['cleanJsonResponse'](markdown);
      expect(cleaned).toBe('{"intent": "search_product"}');
      
      // Test with language specifier
      const markdownWithLang = '```json\n{"test": true}\n```';
      const cleaned2 = aiService['cleanJsonResponse'](markdownWithLang);
      expect(cleaned2).toBe('{"test": true}');
      
      // Test without markdown
      const plain = '{"intent": "add_to_cart"}';
      const cleaned3 = aiService['cleanJsonResponse'](plain);
      expect(cleaned3).toBe('{"intent": "add_to_cart"}');
    });
    
    test('Enhanced basic parsing', () => {
      const greeting = aiService['enhancedBasicParse']('hello');
      expect(greeting.intent).toBe('greeting');
      expect(greeting.suggestedResponse).toContain('Hello');
      
      const vegan = aiService['enhancedBasicParse']('show me vegan options');
      expect(vegan.intent).toBe('search_product');
      expect(vegan.entities.dietary).toBe('vegan');
      
      const vendor = aiService['enhancedBasicParse']('show me teva deli');
      expect(vendor.intent).toBe('browse_vendor');
      expect(vendor.entities.vendor).toBe('teva-deli');
      
      const price = aiService['enhancedBasicParse']('something cheap');
      expect(price.intent).toBe('search_product');
      expect(price.entities.priceRange.max).toBe(30);
    });
    
    test('Conversation history management', () => {
      aiService.clearHistory();
      expect(aiService.getContext()).toHaveLength(0);
      
      // Would need to mock AI responses to test full conversation flow
    });
  });
  
  describe('Command Validator', () => {
    test('Add to cart validation', () => {
      // No product context
      const result1 = commandValidator.validateCommand({
        intent: 'add_to_cart',
        entities: {},
        cart: []
      });
      expect(result1.isValid).toBe(false);
      expect(result1.message).toContain('which product');
      
      // Valid with product
      const result2 = commandValidator.validateCommand({
        intent: 'add_to_cart',
        entities: { product: 'hummus' },
        cart: []
      });
      expect(result2.isValid).toBe(true);
      expect(result2.needsConfirmation).toBe(false);
      
      // Large quantity needs confirmation
      const result3 = commandValidator.validateCommand({
        intent: 'add_to_cart',
        entities: { product: 'hummus', quantity: 15 },
        cart: []
      });
      expect(result3.isValid).toBe(true);
      expect(result3.needsConfirmation).toBe(true);
      expect(result3.message).toContain('15 items');
    });
    
    test('Checkout validation', () => {
      // Empty cart
      const result1 = commandValidator.validateCommand({
        intent: 'checkout',
        entities: {},
        cart: []
      });
      expect(result1.isValid).toBe(false);
      expect(result1.message).toContain('cart is empty');
      
      // With items
      const result2 = commandValidator.validateCommand({
        intent: 'checkout',
        entities: {},
        cart: [{ id: '1', name: 'Hummus', price: 15, quantity: 2 }]
      });
      expect(result2.isValid).toBe(true);
      expect(result2.needsConfirmation).toBe(true);
      expect(result2.message).toContain('₪30');
    });
    
    test('Vendor browse validation', () => {
      // Valid vendor
      const result1 = commandValidator.validateCommand({
        intent: 'browse_vendor',
        entities: { vendor: 'teva-deli' },
        cart: []
      });
      expect(result1.isValid).toBe(true);
      
      // Invalid vendor
      const result2 = commandValidator.validateCommand({
        intent: 'browse_vendor',
        entities: { vendor: 'unknown-vendor' },
        cart: []
      });
      expect(result2.isValid).toBe(false);
      expect(result2.message).toContain('not familiar');
    });
    
    test('Affirmative/Negative response detection', () => {
      const affirmatives = ['yes', 'yeah', 'sure', 'ok', 'go ahead'];
      affirmatives.forEach(word => {
        expect(commandValidator.isAffirmativeResponse(word)).toBe(true);
      });
      
      const negatives = ['no', 'nope', 'cancel', 'stop', "don't"];
      negatives.forEach(word => {
        expect(commandValidator.isNegativeResponse(word)).toBe(true);
      });
      
      expect(commandValidator.isAffirmativeResponse('no')).toBe(false);
      expect(commandValidator.isNegativeResponse('yes')).toBe(false);
    });
  });
  
  describe('Performance Tracker', () => {
    beforeEach(() => {
      performanceTracker['allSessions'] = []; // Reset sessions
    });
    
    test('Session management', () => {
      const sessionId = performanceTracker.startSession();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      
      performanceTracker.endSession();
      expect(performanceTracker['currentSession']).toBeNull();
    });
    
    test('Timer functionality', () => {
      performanceTracker.startTimer('test');
      
      // Simulate some delay
      const start = Date.now();
      while (Date.now() - start < 50) {} // 50ms delay
      
      const duration = performanceTracker.endTimer('test');
      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(100);
    });
    
    test('Command tracking', () => {
      performanceTracker.startSession();
      
      performanceTracker.trackCommand(
        'show me hummus',
        'search_product',
        { product: 'hummus' },
        true,
        0.9
      );
      
      const session = performanceTracker['currentSession'];
      expect(session?.commands).toHaveLength(1);
      expect(session?.commands[0].intent).toBe('search_product');
      expect(session?.commands[0].confidence).toBe(0.9);
      
      performanceTracker.endSession();
    });
    
    test('Error tracking', () => {
      performanceTracker.startSession();
      
      performanceTracker.trackError('recognition', 'Speech not recognized', {
        noise: 'high'
      });
      
      const session = performanceTracker['currentSession'];
      expect(session?.errors).toHaveLength(1);
      expect(session?.errors[0].type).toBe('recognition');
      
      performanceTracker.endSession();
    });
    
    test('Metrics calculation', () => {
      // Create mock session data
      performanceTracker.startSession();
      
      // Track some commands
      performanceTracker.startTimer('total');
      performanceTracker.trackCommand('test', 'search_product', {}, true, 0.8);
      performanceTracker.endTimer('total');
      
      performanceTracker.updateCartValue(50);
      performanceTracker.endSession();
      
      const metrics = performanceTracker.getAggregateMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.commandsPerSession).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Integration Tests', () => {
    test('Full command flow simulation', async () => {
      // This would test the full flow from voice input to response
      // Would need to mock fetch calls and speech synthesis
      
      // Example structure:
      // 1. User says "show me vegan options"
      // 2. AI enhances to search_product with dietary: vegan
      // 3. Validation passes
      // 4. Product search executes
      // 5. Response is spoken
      // 6. Performance is tracked
      
      expect(true).toBe(true); // Placeholder
    });
    
    test('Confirmation flow', async () => {
      // Test the confirmation flow:
      // 1. User wants to checkout with large order
      // 2. System asks for confirmation
      // 3. User says "yes"
      // 4. Checkout proceeds
      
      expect(true).toBe(true); // Placeholder
    });
  });
});

// Export test utilities for use in other tests
export const testUtils = {
  mockProduct: (overrides = {}) => ({
    id: 'test-1',
    name: 'Test Product',
    price: 25,
    vendor: 'Test Vendor',
    vendorId: 'test-vendor',
    image: '/test.jpg',
    description: 'Test description',
    ...overrides
  }),
  
  mockCartItem: (overrides = {}) => ({
    id: 'cart-1',
    name: 'Cart Item',
    price: 30,
    quantity: 1,
    vendor: 'Test Vendor',
    vendorId: 'test-vendor',
    image: '/cart.jpg',
    ...overrides
  }),
  
  mockAIResponse: (overrides = {}) => ({
    intent: 'search_product',
    entities: {},
    enhancedQuery: 'test query',
    suggestedResponse: 'Test response',
    confidence: 0.8,
    ...overrides
  })
};