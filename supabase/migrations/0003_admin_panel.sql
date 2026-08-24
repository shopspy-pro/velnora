-- Backs the admin panel (/admin) with real persistence: fixes the order
-- status enum to match what the admin UI expects, links reviews to the
-- order they verify, and adds the catalog/content/settings/auth tables the
-- admin panel's Product, Packages, FAQ, Content, Settings pages need.
--
-- Orders and reviews are intentionally NOT seeded with synthetic data here
-- — those tables start empty and only ever contain real customer activity.
-- Catalog/content/settings rows below mirror what is genuinely live on the
-- storefront today (src/features/product/data/product.ts), so the admin
-- panel starts in sync with reality rather than empty or fake.

-- ---------------------------------------------------------------- orders

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
update orders set status = 'new' where status = 'pending';
alter table orders alter column status set default 'new';

-- --------------------------------------------------------------- reviews

alter table reviews add column if not exists linked_order_number text;

-- -------------------------------------------------------------- products

create table if not exists products (
  id text primary key,
  name text not null,
  description text not null,
  base_price numeric(10, 2) not null,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  is_available boolean not null default true
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products (id) on delete cascade,
  url text not null,
  alt text not null,
  sort_order integer not null default 0
);

create index if not exists product_images_product_id_idx on product_images (product_id);

-- -------------------------------------------------------------- packages

create table if not exists packages (
  id text primary key,
  name text not null,
  units integer not null check (units > 0),
  patches_per_unit integer not null check (patches_per_unit > 0),
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2) not null,
  badge text,
  is_popular boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

-- ------------------------------------------------------------- faq_items

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true
);

-- ---------------------------------------------------- settings (generic)

-- One small key/value table backs both site_content (homepage copy) and
-- store_settings (store details + shipping/COD) — each is a single row
-- holding a JSON blob shaped exactly like the admin panel's SiteContent /
-- StoreSettings / ShippingSettings TypeScript types, so the data layer can
-- read/write the whole object at once rather than needing per-field columns.

create table if not exists site_content (
  key text primary key,
  value jsonb not null
);

create table if not exists store_settings (
  key text primary key,
  value jsonb not null
);

-- ----------------------------------------------------------- admin_users

-- Allowlist of Supabase Auth users permitted to sign in to /admin. A
-- successful Supabase Auth login is NOT sufficient on its own — the app
-- also checks membership here, so a stray auth signup can never self-grant
-- admin access.
create table if not exists admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------- RLS

alter table products enable row level security;
alter table product_images enable row level security;
alter table packages enable row level security;
alter table faq_items enable row level security;
alter table site_content enable row level security;
alter table store_settings enable row level security;
alter table admin_users enable row level security;

-- No public policies on any of the above: the admin panel reads/writes
-- exclusively through the service-role key on the server, same pattern as
-- orders/order_items/newsletter_subscribers. The storefront itself keeps
-- reading its static product/FAQ/content data as before (unchanged), so
-- these tables don't need anon read access.

-- ------------------------------------------------------------------ seed

insert into products (id, name, description, base_price, stock_status, is_available)
values (
  'flexi-knee-patches',
  'Flexi Knee Patches',
  'Self-adhesive far-infrared patches designed to bring soothing warmth and gentle support to tired, achy knees — so you can keep moving through your day.',
  129,
  'in_stock',
  true
)
on conflict (id) do nothing;

insert into product_images (product_id, url, alt, sort_order)
select 'flexi-knee-patches', v.url, v.alt, v.sort_order
from (values
  ('/images/product/hero-main.jpg', 'Flexi Knee Patch — hero shot', 1),
  ('/images/product/on-the-knee.jpg', 'On the knee', 2),
  ('/images/product/packaging.jpg', 'Packaging', 3),
  ('/images/product/macro-texture.jpg', 'Macro detail', 4)
) as v(url, alt, sort_order)
where not exists (select 1 from product_images where product_id = 'flexi-knee-patches');

