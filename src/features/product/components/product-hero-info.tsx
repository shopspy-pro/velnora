"use client";

import { Banknote, RotateCcw, Truck } from "lucide-react";
import { formatAED } from "@/lib/constants";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";

const TRUST_ROW = [
  { icon: Truck, label: "Free UAE shipping" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: RotateCcw, label: "30-day returns" },
] as const;

const PRODUCT_BRAND_LABEL = "Velnora";

/**
 * The clean, minimal hero-column content: badge, headline, description,
 * starting price, and trust row. Deliberately does not include the pack
 * selector or buy buttons — those live in the full PurchaseBox rendered as
 * its own section right below the hero, so the first screen stays open
 * and uncluttered.
 */
export function ProductHeroInfo({
  heading = "Flexi Knee Patches",
  description = "Self-adhesive far-infrared patches for soothing, everyday knee comfort.",
}: {
  heading?: string;
  description?: string;
  ctaLabel?: string;
}) {
  const tiers = useStorefrontConfigStore((state) => state.tiers);
  const popularTier = tiers.find((t) => t.isPopular) ?? tiers[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-sage-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-emerald-900">
          {PRODUCT_BRAND_LABEL} · UAE Wellness
        </span>
        <h1 className="font-heading text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl lg:text-[3.25rem]">
          {heading}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>

      <div className="flex flex-col border-y border-border py-4">
        <span className="text-xs text-muted-foreground">From</span>
        <span className="font-heading text-2xl font-medium tabular-nums">
          {formatAED(popularTier.price)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {TRUST_ROW.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Icon className="size-3.5 text-brand-emerald-900" strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
