# Codex Handover — Kfar Platform Finalisation

**Date:** 2026-05-20
**Owner:** Bakiel (bakielisrael@gmail.com)
**Plan file:** `/Users/mac/.claude/plans/snoopy-scribbling-bengio.md`
**Project root:** `/Users/mac/Downloads/Claude_Tech_Lab/kfar-review`
**Production VPS:** `root@72.61.201.237` · `/opt/kfar` · PM2 `kfar` · `https://kfarapp.com`

---

## Goal

Get the Kfar platform to a launch-ready state where a real customer can place a Cash on Delivery order on mobile, the admin can manage it end-to-end, and every transactional email lands — without touching the payment gateway or WhatsApp (both still under client decision). After this handover, the only remaining work blocking public launch should be (1) selecting and integrating a payment gateway and (2) finalising the WhatsApp agent. Everything else — admin operations, bundle creation, mobile imagery, cash checkout, and email — must be production-quality.

## Mission

Finalise the Kfar platform from the 2026-05-11 tester report. Ship six fixes, verify email on the VPS, and run an end-to-end cash-on-delivery smoke test. **Do not finalise the payment gateway. Do not finalise WhatsApp.** Everything else, including cash checkout, must work.

---

## Scope IN — Ship all six

### 1. Admin order management — VIEW DETAILS button is dead

- File: `app/admin/orders/page.tsx:274`
- Bug: `{ label: t('View Details'), onClick: () => {} }`
- APIs are healthy: `app/api/admin/orders/route.ts` (GET, PATCH) and `app/api/orders/[id]/status/route.ts`.

Do:
- Create `app/admin/orders/[id]/page.tsx`. Render: order header (number, date, status badge), customer block, delivery address, items table with vendor split, totals, payment method, notes.
- Status-change control (PATCH `/api/orders/[id]/status` or `/api/admin/orders`).
- "Resend confirmation email" button calling existing `sendTransactional('order_confirmation', ...)`.
- Replace empty handler at line 274 with `router.push(\`/admin/orders/${order.id}\`)`.
- Add `/api/admin/orders/[id]/route.ts` if the existing GET cannot return a single order by id.

### 2. Bundle creation flow — simplify 9 → 4 fields

- File: `app/admin/bundles/page.tsx:370-453`

Keep on create (required): Name (English), Bundle Price, Original Price, Products (NEW searchable multi-picker, replaces the comma-separated text-area).

Move out of create modal:
- Hebrew name — default to English on create, editable later
- Description — collapse under "Advanced"
- Bundle image — default placeholder, upload on edit
- Status — default `active`
- "Promote on home page" — keep only as a row action; remove from create modal

Catalog checkbox (tester note): add a single clear `Show in catalog` toggle defaulting ON. Reuse `is_catalog` / `is_active` if present.

Product picker: debounced search input → results list → click to add chips. Use `/api/admin/products?search=` (add a minimal GET if missing). Persist as the existing `productIds` array.

### 3. Mobile broken images

Root cause: `lib/utils/image-resolver.ts:28-48` has only six hardcoded vendor mappings. Any DB row pointing outside that list 404s. `next.config.ts:18-22` already uses `unoptimized: true`, so this is path resolution, not Next.js.

Do, in order:
1. `scripts/build-image-manifest.ts` walks `public/images/**`, emits `lib/utils/image-manifest.json` mapping basename → real path. Wire into `prebuild` in `package.json`.
2. Upgrade `image-resolver.ts` to consume the manifest, fall back to a known placeholder, and `console.warn` misses in dev only.
3. Guarantee `/public/images/placeholder-product.jpg` exists (commit if missing).
4. Cleanup from existing `IMAGE_AUDIT.md`: remove Getty-watermarked `_22.jpg`, swap driver CTA `_12.jpg → _42.jpg`, delete documented duplicates (27.jpg, 26.jpg, 11.jpg, _04.jpg). Source: `IMAGE_AUDIT.md:104-145`.
5. `scripts/audit-images.ts` queries every product/vendor/bundle row, runs each `src` through the resolver, HEAD-checks against the running app, writes `project-reports/image-audit-<date>.csv`.

### 4. Checkout payment-method selector

- File: `app/checkout/page.tsx:18-55` and `:112`
- NEW: `components/checkout/PaymentMethodSelector.tsx`
- Server guard: `app/api/orders/create/route.ts:112`

Do:
- New `PaymentMethodSelector`: radio group, COD selected and enabled. Credit Card / Digital Wallet / Bank Transfer visible but disabled with "Coming Soon" badge + tooltip "Integration in progress".
- `useState('cash')`; pass selection in submit payload.
- Server guard at `route.ts:112`: if `paymentMethod !== 'cash'` return `400 { error: 'Only Cash on Delivery is enabled' }`. UI bypass is impossible.
- Update confirmation copy at lines 98 and 154-155 to use the selected method label.

### 5. Email system VPS verification (no code change unless dead)

Already wired: `lib/services/email/email-service.ts` → Nodemailer → local Postfix on the same VPS. Triggers exist for `order_confirmation`, `vendor_new_order`, `password_reset`. DKIM configured.

