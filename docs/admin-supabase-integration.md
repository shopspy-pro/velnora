# Connecting the admin panel to Supabase

The admin panel (`/admin`) is fully built and functional against an
in-memory demo store. This document is the exact checklist for swapping
that demo store for real Supabase persistence — no UI or page code should
need to change, only the data layer in `src/lib/admin/`.

## 1. Provision Supabase

You already hit this earlier in the project: your Supabase org is at its
2-project free-tier limit (`nafixo-store`, `herbaflex-uae-store`). Free up a
slot, upgrade the org plan, or supply an existing project before continuing.

Once you have a project:

1. Add to `.env.local` (never commit this file):
   ```
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
2. Run the existing migrations in `supabase/migrations/` (`orders`,
   `order_items`, `reviews`, `newsletter_subscribers` already exist and are
   already used by the real storefront checkout flow).

## 2. Schema additions needed

The admin panel needs a few tables/columns that don't exist yet:

```sql
-- Fix the order status enum to match what the admin panel expects
alter table orders drop constraint orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
-- and rename any existing 'pending' rows to 'new'
update orders set status = 'new' where status = 'pending';

create table products (
  id text primary key,
  name text not null,
  description text not null,
  base_price numeric(10,2) not null,
  stock_status text not null default 'in_stock',
  is_available boolean not null default true
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete cascade,
  url text not null,
  alt text not null,
  sort_order integer not null default 0
);

create table packages (
  id text primary key,
  name text not null,
  units integer not null,
  patches_per_unit integer not null,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2) not null,
  badge text,
  is_popular boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

create table faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true
);

create table site_content (
  key text primary key,
  value jsonb not null
);

create table store_settings (
  key text primary key,
  value jsonb not null
);

-- Reviews already has is_verified_purchase (added in 0002_*.sql) —
-- add a link to the order it's tied to so verification is enforceable:
alter table reviews add column if not exists linked_order_number text;
```

## 3. Auth

Replace the demo credential check in
`src/app/admin/login/actions.ts` with Supabase Auth:

```ts
const supabase = createServiceClient();
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error || !data.user) return { error: "Invalid email or password." };
```

Then either keep the existing HMAC session cookie (`src/lib/admin/session.ts`)
storing the Supabase user id instead of a hardcoded email, or switch to
Supabase's own session/cookie helpers (`@supabase/ssr`). Either way, keep
`proxy.ts` gating `/admin/*` — just change what it verifies.

Also add an `admin_users` allowlist table (or a `role` column on
`auth.users` via metadata) so a leaked Supabase Auth signup can't grant
itself admin access — check membership in that table/claim inside both
`getAdminSession()` and every Server Action in `src/lib/admin/actions.ts`.

## 4. Data layer

Every function in `src/lib/admin/queries.ts` and `src/lib/admin/actions.ts`
has a 1:1 shape already matching what a Supabase query should return (see
`src/lib/admin/types.ts`). Swap the body of each function from
`getStore()...` to a Supabase call, e.g.:

```ts
// Before (demo):
export async function getOrders(filters: OrderFilters = {}) {
  const store = getStore();
  return store.orders.filter(...);
}

// After (Supabase):
export async function getOrders(filters: OrderFilters = {}) {
  const supabase = createServiceClient();
  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  // ...
  const { data } = await query;
  return (data ?? []).map(mapOrderRowToAdminOrder);
}
```

`src/lib/orders.ts` (used by the real storefront checkout) already has the
`createOrder()` function and `OrderRow` type this should reuse — don't
duplicate that logic.

## 5. Storefront wiring (optional, only if you want live-editable content)

Once `products`, `packages`, `faq_items`, and `site_content` exist in
Supabase, `src/features/product/data/product.ts` and
`src/lib/constants.ts` can be changed from static exports to async
functions reading from Supabase, and the Server Components that import them
(`Hero`, `PurchaseBox`, `FaqAccordion`, etc.) can `await` them instead. This
is the only step that touches the customer-facing storefront — everything
else above is admin-only.

## 6. Delete the demo layer

Once Supabase is fully wired, delete `src/lib/admin/demo-data.ts` and
`src/lib/admin/store.ts`, and remove the `DemoModeBanner` from
`src/components/admin/admin-shell.tsx`.
