-- Velnora commerce schema: orders, order items, reviews, newsletter signups.
-- The catalog itself (Flexi Knee Patches, pricing tiers) is a single hardcoded
-- product defined in src/features/product/data/product.ts — no products table
-- is needed until a second SKU is introduced.

create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('card', 'cod')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  customer_full_name text not null,
  customer_phone text not null,
  customer_email text,
  emirate text not null,
  city text not null,
  address_line1 text not null,
  address_line2 text,
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'AED',
  notes text
);

create index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_customer_phone_idx on orders (customer_phone);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  tier_id text not null,
  label text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  subtotal numeric(10, 2) not null
);

create index if not exists order_items_order_id_idx on order_items (order_id);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_published boolean not null default false
);

create index if not exists reviews_is_published_idx on reviews (is_published);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now(),
  source text
);

alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table newsletter_subscribers enable row level security;

-- No public policies are defined: all reads/writes go through the
-- service-role key on the server (API routes / Server Actions). The
-- anon/public key has no access by default.

create policy "Public can read published reviews"
  on reviews for select
  to anon
  using (is_published = true);