Run on VPS:
```bash
ssh root@72.61.201.237 << 'EOF'
systemctl status postfix --no-pager
pm2 logs kfar --lines 100 --nostream | grep -iE "mail|sendmail|email|smtp" | tail -50
sudo -u postgres psql kfar_marketplace -c "SELECT id, to_address, subject, status, created_at FROM email_log ORDER BY created_at DESC LIMIT 20;"
sudo -u postgres psql kfar_marketplace -c "SELECT id, name, is_active FROM email_templates ORDER BY name;"
postqueue -p
tail -n 50 /var/log/mail.log | grep -i kfarapp
EOF
```

Then live send:
```bash
ssh root@72.61.201.237 'cd /opt/kfar && node -e "
const { sendTransactional } = require(\"./lib/services/email/email-service\");
sendTransactional(\"admin@kfarapp.com\", \"order_confirmation\", {
  customer_name: \"VPS Check\", order_number: \"TEST-\" + Date.now(),
  items_html: \"<tr><td>Test</td></tr>\", total: \"0.00\",
  currency: \"ILS\", payment_method: \"Cash on Delivery\", delivery_method: \"Pickup\"
}, \"en\").then(r => console.log(\"OK\", r)).catch(e => console.error(\"FAIL\", e));
"'
```

Pass criteria: Postfix `active (running)`, recent rows in `email_log`, no deferred queue items, test send returns a `messageId`, `mail.log` shows `status=sent` for `kfarapp.com`.

### 6. End-to-end cash smoke test

1. Mobile: browse marketplace → add to cart → checkout → confirm COD default → submit → see confirmation.
2. Inbox: order confirmation arrives (customer + at least one vendor).
3. Admin: `/admin/orders` → click row → detail loads → status `pending` → `confirmed` persists → resend confirmation works.
4. Re-run image audit; zero misses on marketplace, category, product detail, customer orders.

---

## Scope OUT — do not touch

- Payment gateway integration (Stripe / Card / Wallet). UI shows them disabled only.
- WhatsApp agent or notifications.
- nginx, certbot, Postfix MTA config.
- Database migrations beyond what order-detail needs.
- Aleph mail VPS, JASPER, KH, ISH services on the shared host.

---

## Critical Files Map

```
kfar-review/
├── app/
│   ├── admin/
│   │   ├── orders/page.tsx                ← fix empty onClick line 274
│   │   ├── orders/[id]/page.tsx           ← NEW
│   │   └── bundles/page.tsx               ← simplify form lines 370-453
│   ├── api/
│   │   ├── admin/orders/route.ts          ← OK (GET/PATCH)
│   │   ├── admin/orders/[id]/route.ts     ← ADD if needed for detail GET
│   │   ├── orders/[id]/status/route.ts    ← OK
│   │   └── orders/create/route.ts         ← add COD-only guard line 112
│   ├── checkout/page.tsx                  ← add state, mount selector
│   └── customer/orders/...                ← OK (already works)
├── components/
│   ├── checkout/PaymentMethodSelector.tsx ← NEW
│   └── .../ProductImage.tsx               ← improve fallback + logging
├── lib/
│   ├── utils/image-resolver.ts            ← consume manifest
│   ├── utils/image-manifest.json          ← NEW (generated)
│   └── services/email/email-service.ts    ← read-only, verify only
├── scripts/
│   ├── build-image-manifest.ts            ← NEW
│   └── audit-images.ts                    ← NEW
├── public/images/placeholder-product.jpg  ← ensure exists
├── IMAGE_AUDIT.md                         ← source of cleanup list
├── ecosystem.config.js                    ← SMTP env (no change)
├── deploy.sh                              ← used to push to VPS
└── package.json                           ← add prebuild + audit scripts
```

---

## Working Rules

- Tests: this is a Next.js/TS project — `npx vitest run` after every change. Never claim manual-only.
- Make small commits, not one dump. After each fix bundle: build, vitest, commit.
- For multi-file refactors, after the patch lands run `/codex:review --background` for an independent second pass.
- Deploy via `./deploy.sh` once local tests pass.
- Do not bypass the payment guard. Do not enable other methods. Do not wire WhatsApp.

## Acceptance Criteria

- [ ] Admin clicks any order row → detail page loads with full data → status change persists.
- [ ] Bundle creation form has ≤ 4 visible required fields and a working product picker.
- [ ] No image 404 on the five most-trafficked pages; audit script clean.
- [ ] Checkout shows COD selected by default with a dropdown of other methods marked "Coming Soon"; only COD submits.
- [ ] Postfix running, `email_log` has fresh sent rows, live test email arrives, no deferred mail queue.
- [ ] End-to-end cash order flow completes from mobile to admin with confirmation emails delivered.
- [ ] Payment gateway code untouched. WhatsApp untouched.

## Deliverables

1. Single PR containing all changes.
2. PR body must include: tester report mapping (which item this fixes), e2e smoke test output, VPS email verification output (Postfix status, `email_log` sample, test send messageId, `mail.log` snippet).
3. Updated `CHANGELOG.md` entry for 2026-05-20.
4. Deployed to `https://kfarapp.com` and re-tested in production.

---

## Kickoff

```bash
cd /Users/mac/Downloads/Claude_Tech_Lab/kfar-review
codex --background "Finalise Kfar platform per handover/CODEX_HANDOVER_2026-05-20.md.
Implement all six scope-IN items. Do NOT touch payment gateway code or WhatsApp.
Run vitest after every change. Deploy via ./deploy.sh when local tests pass.
Open one PR with the e2e + email verification output in the body."
```
