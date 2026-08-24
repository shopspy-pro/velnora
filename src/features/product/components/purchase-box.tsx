"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/constants";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import { useCartStore } from "@/features/cart/store/cart-store";

export function PurchaseBox({
  ctaLabel = "Add to Bag",
}: {
  ctaLabel?: string;
}) {
  const router = useRouter();
  const tiers = useStorefrontConfigStore((state) => state.tiers);
  const codEnabled = useStorefrontConfigStore((state) => state.shipping.codEnabled);
  const popularTier = tiers.find((t) => t.isPopular) ?? tiers[0];
  const [selectedTierId, setSelectedTierId] = useState(popularTier.id);
  const setTier = useCartStore((state) => state.setTier);

  const selectedTier =
    tiers.find((t) => t.id === selectedTierId) ?? popularTier;

  function buyWithCod() {
    setTier(selectedTier.id);
    router.push("/checkout?pm=cod");
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset id="pack-size" className="flex scroll-mt-24 flex-col gap-2.5">
        <legend className="sr-only">Choose a pack size</legend>
        {tiers.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          const savings = Math.round(
            (1 - tier.price / tier.compareAtPrice) * 100
          );
          return (
            <label
              key={tier.id}
              className={cn(
                "relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 shadow-soft transition-all duration-200",
                isSelected
                  ? "border-brand-emerald-900 bg-brand-emerald-100 shadow-elevated ring-1 ring-brand-emerald-900"
                  : "border-transparent bg-brand-sand-50 hover:-translate-y-0.5 hover:shadow-elevated"
              )}
            >
              <input
                type="radio"
                name="pricing-tier"
                value={tier.id}
                checked={isSelected}
                onChange={() => setSelectedTierId(tier.id)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-200",
                    isSelected ? "border-brand-emerald-900 bg-brand-emerald-900" : "border-border"
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 20 }}
                      >
                        <Check className="size-3.5 text-brand-sand-50" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-medium md:text-base">
                      {tier.label}
                    </span>
                    {tier.badge && (
                      <span className="rounded-full bg-brand-bronze-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-stone-900">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {tier.units * tier.patchesPerUnit} patches ·{" "}
                    {formatAED(tier.pricePerUnit)}/box
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-heading text-base font-medium tabular-nums md:text-lg">
                  {formatAED(tier.price)}
                </span>
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  {formatAED(tier.compareAtPrice)}
                </span>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand-emerald-900 shadow-soft">
                  Save {savings}%
                </span>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-2">
        <MagneticButton className="block w-full">
          <Button
            size="xl"
            variant="cta"
            className="w-full overflow-hidden"
            onClick={() => setTier(selectedTier.id)}
          >
            <span className="relative inline-grid">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={selectedTier.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="col-start-1 row-start-1"
                >
                  {ctaLabel} — {formatAED(selectedTier.price)}
                </motion.span>
              </AnimatePresence>
            </span>
          </Button>
        </MagneticButton>

        {codEnabled && (
          <Button
            size="xl"
            variant="premium"
            className="w-full"
            onClick={buyWithCod}
          >
            <Banknote className="size-4" strokeWidth={2} />
            Buy with Cash on Delivery
          </Button>
        )}
      </div>
    </div>
  );
}
