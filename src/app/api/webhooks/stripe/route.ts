import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createOrder } from "@/lib/orders";
import { addressSchema, cartLineSchema } from "@/lib/validations/checkout";
import { z } from "zod";

const linesMetadataSchema = z.array(cartLineSchema);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const address = addressSchema.parse(
        JSON.parse(session.metadata?.address ?? "null")
      );
      const lines = linesMetadataSchema.parse(
        JSON.parse(session.metadata?.lines ?? "null")
      );

      await createOrder({
        address,
        lines,
        paymentMethod: "card",
        paymentStatus: "paid",
        stripeSessionId: session.id,
      });
    } catch (error) {
      console.error("failed to create order from stripe webhook", error);
      return NextResponse.json(
        { error: "Failed to record order." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
