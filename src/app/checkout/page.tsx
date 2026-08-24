"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { FadeIn } from "@/components/motion/fade-in";
import { AddressForm } from "@/features/checkout/components/address-form";
import { OrderReview } from "@/features/checkout/components/order-review";
import { PaymentMethodSelector } from "@/features/checkout/components/payment-method-selector";
import { useCartStore } from "@/features/cart/store/cart-store";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import type { OrderPaymentMethod } from "@/types/product";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lines = useCartStore((state) => state.lines);
  const initialPaymentMethod: OrderPaymentMethod =
    searchParams.get("pm") === "card" ? "card" : "cod";
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    initialPaymentMethod
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      emirate: "" as AddressInput["emirate"],
      city: "",
      addressLine1: "",
      addressLine2: "",
    },
  });

  async function onSubmit(address: AddressInput) {
    if (lines.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentMethod === "cod") {
        const res = await fetch("/api/checkout/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, lines }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Order failed.");
        router.push(
          `/checkout/success?order=${encodeURIComponent(data.orderNumber)}`
        );
      } else {
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, lines }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
        window.location.assign(data.url);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setIsSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-medium">Your bag is empty</h1>
        <p className="text-muted-foreground">
          Add Flexi Knee Patches to your bag before checking out.
        </p>
        <Link href="/#product" className="text-sm font-medium text-brand-emerald-900 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Continue shopping
      </Link>

      <h1 className="mb-8 font-heading text-2xl font-medium md:text-3xl">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 md:grid-cols-[1.2fr_1fr]"
      >
        <FadeIn className="flex flex-col gap-8" y={16}>
          <AddressForm control={control} register={register} errors={errors} />
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        </FadeIn>

        <FadeIn className="flex flex-col gap-4" delay={0.12} y={16}>
          <OrderReview />
          <MagneticButton className="block w-full">
            <Button
              type="submit"
              variant="premium"
              size="xl"
              className="w-full"
              loading={isSubmitting}
            >
              {paymentMethod === "cod" ? "Place Order" : "Continue to Payment"}
            </Button>
          </MagneticButton>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Your information is encrypted and secure.
          </p>
        </FadeIn>
      </form>
    </div>
  );
}
