import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { getOrder } from "@/lib/admin/queries";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatAED } from "@/lib/constants";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-medium">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-AE", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-heading text-base font-medium">Items</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {item.label} <span className="text-muted-foreground">× {item.quantity}</span>
                    </p>
                  </div>
                  <span className="tabular-nums">{formatAED(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatAED(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {order.shippingFee === 0 ? "Free" : formatAED(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-heading text-base font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatAED(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-heading text-base font-medium">Delivery address</h2>
            <div className="mt-3 flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-emerald-900" />
              <p className="text-muted-foreground">
                {order.addressLine1}
                {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                <br />
                {order.city}, {order.emirate}
                <br />
                United Arab Emirates
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-heading text-base font-medium">Update status</h2>
            <div className="mt-3">
              <OrderStatusControl orderId={order.id} currentStatus={order.status} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-heading text-base font-medium">Customer</h2>
            <div className="mt-3 flex flex-col gap-2.5 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <a
                href={`tel:${order.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-3.5" />
                {order.phone}
              </a>
              {order.email && (
                <a
                  href={`mailto:${order.email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3.5" />
                  {order.email}
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-heading text-base font-medium">Payment</h2>
            <div className="mt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
