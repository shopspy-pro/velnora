import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatAED } from "@/lib/constants";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { OrderRow } from "@/lib/supabase/types";
import { ClearCartOnMount } from "@/features/checkout/components/clear-cart-on-mount";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The order itself is created by the Stripe webhook (checkout.session.completed),
 * which can land a moment after Stripe redirects the customer here — so the
 * real order_number may not exist in the database yet on first render. A
 * few short retries covers that race without ever fabricating a reference
 * number from the Stripe session id.
 */
async function findOrderByStripeSession(sessionId: string): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (data) return data as OrderRow;
    if (attempt < 3) await wait(600);
  }
  return null;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order, session_id } = await searchParams;

  let orderNumber = order;
  let amountTotal: number | null = null;
  let stillConfirming = false;

  if (session_id && !orderNumber) {
    const matchedOrder = await findOrderByStripeSession(session_id);
    if (matchedOrder) {
      orderNumber = matchedOrder.order_number;
      amountTotal = matchedOrder.total;
    } else {
      stillConfirming = true;
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(session_id);
        amountTotal = session.amount_total ? session.amount_total / 100 : null;
      } catch (error) {
        console.error("failed to retrieve stripe session", error);
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <ClearCartOnMount active={Boolean(orderNumber || session_id)} />
      <CheckCircle2 className="size-14 text-brand-emerald-900" strokeWidth={1.25} />
      <h1 className="font-heading text-2xl font-medium md:text-3xl">
        Thank you — your order is confirmed
      </h1>
      {orderNumber && (
        <p className="text-muted-foreground">
          Order reference: <span className="font-medium text-foreground">{orderNumber}</span>
        </p>
      )}
      {stillConfirming && (
        <p className="text-muted-foreground">
          Your payment was received — we&apos;re finishing up your order confirmation now.
          You can look it up on the{" "}
          <Link href="/track-order" className="underline">
            track order
          </Link>{" "}
          page in a moment using your phone number.
        </p>
      )}
      {amountTotal !== null && (
        <p className="text-muted-foreground">
          Amount charged: {formatAED(amountTotal)}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        We’ve sent a confirmation to your phone or email. Your patches will be
        on their way shortly.
      </p>
      <Link href="/" className={buttonVariants({ variant: "premium", size: "lg" })}>
        Back to home
      </Link>
    </div>
  );
}
