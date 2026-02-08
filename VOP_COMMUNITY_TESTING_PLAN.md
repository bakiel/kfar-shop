# KFAR Marketplace - Village of Peace Community Testing Plan

## 🎯 Testing Objectives
Enable VOP community members to test core marketplace functionality and provide feedback before full launch.

## 📋 Current Status Assessment

### ✅ What's Ready for Testing
1. **Product Browsing**
   - 6 active vendors with 106 products
   - Hebrew/English translation toggle
   - Search and filtering
   - Mobile responsive design

2. **Shopping Cart**
   - Add/remove items
   - Quantity adjustments
   - Cart persistence

3. **Basic Checkout Flow**
   - Guest checkout option
   - VOP member discount (10%)
   - Multiple delivery options
   - Form validation

4. **Vendor Features**
   - Vendor dashboard
   - Order management
   - Basic WhatsApp notifications

### 🚧 What Needs Implementation Before Testing

#### Priority 1: Invoice Generation with QR Codes
**Status**: Backend exists but needs frontend integration
**Required Actions**:
1. Add "Download Invoice" button to order confirmation
2. Generate PDF with order details and QR code for payment
3. Include vendor contact details
4. Support Hebrew/English based on user preference

#### Priority 2: Payment Processing
**Current State**: Mock payments only
**Required Actions**:
1. Integrate Israeli payment gateway (Tranzila/PayMe/Meshulam)
2. Set up Braysheet token system
3. Bank transfer instructions with unique reference
4. QR code payment validation

#### Priority 3: Customer Onboarding
**Required Actions**:
1. Simple registration flow
2. Phone number verification
3. Address save/management
4. VOP member verification

#### Priority 4: Vendor Onboarding
**Required Actions**:
1. Vendor application form
2. Product upload interface
3. Inventory management
4. Order fulfillment workflow

## 🧪 Testing Scenarios

### Scenario 1: First-Time Customer Purchase
**Test User**: Community member (non-tech savvy)
**Steps**:
1. Browse marketplace
2. Switch language to Hebrew
3. Search for specific product
4. Add to cart
5. Complete guest checkout
6. Choose pickup option
7. Download invoice PDF
8. Verify QR code works

**Success Criteria**:
- Complete purchase in under 5 minutes
- All text properly translated
- Invoice generated with correct details
- Clear next steps for payment

### Scenario 2: VOP Member Purchase with Discount
**Test User**: Verified VOP member
**Steps**:
1. Login with member account
2. Add multiple items from different vendors
3. Apply VOP discount (automatic)
4. Choose local delivery
5. Pay with Braysheet tokens
6. Track order status

**Success Criteria**:
- 10% discount applied automatically
- Braysheet balance updated
- Vendors receive notifications
- Order tracking works

### Scenario 3: Vendor Order Management
**Test User**: Existing vendor (e.g., People Store)
**Steps**:
1. Login to vendor dashboard
2. View new orders
3. Update order status
4. Print packing slip
5. Mark as ready for pickup
6. Customer receives notification

**Success Criteria**:
- Real-time order updates
- WhatsApp notification sent
- Clear order details
- Easy status management

## 📱 Test Accounts Setup

### Customer Test Accounts
```
1. Guest User (no account needed)
2. VOP Member:
   - Email: member@vop.test
   - Phone: 052-1234567
   - Gets 10% discount
3. Regular Customer:
   - Email: customer@test.com
   - Phone: 054-7654321
```

### Vendor Test Accounts
```
1. People Store:
   - Email: people@vop.test
   - Access: Full vendor dashboard
2. Print Tribe:
   - Email: print@vop.test
   - Access: Full vendor dashboard
```

## 🔧 Quick Implementation Tasks

### Task 1: Add Invoice Generation API Endpoint
```javascript
// /app/api/invoice/route.ts
export async function POST(request: Request) {
  const orderData = await request.json();
  const invoice = await generateInvoice(orderData);
  return new Response(invoice.buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.filename}"`
    }
  });
}
```

### Task 2: Add Download Invoice Button
```tsx
// In order confirmation component
<button onClick={downloadInvoice} className="btn-primary">
  <i className="fas fa-download mr-2"></i>
  Download Invoice (PDF)
</button>
```

### Task 3: Simple Onboarding Form
```tsx
// /app/onboarding/customer/page.tsx
// /app/onboarding/vendor/page.tsx
```

## 📊 Testing Metrics to Track

1. **Conversion Rate**: Browse → Cart → Checkout → Complete
2. **Average Time to Complete Purchase**: Target < 5 minutes
3. **Error Rate**: Form validation, payment failures
4. **Language Toggle Usage**: Hebrew vs English preference
5. **Device Distribution**: Mobile vs Desktop
6. **Vendor Response Time**: Order acknowledgment speed

## 🗓️ Testing Timeline

### Week 1: Internal Testing
- Development team tests all flows
- Fix critical bugs
- Prepare test accounts

### Week 2: Alpha Testing (5-10 users)
- Selected VOP members
- Daily feedback sessions
- Rapid bug fixes

### Week 3: Beta Testing (20-30 users)
- Broader community testing
- Real vendor participation
- Performance monitoring

### Week 4: Pre-Launch
- Final fixes
- Documentation updates
- Vendor training

## 📝 Feedback Collection

### Methods:
1. **WhatsApp Group**: Immediate feedback channel
2. **Daily Survey**: Google Form with specific questions
3. **Screen Recording**: Loom videos of issues
4. **In-Person Sessions**: Weekly meetups at VOP

### Key Questions:
- How easy was it to find what you needed?
- Did the Hebrew translation work correctly?
- Was the checkout process clear?
- Any confusion points?
- What features are missing?

## 🚀 Launch Readiness Checklist

### Must Have (Before Testing):
- [ ] Invoice generation with QR codes
- [ ] Basic payment instructions
- [ ] Guest checkout working
- [ ] Hebrew/English toggle
- [ ] Mobile responsive
- [ ] WhatsApp notifications

### Should Have (Before Launch):
- [ ] Real payment gateway
- [ ] Customer accounts
- [ ] Order tracking
- [ ] Vendor inventory sync
- [ ] Email confirmations

### Nice to Have (Post-Launch):
- [ ] Loyalty program
- [ ] Advanced analytics
- [ ] AI recommendations
- [ ] Voice ordering

## 📞 Support During Testing

### Contact Points:
- **Technical Issues**: Alex (WhatsApp: +972-XX-XXXXXXX)
- **Vendor Questions**: Store owner direct contact
- **General Feedback**: feedback@kfar.market

### Common Issues & Solutions:
1. **Can't complete checkout**: Clear browser cache
2. **Translation missing**: Report specific text
3. **Payment confusion**: See payment guide
4. **Delivery questions**: Check FAQ section

## 🎁 Testing Incentives

- First 10 testers: 20% discount on first order
- Bug reporters: Braysheet token rewards
- Feedback providers: Entry to monthly raffle
- Video testimonials: Special VOP member benefits

---

## Next Immediate Actions

1. **Today**: 
   - Implement invoice download endpoint
   - Add download button to order confirmation
   - Test with sample order

2. **Tomorrow**:
   - Create test accounts
   - Set up WhatsApp feedback group
   - Prepare onboarding guide

3. **This Week**:
   - Complete payment instructions page
   - Add QR code to invoices
   - Deploy to staging for internal testing

## Contact for Implementation Help
- Review this plan with the team
- Prioritize based on community needs
- Start with simplest features first