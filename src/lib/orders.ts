import { createServiceClient } from "@/lib/supabase/server";
import { getStorefrontPackages, getStorefrontShipping } from "@/lib/storefront-data";
import { resolveShippingFee } from "@/features/checkout/lib/shipping";
import type { AddressInput } from "@/lib/validations/checkout";
import type {
  OrderInsert,
  OrderItemInsert,
  OrderRow,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/supabase/types";

export function generateOrderNumber(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `VEL-${random}`;
}

export interface OrderLineInput {
  tierId: string;
  quantity: number;
}

/**
 * Prices every line from the CURRENT packages data (Supabase if configured,
 * static fallback otherwise) at the moment the order is created — never
 * trusts a client-submitted price. This is what makes admin price edits in
 * /admin/packages actually take effect for real checkouts.
 */
export async function resolveOrderLines(lines: OrderLineInput[]) {
  const tiers = await getStorefrontPackages();
  return lines.map((line) => {
    const tier = tiers.find((t) => t.id === line.tierId);
    if (!tier) {
      throw new Error(`Unknown pricing tier: ${line.tierId}`);
    }
    return {
      tier_id: tier.id,
      label: tier.label,
      quantity: line.quantity,
      unit_price: tier.price,
      subtotal: tier.price * line.quantity,
    };
  });
}

export async function createOrder(params: {
  address: AddressInput;
  lines: OrderLineInput[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
}) {
  const supabase = createServiceClient();
  const [resolvedLines, shipping] = await Promise.all([
    resolveOrderLines(params.lines),
    getStorefrontShipping(),
  ]);
  const subtotal = resolvedLines.reduce((sum, line) => sum + line.subtotal, 0);
  const shippingFee = resolveShippingFee(shipping, subtotal);
  const total = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  const orderPayload: OrderInsert = {
    order_number: orderNumber,
    status: "new",
    payment_method: params.paymentMethod,
    payment_status: params.paymentStatus,
    stripe_session_id: params.stripeSessionId ?? null,
    customer_full_name: params.address.fullName,
    customer_phone: params.address.phone,
    customer_email: params.address.email || null,
    emirate: params.address.emirate,
    city: params.address.city,
    address_line1: params.address.addressLine1,
    address_line2: params.address.addressLine2 || null,
    subtotal,
    shipping_fee: shippingFee,
    total,
    currency: "AED",
  };

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();

  const order = orderData as OrderRow | null;

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to create order.");
  }

  const itemsPayload: OrderItemInsert[] = resolvedLines.map((line) => ({
    ...line,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return order;
}
