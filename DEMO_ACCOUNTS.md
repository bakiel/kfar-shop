# KFAR Demo Accounts & Testing Guide

## Demo Login Credentials

### Admin Account
- **Email**: `admin@kfar.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard, analytics, settings

### Vendor Account  
- **Email**: `vendor@tevadeli.com`
- **Password**: `vendor123`
- **Access**: Vendor dashboard, order management, product analytics

### Customer Account
- **Email**: Any email address (e.g., `test@example.com`)
- **Password**: Any password
- **Access**: Customer dashboard, order history, shopping

## Testing Flows

### 1. Customer Experience
1. Visit http://localhost:3000/marketplace
2. Add items to cart from different vendors
3. Go to checkout (/checkout)
4. Fill customer details and complete order
5. View generated invoice 
6. Login with customer credentials
7. Check order history at /customer/dashboard

### 2. Vendor Experience  
1. Login at /customer/login with vendor credentials
2. Visit /vendor/dashboard
3. Check order management at /vendor/orders
4. View customer orders and invoices
5. Test vendor onboarding flow

### 3. Admin Experience
1. Login with admin credentials  
2. Access admin dashboard
3. View all orders and analytics
4. Manage vendor approvals

## Key Features to Test
- ✅ Order creation and database saving
- ✅ Invoice generation with html2pdf.js
- ✅ Invoice-order linking in database  
- ✅ Hebrew/English language toggle
- ✅ Mobile responsive design
- ✅ WhatsApp notifications (basic)
- ✅ Multi-vendor marketplace
- ✅ Guest checkout flow

## Current Status
All core functionality is working. Ready for Vercel deployment!