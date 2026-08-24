"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";

export interface CartLine {
  tierId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setTier: (tierId: string) => void;
  incrementLine: (tierId: string) => void;
  decrementLine: (tierId: string) => void;
  removeLine: (tierId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setTier: (tierId) =>
        set((state) => {
          const existing = state.lines.find((line) => line.tierId === tierId);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.tierId === tierId ? { ...line, quantity: line.quantity + 1 } : line
              ),
              isOpen: true,
            };
          }
          return { lines: [...state.lines, { tierId, quantity: 1 }], isOpen: true };
        }),
      incrementLine: (tierId) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.tierId === tierId
              ? { ...line, quantity: line.quantity + 1 }
              : line
          ),
        })),
      decrementLine: (tierId) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.tierId === tierId
                ? { ...line, quantity: line.quantity - 1 }
                : line
            )
            .filter((line) => line.quantity > 0),
        })),
      removeLine: (tierId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.tierId !== tierId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "velnora-cart",
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);

export function getCartLineDetails(lines: CartLine[]) {
  const tiers = useStorefrontConfigStore.getState().tiers;
  return lines
    .map((line) => {
      const tier = tiers.find((t) => t.id === line.tierId);
      if (!tier) return null;
      return { ...line, tier, subtotal: tier.price * line.quantity };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);
}

export function getCartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartTotal(lines: CartLine[]) {
  return getCartLineDetails(lines).reduce(
    (sum, line) => sum + line.subtotal,
    0
  );
}
