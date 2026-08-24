import type {
  FaqItemRow,
  OrderItemRow,
  OrderRow,
  PackageRow,
  ProductImageRow,
  ProductRow,
  ReviewRow,
} from "@/lib/supabase/types";
import type {
  AdminFaqItem,
  AdminOrder,
  AdminOrderItem,
  AdminPackage,
  AdminProduct,
  AdminReview,
  OrderStatus,
} from "./types";

export function mapOrderItemRow(row: OrderItemRow): AdminOrderItem {
  return {
    id: row.id,
    packageId: row.tier_id,
    label: row.label,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  };
}

export function mapOrderRow(
  row: OrderRow,
  items: OrderItemRow[] = []
): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    customerName: row.customer_full_name,
    phone: row.customer_phone,
    email: row.customer_email,
    emirate: row.emirate,
    city: row.city,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    items: items.map(mapOrderItemRow),
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    currency: row.currency,
  };
}

export function mapReviewRow(row: ReviewRow): AdminReview {
  return {
    id: row.id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    isPublished: row.is_published,
    isVerifiedPurchase: row.is_verified_purchase,
    linkedOrderNumber: row.linked_order_number,
    // Rows only ever exist in the real table via genuine admin/storefront
    // activity — there is no "demo content" concept for real data.
    isDemoContent: false,
  };
}

export function mapFaqRow(row: FaqItemRow): AdminFaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    isEnabled: row.is_enabled,
  };
}

export function mapProductRow(
  row: ProductRow,
  images: ProductImageRow[] = []
): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    images: [...images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, url: img.url, alt: img.alt })),
    basePrice: Number(row.base_price),
    stockStatus: row.stock_status,
    isAvailable: row.is_available,
  };
}

export function mapPackageRow(row: PackageRow): AdminPackage {
  return {
    id: row.id,
    name: row.name,
    units: row.units,
    patchesPerUnit: row.patches_per_unit,
    price: Number(row.price),
    compareAtPrice: Number(row.compare_at_price),
    badge: row.badge,
    isPopular: row.is_popular,
    isAvailable: row.is_available,
    sortOrder: row.sort_order,
  };
}
