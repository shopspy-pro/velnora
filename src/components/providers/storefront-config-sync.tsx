"use client";

import { useEffect } from "react";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import type { PricingTier } from "@/types/product";
import type { ShippingConfig } from "@/features/product/store/storefront-config-store";

/**
 * Pushes server-fetched packages/shipping data (see src/lib/storefront-data.ts)
 * into the client-side storefront config store on mount, so client
 * components anywhere in the tree (buy box, sticky bar, cart, payment
 * method selector) see current admin-managed values without each needing
 * its own data fetch. Renders nothing.
 */
export function StorefrontConfigSync({
  tiers,
  shipping,
  whatsapp,
}: {
  tiers: PricingTier[];
  shipping: ShippingConfig;
  whatsapp: string;
}) {
  const setConfig = useStorefrontConfigStore((state) => state.setConfig);

  useEffect(() => {
    setConfig({ tiers, shipping, whatsapp });
  }, [tiers, shipping, whatsapp, setConfig]);

  return null;
}
