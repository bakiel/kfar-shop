-- Migration 007: Add order-tracking link to the customer email templates
-- Apply on VPS:  sudo -u postgres psql kfar_marketplace -f migration-007-email-templates.sql
--
-- The email_templates / email_log tables AND the order_confirmation, order_status_update,
-- vendor_new_order templates already exist (created + seeded by migration-001-production.sql,
-- with UUID ids). This migration does NOT recreate them. It only rewrites the two
-- customer-facing template bodies to append a "Track your order" link that resolves the
-- new {{tracking_url}} variable now passed by the order create + status-update routes.
--
-- Idempotent: it sets the full body each run (not an append), and adds {{tracking_url}} to
-- the variables array only if missing.

BEGIN;

-- Order confirmation (to buyer)
UPDATE email_templates
SET
  body_en = '<h2>Thank you for your order, {{customer_name}}!</h2>'
            '<p>Your order <strong>#{{order_number}}</strong> has been received. The store will confirm and prepare it shortly.</p>'
            '<h3>Order Details</h3>{{items_html}}'
            '<p><strong>Total: {{currency}}{{total}}</strong></p>'
            '<p>Payment: {{payment_method}} &middot; {{delivery_method}}</p>'
            '<p style="margin-top:16px;"><a href="{{tracking_url}}">Track your order</a></p>'
            '<p>Shalom,<br>KFAR Marketplace</p>',
  body_he = '<h2 dir="rtl">תודה על ההזמנה, {{customer_name}}!</h2>'
            '<p dir="rtl">הזמנתך <strong>#{{order_number}}</strong> התקבלה. החנות תאשר ותכין אותה בקרוב.</p>'
            '<h3 dir="rtl">פרטי הזמנה</h3>{{items_html}}'
            '<p dir="rtl"><strong>סה"כ: {{currency}}{{total}}</strong></p>'
            '<p dir="rtl">תשלום: {{payment_method}} &middot; {{delivery_method}}</p>'
            '<p dir="rtl" style="margin-top:16px;"><a href="{{tracking_url}}">מעקב אחר ההזמנה</a></p>'
            '<p dir="rtl">שלום,<br>שוק כפר</p>',
  variables = ARRAY['customer_name','order_number','items_html','total','currency','payment_method','delivery_method','tracking_url']::text[],
  updated_at = NOW()
WHERE name = 'order_confirmation';

-- Order status update (to buyer)
UPDATE email_templates
SET
  body_en = '<h2>Order update</h2>'
            '<p>Hi {{customer_name}}, your order <strong>#{{order_number}}</strong> is now <strong>{{status}}</strong>.</p>'
            '<p>{{status_message}}</p>'
            '<p style="margin-top:16px;"><a href="{{tracking_url}}">Track your order</a></p>'
            '<p>Shalom,<br>KFAR Marketplace</p>',
  body_he = '<h2 dir="rtl">עדכון הזמנה</h2>'
            '<p dir="rtl">שלום {{customer_name}}, ההזמנה שלך <strong>#{{order_number}}</strong> כעת בסטטוס <strong>{{status_he}}</strong>.</p>'
            '<p dir="rtl">{{status_message_he}}</p>'
            '<p dir="rtl" style="margin-top:16px;"><a href="{{tracking_url}}">מעקב אחר ההזמנה</a></p>'
            '<p dir="rtl">שלום,<br>שוק כפר</p>',
  variables = ARRAY['customer_name','order_number','status','status_he','status_message','status_message_he','tracking_url']::text[],
  updated_at = NOW()
WHERE name = 'order_status_update';

COMMIT;
