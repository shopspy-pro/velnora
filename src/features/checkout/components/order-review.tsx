"use client";

import { formatAED } from "@/lib/constants";
import {
  getCartLineDetails,
  getCartTotal,
  useCartStore,
} from "@/features/cart/store/cart-store";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import { resolveShippingFee } from "@/features/checkout/lib/shipping";

export function OrderReview() {
  const lines = useCartStore((state) => state.lines);
  const shipping = useStorefrontConfigStore((state) => state.shipping);
  const details = getCartLineDetails(lines);
  const subtotal = getCartTotal(lines);
  const shippingFee = resolveShippingFee(shipping, subtotal);
  const total = subtotal + shippingFee;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-lg font-medium">Order summary</h2>
      <ul className="flex flex-col gap-3">
        {details.map(({ tier, quantity, subtotal: lineSubtotal }) => (
          <li key={tier.id} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">
                {tier.label} <span className="text-muted-foreground">× {quantity}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {tier.units * tier.patchesPerUnit * quantity} patches
              </p>
            </div>
            <span className="tabular-nums">{formatAED(lineSubtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatAED(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{shippingFee === 0 ? "Free" : formatAED(shippingFee)}</span>
        </div>
        <div className="flex justify-between font-heading text-base font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatAED(total)}</span>
        </div>
      </div>
    </div>
  );
}
