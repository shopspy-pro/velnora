-- Extends the admin panel into a fuller CMS: policy page prose (About,
-- Contact, Privacy, Terms, Shipping & Returns), a general-purpose image
-- library for the storefront's galleries, and a public Storage bucket to
-- host uploaded images. Also brings a few remaining hardcoded homepage
-- blocks (usage steps, comparison table, trust badges, SEO) under
-- site_content so the admin panel can edit them like everything else there.

-- ------------------------------------------------------------ policy_pages

create table if not exists policy_pages (
  slug text primary key,
  title text not null,
  meta_title text,
  meta_description text,
  body text not null,
  updated_at timestamptz not null default now()
);

insert into policy_pages (slug, title, meta_title, meta_description, body)
values
  (
    'about',
    'About Velnora',
    'About Velnora',
    'Velnora designs thoughtful, everyday wellness products for the UAE — starting with Flexi Knee Patches.',
    E'Velnora was started with a simple observation: the products designed to bring us comfort are rarely designed for real, everyday life. Heating pads that tether you to a wall socket. Braces too bulky to wear under your clothes. Solutions built for a clinic, not for a Tuesday morning.\n\nWe set out to build something different — starting with Flexi Knee Patches, a self-adhesive far-infrared patch designed to sit comfortably under everyday clothing, no devices or downtime required.\n\n## Designed for the UAE\n\nWe''re based in Dubai and built Velnora around how people actually live and move here — long days, warm climates, and a preference for products that just work without fuss. That''s why we offer Cash on Delivery alongside card payment, and ship across all seven Emirates.\n\n## Our approach\n\nWe''re not a clinic and we don''t make medical claims. What we do promise is thoughtful design, honest communication, and a product we''d genuinely recommend to our own families.'
  ),
  (
    'contact',
    'Contact us',
    'Contact Us',
    'Get in touch with the Velnora customer care team.',
    E'Questions about your order, the product, or anything else? We''re based in the UAE and happy to help.'
  ),
  (
    'privacy-policy',
    'Privacy Policy',
    'Privacy Policy',
    'How Velnora collects, uses, and protects your information.',
    E'## Information we collect\n\nWhen you place an order, we collect your name, phone number, delivery address, and, if provided, your email address. If you subscribe to our newsletter, we collect your email address. We do not collect payment card details directly — card payments are processed securely by Stripe, and we never see or store your full card number.\n\n## How we use your information\n\n- To process, fulfill, and deliver your order\n- To communicate with you about your order or support requests\n- To send occasional updates, if you''ve subscribed to our newsletter\n- To improve our products and website\n\n## How we store your information\n\nOrder and contact information is stored securely using Supabase, our database provider, with access restricted to authorized Velnora systems and staff.\n\n## Sharing your information\n\nWe do not sell your personal information. We share only what''s necessary with our delivery couriers to fulfill your order, and with Stripe to process card payments.\n\n## Your rights\n\nYou may request access to, correction of, or deletion of your personal information at any time by contacting us.\n\n## Contact\n\nQuestions about this policy can be directed to Velnora Wellness FZE using the contact details on our Contact page.'
  ),
  (
    'terms',
    'Terms of Service',
    'Terms of Service',
    'The terms that govern your use of the Velnora website and your orders.',
    E'## Orders\n\nBy placing an order, you confirm that the delivery details you provide are accurate. We reserve the right to cancel or refuse any order, for example if a product is unexpectedly out of stock or a fraud check fails.\n\n## Pricing\n\nAll prices are listed in AED and include VAT where applicable. We reserve the right to change prices at any time — the price shown at checkout is the price you pay.\n\n## Payment\n\nWe accept Cash on Delivery and card payment via Stripe. Card details are processed securely by Stripe and never stored on our systems.\n\n## Shipping & delivery\n\nSee our Shipping & Returns page for current delivery timelines and fees.\n\n## Returns\n\nUnopened boxes may be returned within 30 days of delivery — see our Shipping & Returns page for details.\n\n## Limitation of liability\n\nFlexi Knee Patches are a comfort and wellness product, not a medical device. Velnora is not liable for outcomes arising from use inconsistent with the product instructions.'
  ),
  (
    'shipping-returns',
    'Shipping & Returns',
    'Shipping & Returns',
    'Velnora delivery times, fees, and our 30-day return policy for the UAE.',
    E'## Shipping\n\nWe deliver across all seven Emirates. Orders placed before 2pm typically arrive within 2–4 business days. Cash on Delivery is available everywhere we ship.\n\n## Returns\n\nYou''re covered by our 30-day return policy on unopened boxes. Reach out to our support team and we''ll walk you through the process.\n\n## Damaged or incorrect orders\n\nIf your order arrives damaged or isn''t what you ordered, contact us within 48 hours of delivery and we''ll make it right at no extra cost.'
  )
