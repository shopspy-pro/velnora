import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/validations/checkout";
import { createOrder } from "@/lib/orders";
import { getStorefrontShipping } from "@/lib/storefront-data";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`checkout-cod:${ip}`, 10, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order details." },
      { status: 400 }
    );
  }

  const shipping = await getStorefrontShipping();
  if (!shipping.codEnabled) {
    return NextResponse.json(
      { error: "Cash on Delivery isn't available right now. Please pay by card instead." },
      { status: 400 }
    );
  }

  try {
    const order = await createOrder({
      address: parsed.data.address,
      lines: parsed.data.lines,
      paymentMethod: "cod",
      paymentStatus: "pending",
    });

    return NextResponse.json({
      orderNumber: order.order_number,
      total: order.total,
    });
  } catch (error) {
    console.error("cod order creation failed", error);
    return NextResponse.json(
      { error: "We couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}
