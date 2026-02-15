# Client Requirements - KFAR Marketplace
## From שלוות גן עדן (Shalvat Gan Eden) - 2026-02-15

### Payment
- **Cash on Delivery (COD) is the PRIMARY payment method**
- YPAY credit card is secondary/optional
- Braysheet (community currency) also supported

### Checkout Process
- **Minimal checkout: Full Name + Phone Number only**
- No email required at checkout
- No complex address forms (community-based delivery/pickup)

### Bundles
- **Admin acts as the vendor for all bundles**
- No need to coordinate with or notify individual vendors for bundle orders
- Admin creates bundles, admin fulfills them
- Bundle items are treated as a single "admin" order

### POS (Point of Sale)
- **KFAR works as a POS system for vendors**
- In-store sales processed through the vendor dashboard
- Vendor selects items, enters customer name + phone, processes as cash
- All sales (in-store + online) tracked through the same system
- Revenue and inventory unified across all channels
- Existing page: /vendor/pos

### Implications for Code
- Checkout page: COD as default selected payment, simple form (name + phone)
- Orders table: payment_method default = 'cash_on_delivery', payment_status = 'pending'
- Bundle orders: vendor_id = 'admin' or null, no vendor notification for bundles
- YPAY still available but shown as "Pay with Credit Card" secondary option