on conflict (slug) do nothing;

alter table policy_pages enable row level security;

-- ------------------------------------------------------------- media_assets

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('hero_gallery', 'story', 'day_in_life')),
  url text not null,
  alt text not null default '',
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_section_idx on media_assets (section, sort_order);

insert into media_assets (section, url, alt, sort_order)
select v.section, v.url, v.alt, v.sort_order
from (values
  ('hero_gallery', '/images/product/hero-main.jpg', 'Flexi Knee Patch — hero shot', 1),
  ('hero_gallery', '/images/product/on-the-knee.jpg', 'On the knee', 2),
  ('hero_gallery', '/images/product/packaging.jpg', 'Packaging', 3),
  ('hero_gallery', '/images/product/macro-texture.jpg', 'Macro detail', 4),
  ('story', '/images/product/patch-bent.jpg', 'Breathable fabric base', 1),
  ('story', '/images/product/on-the-knee.jpg', 'Far-infrared & tourmaline core', 2),
  ('story', '/images/product/hero-main.jpg', 'Steady, wearable warmth', 3),
  ('day_in_life', '/images/product/lifestyle-sleep.jpg', 'Morning routine', 1),
  ('day_in_life', '/images/product/lifestyle-garden.jpg', 'On your feet at work', 2),
  ('day_in_life', '/images/product/lifestyle-stairs.jpg', 'Out walking', 3),
  ('day_in_life', '/images/product/lifestyle-cycling.jpg', 'Light movement', 4)
) as v(section, url, alt, sort_order)
where not exists (select 1 from media_assets);

alter table media_assets enable row level security;

-- No public policies on policy_pages/media_assets: both read via the same
-- service-role server pattern as every other admin-managed table.

-- ---------------------------------------------------------- storage bucket

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to site-media" on storage.objects;
create policy "Public read access to site-media"
  on storage.objects for select
  using (bucket_id = 'site-media');

-- Uploads/deletes go through the admin panel's server actions using the
-- service-role key, which bypasses Storage RLS entirely — no public
-- write/delete policy is needed or added.

-- --------------------------------------------------- site_content additions

update site_content
set value = value || jsonb_build_object(
  'usageSteps', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', 'Cleanse & dry', 'description', 'Make sure the skin around your knee is clean, dry, and free of lotion before applying.'),
    jsonb_build_object('step', 2, 'title', 'Peel & position', 'description', 'Remove the backing and center the patch over the area of the knee where you feel discomfort.'),
    jsonb_build_object('step', 3, 'title', 'Press & smooth', 'description', 'Press the edges down firmly so the patch adheres fully and moves naturally with your knee.'),
    jsonb_build_object('step', 4, 'title', 'Wear up to 12 hours', 'description', 'Leave in place through your day or overnight, then remove gently. Allow the skin a rest period before reapplying.')
  ),
  'comparisonTable', jsonb_build_object(
    'columns', jsonb_build_object('velnora', 'Flexi Knee Patches', 'patches', 'Generic Patches', 'pills', 'Oral Pain Relief'),
    'rows', jsonb_build_array(
      jsonb_build_object('feature', 'No pills or ingestion required', 'velnora', true, 'patches', 'Varies', 'pills', false),
      jsonb_build_object('feature', 'Discreet under everyday clothing', 'velnora', true, 'patches', 'Varies', 'pills', true),
      jsonb_build_object('feature', 'Wear duration', 'velnora', 'Up to 12 hours', 'patches', '2–4 hours', 'pills', 'As directed'),
      jsonb_build_object('feature', 'No batteries or charging', 'velnora', true, 'patches', true, 'pills', true),
      jsonb_build_object('feature', 'Reapply throughout the day', 'velnora', true, 'patches', true, 'pills', false)
    )
  ),
  'trustBadges', jsonb_build_array(
    jsonb_build_object('id', 'shipping', 'label', 'Free UAE Shipping'),
    jsonb_build_object('id', 'cod', 'label', 'Cash on Delivery'),
    jsonb_build_object('id', 'returns', 'label', '30-Day Returns'),
    jsonb_build_object('id', 'secure', 'label', 'Secure Checkout'),
    jsonb_build_object('id', 'ssl', 'label', 'SSL Protected'),
    jsonb_build_object('id', 'wear', 'label', 'Up to 12 Hours Wear'),
    jsonb_build_object('id', 'emirates', 'label', 'All 7 Emirates')
  ),
  'seo', jsonb_build_object(
    'title', 'Flexi Knee Patches — Far-Infrared Knee Support | Velnora',
    'description', 'Flexi Knee Patches by Velnora use far-infrared and tourmaline technology to deliver soothing warmth to the knee. Free UAE shipping, Cash on Delivery available.'
  )
)
where key = 'homepage'
  and not (value ? 'usageSteps');