insert into packages (id, name, units, patches_per_unit, price, compare_at_price, badge, is_popular, is_available, sort_order)
values
  ('single', '1 Box', 1, 6, 129, 179, null, false, true, 1),
  ('triple', '3 Boxes', 3, 6, 299, 537, 'Most Popular', true, true, 2),
  ('five', '5 Boxes', 5, 6, 429, 895, 'Best Value', false, true, 3)
on conflict (id) do nothing;

insert into faq_items (question, answer, sort_order, is_enabled)
select v.question, v.answer, v.sort_order, true
from (values
  ('What are Flexi Knee Patches made from?', 'Each patch has a breathable fabric base with a far-infrared and tourmaline-infused core, finished with a medical-grade adhesive that''s gentle on skin.', 1),
  ('How long does one patch last?', 'Each patch is designed for up to 12 hours of continuous wear. We recommend giving your skin a short rest before applying a new patch to the same area.', 2),
  ('Is this a medical treatment?', 'Flexi Knee Patches are a comfort and wellness product, not a medical device or treatment. If you have a diagnosed joint condition or persistent pain, please speak with a doctor or physiotherapist.', 3),
  ('Can I wear it during exercise?', 'Yes — the low-profile design stays in place during walking, light exercise, and daily movement. For high-intensity training or water sports, we recommend removing it beforehand.', 4),
  ('Do you deliver across the UAE?', 'Yes, we deliver to all seven Emirates. Orders placed before 2pm typically arrive within 2–4 business days. Cash on Delivery is available everywhere we ship.', 5),
  ('What if it''s not right for me?', 'You''re covered by our 30-day return policy on unopened boxes. Reach out to our support team and we''ll walk you through the process.', 6)
) as v(question, answer, sort_order)
where not exists (select 1 from faq_items);

insert into site_content (key, value)
values (
  'homepage',
  '{
    "heroHeading": "Flexi Knee Patches",
    "heroDescription": "Self-adhesive far-infrared patches for soothing, everyday knee comfort.",
    "heroCtaText": "Add to Bag",
    "trustMessages": ["Free UAE shipping", "Cash on Delivery", "30-day returns"],
    "benefits": [
      {"id": "warmth", "title": "Soothing, gentle warmth", "description": "Far-infrared and tourmaline layers work with your body''s own heat to deliver a steady, comforting warmth exactly where you need it."},
      {"id": "discreet", "title": "Thin enough to wear all day", "description": "A low-profile, breathable design that sits comfortably under trousers, leggings, or a long skirt without shifting."},
      {"id": "on-the-go", "title": "Built for real days", "description": "Whether you''re on your feet at work, out walking, or simply climbing the stairs at home, each patch stays in place for up to 12 hours."},
      {"id": "simple", "title": "No devices, no charging", "description": "Peel, apply, go. There''s no battery, app, or setup — just a self-adhesive patch that gets to work on contact."}
    ],
    "howItWorksIntro": "Three layers, working together to bring soothing warmth exactly where you need it.",
    "guaranteeTitle": "Our promise to you",
    "guaranteeDescription": "If your Flexi Knee Patches don''t arrive in perfect condition, or an unopened box isn''t right for you, we''ll make it right within 30 days of delivery."
  }'::jsonb
)
on conflict (key) do nothing;

insert into store_settings (key, value)
values
  ('store', '{
    "storeName": "Velnora",
    "storeEmail": "care@velnora.ae",
    "contactPhone": "+971500000000",
    "whatsapp": "+971500000000",
    "currency": "AED",
    "supportHours": "Sunday–Thursday, 9am–6pm (GST)"
  }'::jsonb),
  ('shipping', '{
    "uaeShippingFee": 0,
    "freeShippingThreshold": null,
    "codEnabled": true
  }'::jsonb)
on conflict (key) do nothing;
