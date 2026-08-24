import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/validations/checkout";
import { resolveOrderLines } from "@/lib/orders";
import { getStorefrontShipping } from "@/lib/storefront-data";
import { resolveShippingFee } from "@/features/checkout/lib/shipping";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order details." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const [resolvedLines, shipping] = await Promise.all([
      resolveOrderLines(parsed.data.lines),
      getStorefrontShipping(),
    ]);
    const subtotal = resolvedLines.reduce((sum, line) => sum + line.subtotal, 0);
    const shippingFee = resolveShippingFee(shipping, subtotal);

    const lineItems = resolvedLines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "aed",
        unit_amount: Math.round(line.unit_price * 100),
        product_data: { name: `Flexi Knee Patches — ${line.label}` },
      },
    }));

    if (shippingFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "aed",
          unit_amount: Math.round(shippingFee * 100),
          product_data: { name: "UAE shipping" },
        },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: parsed.data.address.email || undefined,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancelled`,
      metadata: {
        address: JSON.stringify(parsed.data.address),
        lines: JSON.stringify(parsed.data.lines),
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("stripe session creation failed", error);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again." },
      { status: 500 }
    );
  }
}
