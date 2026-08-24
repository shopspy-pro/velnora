"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAED } from "@/lib/constants";
import {
  getCartLineDetails,
  getCartTotal,
  useCartStore,
} from "@/features/cart/store/cart-store";

export function CartDrawer() {
  const { lines, isOpen, open, close, incrementLine, decrementLine, removeLine } =
    useCartStore();
  const details = getCartLineDetails(lines);
  const total = getCartTotal(lines);

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            Your Bag
          </SheetTitle>
        </SheetHeader>

        {details.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Your bag is empty. Choose a pack to get started.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <ul className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {details.map(({ tier, quantity, subtotal }) => (
                  <motion.li
                    key={tier.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex-1">
                      <p className="font-heading text-sm font-medium">
                        {tier.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tier.units * tier.patchesPerUnit * quantity} patches
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label={`Decrease quantity of ${tier.label}`}
                          onClick={() => decrementLine(tier.id)}
                        >
                          <Minus />
                        </Button>
                        <span className="w-4 text-center text-sm tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label={`Increase quantity of ${tier.label}`}
                          onClick={() => incrementLine(tier.id)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-medium tabular-nums">
                        {formatAED(subtotal)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${tier.label} from bag`}
                        onClick={() => removeLine(tier.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}

        {details.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-heading text-base font-medium tabular-nums">
                {formatAED(total)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and Cash on Delivery options are calculated at checkout.
            </p>
            <Separator className="my-1" />
            <Link
              href="/checkout"
              onClick={close}
              className={buttonVariants({
                variant: "premium",
                size: "xl",
                className: "w-full",
              })}
            >
              Checkout
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
