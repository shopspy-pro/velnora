"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { formatAED } from "@/lib/constants";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import { useCartStore } from "@/features/cart/store/cart-store";

export function StickyBuyBar() {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const setTier = useCartStore((state) => state.setTier);
  const tiers = useStorefrontConfigStore((state) => state.tiers);
  const popularTier = tiers.find((t) => t.isPopular) ?? tiers[0];

  useEffect(() => {
    const hero = document.getElementById("product");
    const footer = document.querySelector("footer");
    if (!hero || !footer) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    const footerObserver = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting)
    );

    heroObserver.observe(hero);
    footerObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const isVisible = !isHeroVisible && !isFooterVisible;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 shadow-elevated backdrop-blur-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-medium md:text-base">
            Flexi Knee Patches — {popularTier.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatAED(popularTier.price)} · Free UAE shipping
          </p>
        </div>
        <MagneticButton className="shrink-0" rounded="rounded-lg">
          <Button
            variant="cta"
            size="lg"
            onClick={() => setTier(popularTier.id)}
            tabIndex={isVisible ? 0 : -1}
          >
            Add to Bag
          </Button>
        </MagneticButton>
      </div>
    </div>
  );
}
