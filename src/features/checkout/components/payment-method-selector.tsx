"use client";

import { useEffect } from "react";
import { Banknote, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import type { OrderPaymentMethod } from "@/types/product";

const ALL_OPTIONS: {
  value: OrderPaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "card",
    label: "Pay by card",
    description: "Secure checkout powered by Stripe.",
    icon: CreditCard,
  },
];

export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: OrderPaymentMethod;
  onChange: (value: OrderPaymentMethod) => void;
}) {
  const codEnabled = useStorefrontConfigStore((state) => state.shipping.codEnabled);
  const options = codEnabled ? ALL_OPTIONS : ALL_OPTIONS.filter((o) => o.value !== "cod");

  // If COD gets disabled while it was selected (or on initial hydration),
  // fall back to card so the customer never submits a request the server
  // will reject.
  useEffect(() => {
    if (!codEnabled && value === "cod") {
      onChange("card");
    }
  }, [codEnabled, value, onChange]);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium">Payment method</h2>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as OrderPaymentMethod)}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                isSelected
                  ? "border-brand-emerald-900 bg-brand-emerald-100/40"
                  : "border-border hover:border-brand-emerald-700/50"
              )}
            >
              <RadioGroupItem value={option.value} />
              <Icon className="size-5 shrink-0 text-brand-emerald-900" />
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
