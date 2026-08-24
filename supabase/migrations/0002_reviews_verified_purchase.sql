-- Lets a review be honestly marked as a verified purchase (e.g. linked to a
-- real order) rather than displaying a "Verified Purchase" badge on every
-- review by default. Defaults to false; set true only when genuinely tied
-- to a completed order.

alter table reviews
  add column if not exists is_verified_purchase boolean not null default false;
