import { create } from "zustand";
import { PRICING_TIERS } from "@/features/product/data/product";
import { CONTACT } from "@/lib/constants";
import type { PricingTier } from "@/types/product";
import type { ShippingConfig } from "@/features/checkout/lib/shipping";

export type { ShippingConfig } from "@/features/checkout/lib/shipping";

const DEFAULT_SHIPPING: ShippingConfig = {
  uaeShippingFee: 0,
  freeShippingThreshold: null,
  codEnabled: true,
};

interface StorefrontConfigState {
  tiers: PricingTier[];
  shipping: ShippingConfig;
  whatsapp: string;
  setConfig: (config: { tiers: PricingTier[]; shipping: ShippingConfig; whatsapp: string }) => void;
}

/**
 * Client-side mirror of the same package/shipping data the admin panel
 * manages in Supabase — hydrated once from server-fetched props (see
 * StorefrontConfigSync) so every client component that needs current
 * pricing (buy box, sticky bar, cart totals, payment method availability)
 * reads the same live values instead of the static fallback file. Starts
 * with the static values so nothing is empty before hydration runs.
 */
export const useStorefrontConfigStore = create<StorefrontConfigState>()((set) => ({
  tiers: PRICING_TIERS,
  shipping: DEFAULT_SHIPPING,
  whatsapp: CONTACT.whatsapp,
  setConfig: (config) => set(config),
}));
