-- KFAR Marketplace Production Migration 001
-- Date: 2026-02-15
-- Purpose: Add auth, payments, email, CRM, notifications tables

BEGIN;

-- ============================================================
-- 1. USERS TABLE (unified auth for admin/vendor/customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
  vendor_id VARCHAR(50) REFERENCES vendors(id),
  customer_id UUID REFERENCES customers(id),
  display_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_vendor_id ON users(vendor_id);
CREATE INDEX idx_users_customer_id ON users(customer_id);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. USER SESSIONS (JWT refresh tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================================
-- 3. ALTER CUSTOMERS - add CRM fields
-- ============================================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ============================================================
-- 4. ALTER ORDERS - add payment transaction ref
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_transaction_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- ============================================================
-- 5. PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  payment_method VARCHAR(50) NOT NULL, -- 'ypay_credit', 'braysheet', 'bank_transfer'
  provider VARCHAR(50) NOT NULL, -- 'ypay', 'manual', 'braysheet'
  provider_transaction_id VARCHAR(255),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  installments INTEGER DEFAULT 1,
  provider_response JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider_tx ON payment_transactions(provider_transaction_id);

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK from orders to payment_transactions
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_payment_transaction
  FOREIGN KEY (payment_transaction_id)
  REFERENCES payment_transactions(id);

-- ============================================================
-- 6. REWARDS POINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS rewards_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_redeemed INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id)
);

CREATE TRIGGER update_rewards_points_updated_at
  BEFORE UPDATE ON rewards_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. POINTS TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  amount INTEGER NOT NULL, -- positive for earned, negative for redeemed
  balance_after INTEGER NOT NULL,
  description TEXT,
  order_id UUID REFERENCES orders(id),
  coupon_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_points_transactions_customer ON points_transactions(customer_id);
CREATE INDEX idx_points_transactions_type ON points_transactions(type);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'order_update', 'promotion', 'points', 'system'
  channel VARCHAR(20) NOT NULL DEFAULT 'in_app', -- 'in_app', 'email', 'whatsapp'
  title VARCHAR(255) NOT NULL,
  title_he VARCHAR(255),
  message TEXT NOT NULL,
  message_he TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================================
