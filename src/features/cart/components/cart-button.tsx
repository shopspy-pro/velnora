"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartCount, useCartStore } from "@/features/cart/store/cart-store";

export function CartButton() {
  const lines = useCartStore((state) => state.lines);
  const open = useCartStore((state) => state.open);
  const count = getCartCount(lines);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Open bag${count > 0 ? `, ${count} items` : ""}`}
      onClick={open}
      className="relative"
    >
      <ShoppingBag />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand-bronze-600 text-[10px] font-semibold text-brand-stone-900 tabular-nums"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
