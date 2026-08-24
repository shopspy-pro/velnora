import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import type { OrderItemRow, OrderRow } from "@/lib/supabase/types";

const schema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(7),
});

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter your order number and phone number." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    // Strip ILIKE wildcard metacharacters from user input so a submitted
    // "%" or "_" can't turn this literal lookup into a pattern match.
    const safeOrderNumber = parsed.data.orderNumber.trim().replace(/[%_]/g, "");
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("order_number", safeOrderNumber)
      .maybeSingle();

    if (error) throw error;
    const order = orderData as OrderRow | null;

    if (
      !order ||
      normalizePhone(order.customer_phone) !== normalizePhone(parsed.data.phone)
    ) {
      return NextResponse.json(
        { error: "We couldn't find an order matching those details." },
        { status: 404 }
      );
    }

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    const items = itemsData as OrderItemRow[] | null;

    return NextResponse.json({
      orderNumber: order.order_number,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      items: (items ?? []).map((item) => ({
        label: item.label,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    });
  } catch (error) {
    console.error("order tracking lookup failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