-- 9. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  promotion_id VARCHAR(50) REFERENCES promotions(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  vendor_id VARCHAR(50) REFERENCES vendors(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_promotion ON coupons(promotion_id);

-- ============================================================
-- 10. EMAIL TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject_en VARCHAR(255) NOT NULL,
  subject_he VARCHAR(255),
  body_en TEXT NOT NULL,
  body_he TEXT,
  variables TEXT[] DEFAULT '{}', -- list of variable names used in template
  category VARCHAR(50) DEFAULT 'transactional', -- transactional, marketing, system
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 11. EMAIL LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES email_templates(id),
  template_name VARCHAR(100),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- queued, sent, delivered, failed, bounced
  error_message TEXT,
  variables JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_log_recipient ON email_log(recipient_email);
CREATE INDEX idx_email_log_status ON email_log(status);
CREATE INDEX idx_email_log_template ON email_log(template_name);

-- ============================================================
-- 12. CRM ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'order_placed', 'login', 'review', 'support', 'note', 'tag_added', 'tier_change'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  performed_by UUID REFERENCES users(id), -- null for system actions
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crm_activity_customer ON crm_activity_log(customer_id);
CREATE INDEX idx_crm_activity_type ON crm_activity_log(activity_type);
CREATE INDEX idx_crm_activity_created ON crm_activity_log(created_at);

-- ============================================================
-- 13. CUSTOMER SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_he VARCHAR(100),
  description TEXT,
  type VARCHAR(20) DEFAULT 'manual' CHECK (type IN ('manual', 'auto')),
  rules JSONB DEFAULT '{}', -- auto-segment rules: {"min_orders": 5, "min_spent": 500}
  customer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customer_segments_updated_at
  BEFORE UPDATE ON customer_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Junction table for manual segments
CREATE TABLE IF NOT EXISTS customer_segment_members (
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (segment_id, customer_id)
);

-- ============================================================
-- 14. STORE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS store_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 15. ALTER PROMOTIONS - add coupon/conditions support
-- ============================================================
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_uses INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

-- ============================================================
-- SEED: Admin User (password: KfarAdmin2025!)
-- bcrypt hash for KfarAdmin2025!
-- ============================================================
INSERT INTO users (email, password_hash, role, display_name, is_active)
VALUES (
  'admin@kfarapp.com',
  '$2b$10$Gjb7idw9RkfbNOfM3VVh8ebU2WV3B0HUqp0FXScgwEIALeZ6jr1ha',
  'admin',
  'KFAR Admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: Vendor Users
-- password for all vendors: KfarVendor2025!
-- ============================================================
INSERT INTO users (email, password_hash, role, vendor_id, display_name, is_active)
VALUES
  ('teva@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'teva-deli', 'Teva Deli', true),
  ('queens@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'queens-cuisine', 'Queens Cuisine', true),
  ('people@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'people-store', 'People Store', true),
  ('garden@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'garden-of-light', 'Garden of Light', true),
  ('gahn@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'gahn-delight', 'Gahn Delight', true),
  ('vop@kfarapp.com', '$2b$10$Rj9cvQ5GHSxM4W2f1PNYK.eUYli/kw/eiTGCG9QiI.bZrPAl6eOaC', 'vendor', 'vop-shop', 'VOP Shop', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: Email Templates (EN + HE)
-- ============================================================
INSERT INTO email_templates (name, subject_en, subject_he, body_en, body_he, variables, category) VALUES

('order_confirmation',
 'Order Confirmed - #{{order_number}}',
 'הזמנה אושרה - #{{order_number}}',
 '<h2>Thank you for your order, {{customer_name}}!</h2><p>Your order <strong>#{{order_number}}</strong> has been confirmed.</p><h3>Order Details</h3>{{items_html}}<p><strong>Total: {{currency}}{{total}}</strong></p><p>We will notify you when your order is ready.</p><p>Shalom,<br>KFAR Marketplace</p>',
 '<h2 dir="rtl">תודה על ההזמנה, {{customer_name}}!</h2><p dir="rtl">הזמנתך <strong>#{{order_number}}</strong> אושרה.</p><h3 dir="rtl">פרטי הזמנה</h3>{{items_html}}<p dir="rtl"><strong>סה"כ: {{currency}}{{total}}</strong></p><p dir="rtl">נעדכן אותך כשההזמנה מוכנה.</p><p dir="rtl">שלום,<br>שוק כפר</p>',
 '{"customer_name","order_number","items_html","total","currency"}',
 'transactional'),

('order_status_update',
 'Order Update - #{{order_number}} is {{status}}',
 'עדכון הזמנה - #{{order_number}} {{status_he}}',
 '<h2>Hi {{customer_name}},</h2><p>Your order <strong>#{{order_number}}</strong> status has been updated to: <strong>{{status}}</strong></p>{{status_message}}<p>Shalom,<br>KFAR Marketplace</p>',
 '<h2 dir="rtl">שלום {{customer_name}},</h2><p dir="rtl">סטטוס ההזמנה <strong>#{{order_number}}</strong> עודכן ל: <strong>{{status_he}}</strong></p>{{status_message_he}}<p dir="rtl">שלום,<br>שוק כפר</p>',
 '{"customer_name","order_number","status","status_he","status_message","status_message_he"}',
 'transactional'),

('vendor_new_order',
 'New Order Received - #{{order_number}}',
 'הזמנה חדשה התקבלה - #{{order_number}}',
 '<h2>New order for {{vendor_name}}!</h2><p>Order <strong>#{{order_number}}</strong> has been placed.</p><h3>Items</h3>{{items_html}}<p><strong>Total: {{currency}}{{total}}</strong></p><p>Please review and accept this order in your <a href="{{dashboard_url}}">vendor dashboard</a>.</p>',
 '<h2 dir="rtl">הזמנה חדשה עבור {{vendor_name}}!</h2><p dir="rtl">הזמנה <strong>#{{order_number}}</strong> התקבלה.</p><h3 dir="rtl">פריטים</h3>{{items_html}}<p dir="rtl"><strong>סה"כ: {{currency}}{{total}}</strong></p><p dir="rtl">אנא בדוק ואשר את ההזמנה ב<a href="{{dashboard_url}}">לוח הבקרה</a>.</p>',
 '{"vendor_name","order_number","items_html","total","currency","dashboard_url"}',
 'transactional'),

('welcome_customer',
 'Welcome to KFAR Marketplace!',
 'ברוכים הבאים לשוק כפר!',
 '<h2>Welcome {{customer_name}}!</h2><p>Thank you for joining the KFAR Marketplace community.</p><p>You have earned <strong>{{points_earned}} points</strong> as a welcome bonus!</p><p>Start shopping from our amazing community vendors.</p><p>Shalom,<br>KFAR Marketplace</p>',
 '<h2 dir="rtl">ברוכים הבאים {{customer_name}}!</h2><p dir="rtl">תודה שהצטרפת לקהילת שוק כפר.</p><p dir="rtl">קיבלת <strong>{{points_earned}} נקודות</strong> כבונוס הצטרפות!</p><p dir="rtl">התחל לקנות מהספקים המדהימים שלנו.</p><p dir="rtl">שלום,<br>שוק כפר</p>',
 '{"customer_name","points_earned"}',
 'transactional'),

('welcome_vendor',
 'Welcome to KFAR Marketplace - Vendor Account',
 'ברוכים הבאים לשוק כפר - חשבון ספק',
 '<h2>Welcome {{vendor_name}}!</h2><p>Your vendor account is ready. Access your dashboard at:</p><p><a href="{{dashboard_url}}">{{dashboard_url}}</a></p><p>From your dashboard you can manage products, view orders, and track analytics.</p><p>Shalom,<br>KFAR Marketplace Team</p>',
 '<h2 dir="rtl">ברוכים הבאים {{vendor_name}}!</h2><p dir="rtl">חשבון הספק שלך מוכן. גש ללוח הבקרה:</p><p><a href="{{dashboard_url}}">{{dashboard_url}}</a></p><p dir="rtl">מלוח הבקרה תוכל לנהל מוצרים, לצפות בהזמנות ולעקוב אחר נתונים.</p><p dir="rtl">שלום,<br>צוות שוק כפר</p>',
 '{"vendor_name","dashboard_url"}',
 'transactional'),

('password_reset',
 'Reset Your Password - KFAR Marketplace',
 'איפוס סיסמה - שוק כפר',
 '<h2>Password Reset Request</h2><p>Click the link below to reset your password:</p><p><a href="{{reset_url}}">Reset Password</a></p><p>This link expires in {{expiry_time}}.</p><p>If you did not request this, please ignore this email.</p>',
 '<h2 dir="rtl">בקשת איפוס סיסמה</h2><p dir="rtl">לחץ על הקישור לאיפוס הסיסמה:</p><p><a href="{{reset_url}}">איפוס סיסמה</a></p><p dir="rtl">הקישור תקף ל-{{expiry_time}}.</p><p dir="rtl">אם לא ביקשת זאת, התעלם מהודעה זו.</p>',
 '{"reset_url","expiry_time"}',
 'system'),

('points_earned',
 'You earned {{points}} points!',
 'צברת {{points}} נקודות!',
 '<h2>Congratulations {{customer_name}}!</h2><p>You have earned <strong>{{points}} points</strong> from your recent purchase.</p><p>Your current balance: <strong>{{balance}} points</strong></p><p>Keep shopping to earn more rewards!</p>',
 '<h2 dir="rtl">מזל טוב {{customer_name}}!</h2><p dir="rtl">צברת <strong>{{points}} נקודות</strong> מהרכישה האחרונה.</p><p dir="rtl">היתרה שלך: <strong>{{balance}} נקודות</strong></p><p dir="rtl">המשך לקנות וצבור עוד פרסים!</p>',
 '{"customer_name","points","balance"}',
 'transactional'),

('tier_upgrade',
 'Congratulations! You reached {{new_tier}} tier!',
 'מזל טוב! הגעת לדרגת {{new_tier}}!',
 '<h2>Level Up, {{customer_name}}!</h2><p>You have been upgraded to <strong>{{new_tier}}</strong> tier!</p><p>Enjoy your new benefits and keep shopping with KFAR.</p>',
 '<h2 dir="rtl">עליית דרגה, {{customer_name}}!</h2><p dir="rtl">שודרגת לדרגת <strong>{{new_tier}}</strong>!</p><p dir="rtl">תהנה מההטבות החדשות והמשך לקנות בשוק כפר.</p>',
 '{"customer_name","new_tier"}',
 'transactional'),

('promotion_alert',
 '{{promotion_title}} - Special Offer!',
 '{{promotion_title}} - מבצע מיוחד!',
 '<h2>Hi {{customer_name}},</h2><p>We have a special offer for you:</p><h3>{{promotion_title}}</h3><p>{{promotion_description}}</p><p>Use code: <strong>{{coupon_code}}</strong> for {{discount}} off!</p><p>Valid until {{valid_until}}.</p>',
 '<h2 dir="rtl">שלום {{customer_name}},</h2><p dir="rtl">יש לנו מבצע מיוחד עבורך:</p><h3 dir="rtl">{{promotion_title}}</h3><p dir="rtl">{{promotion_description}}</p><p dir="rtl">השתמש בקוד: <strong>{{coupon_code}}</strong> לקבלת {{discount}} הנחה!</p><p dir="rtl">בתוקף עד {{valid_until}}.</p>',
 '{"customer_name","promotion_title","promotion_description","coupon_code","discount","valid_until"}',
 'marketing'),

('qr_loyalty_card',
 'Your KFAR Loyalty Card',
 'כרטיס הנאמנות שלך בשוק כפר',
 '<h2>Hi {{customer_name}},</h2><p>Here is your digital loyalty card:</p><div style="text-align:center;padding:20px;"><img src="{{qr_code_url}}" alt="Loyalty QR" style="width:200px;height:200px;"/></div><p><strong>Points:</strong> {{points}}<br><strong>Tier:</strong> {{tier}}</p><p>Show this QR code when shopping at KFAR for instant rewards.</p>',
 '<h2 dir="rtl">שלום {{customer_name}},</h2><p dir="rtl">הנה כרטיס הנאמנות הדיגיטלי שלך:</p><div style="text-align:center;padding:20px;"><img src="{{qr_code_url}}" alt="QR נאמנות" style="width:200px;height:200px;"/></div><p dir="rtl"><strong>נקודות:</strong> {{points}}<br><strong>דרגה:</strong> {{tier}}</p><p dir="rtl">הצג את קוד ה-QR בעת קניה בשוק כפר לקבלת פרסים.</p>',
 '{"customer_name","qr_code_url","points","tier"}',
 'transactional')

ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Default store settings
-- ============================================================
INSERT INTO store_settings (key, value, description) VALUES
  ('store_name', '"KFAR Marketplace"', 'Store display name'),
  ('store_name_he', '"שוק כפר"', 'Store name in Hebrew'),
  ('currency', '"ILS"', 'Default currency'),
  ('currency_symbol', '"₪"', 'Currency symbol'),
  ('points_per_ils', '1', 'Points earned per ILS spent'),
  ('welcome_bonus_points', '50', 'Points given on registration'),
  ('bronze_threshold', '0', 'Points for Bronze tier'),
  ('silver_threshold', '500', 'Points for Silver tier'),
  ('gold_threshold', '2000', 'Points for Gold tier'),
  ('platinum_threshold', '5000', 'Points for Platinum tier'),
  ('payment_methods', '["ypay_credit","braysheet","bank_transfer"]', 'Enabled payment methods'),
  ('ypay_sandbox', 'true', 'YPAY sandbox mode'),
  ('email_from_address', '"noreply@kfarapp.com"', 'Email sender address'),
  ('email_from_name', '"KFAR Marketplace"', 'Email sender name'),
  ('whatsapp_enabled', 'true', 'WhatsApp notifications enabled'),
  ('store_address', '"Village of Peace, Dimona, Israel"', 'Physical store address')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED: Default customer segments
-- ============================================================
INSERT INTO customer_segments (name, name_he, description, type, rules) VALUES
  ('New Customers', 'לקוחות חדשים', 'Registered in last 30 days', 'auto', '{"registered_days_ago_max": 30}'),
  ('Active Shoppers', 'קונים פעילים', '3+ orders in last 60 days', 'auto', '{"min_orders_last_60_days": 3}'),
  ('High Value', 'ערך גבוה', 'Total spent over 2000 ILS', 'auto', '{"min_total_spent": 2000}'),
  ('At Risk', 'בסיכון', 'No order in last 60 days but has prior orders', 'auto', '{"no_order_days": 60, "min_lifetime_orders": 1}'),
  ('VIP', 'VIP', 'Manually tagged VIP customers', 'manual', '{}')
ON CONFLICT DO NOTHING;

COMMIT;
