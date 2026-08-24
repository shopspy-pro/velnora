"use client";

import { useEffect } from "react";
import { useCartStore } from "@/features/cart/store/cart-store";

/**
 * Only clears the cart when the caller can confirm this render genuinely
 * followed a completed checkout (an order number or Stripe session id was
 * present) — not on a bare visit/bookmark/refresh of this URL, which would
 * otherwise silently empty a customer's cart with nothing actually ordered.
 */
export function ClearCartOnMount({ active = true }: { active?: boolean }) {
  useEffect(() => {
    if (active) {
      useCartStore.getState().clear();
    }
  }, [active]);

  return null;
}
