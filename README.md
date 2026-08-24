# Velnora — Flexi Knee Patches

Premium single-product ecommerce storefront for the UAE market, built with
Next.js 16, Tailwind v4, Supabase, and Stripe.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first theme in `src/app/globals.css`) + shadcn/ui (Base UI) primitives
- **Zustand** for cart state (persisted to localStorage)
- **React Hook Form + Zod** for checkout validation
- **Supabase** (Postgres) for orders, order items, reviews, newsletter signups
- **Stripe Checkout** for card payments, plus native **Cash on Delivery**
- **Framer Motion**-ready component structure (motion not yet wired into every section)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
| --- | --- |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API (service role, server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API (anon, public) |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → Webhooks (endpoint: `/api/webhooks/stripe`) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (used to build Stripe success/cancel redirect URLs) |

Without Supabase configured, the storefront and checkout UI still work —
order writes and review reads fail gracefully with a toast/empty-state
rather than crashing.

## Database setup

Run the migration in `supabase/migrations/0001_init.sql` against your
Supabase project (via the Supabase SQL editor, or the Supabase CLI) to
create the `orders`, `order_items`, `reviews`, and `newsletter_subscribers`
tables.

The product catalog itself (Flexi Knee Patches, pricing tiers) is **not**
in the database — it's a single hardcoded source of truth at
`src/features/product/data/product.ts`, since there's only one SKU today.

## Placeholder imagery

No final product photography exists yet. Every image slot renders as a
branded placeholder (`src/components/ui/placeholder-image.tsx`). See
[`docs/image-prompts.md`](docs/image-prompts.md) for the full shot list —
AI-generation prompts and aspect ratios — for every slot, keyed by the
`assetSlot` name visible on each placeholder.

## Fonts

Fraunces and Manrope are self-hosted (`src/app/fonts/*.woff2`, loaded via
`next/font/local`) rather than fetched from Google Fonts at build time —
this keeps builds reliable with no external network dependency. Both are
SIL Open Font License.

## Project structure

```
src/
  app/                 routes, layouts, API route handlers
  features/
    product/            homepage sections, product data/copy
    cart/                zustand store, cart drawer
    checkout/            address form, payment method, order review
    reviews/             published-reviews section (real reviews only)
  components/
    ui/                  shadcn/Base UI primitives + PlaceholderImage
    layout/              header, footer, section wrappers
  lib/
    supabase/            server + public clients (see note below)
    stripe/              Stripe server client
    orders.ts            shared order-creation logic (COD + Stripe webhook)
    validations/          Zod schemas
```

### A note on the Supabase client typing

The installed `@supabase/postgrest-js` version's `Database`-generic type
inference doesn't resolve correctly against a hand-written schema type for
this project (a library/TypeScript-version interaction, confirmed via
isolated repro — not a schema bug). The Supabase clients in
`src/lib/supabase/{server,client}.ts` are intentionally untyped; row shapes
are enforced manually via the interfaces in `src/lib/supabase/types.ts` at
each call site instead. If a future postgrest-js version resolves this, the
generic can be re-added.
