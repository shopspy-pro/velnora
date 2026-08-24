import { Suspense } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/admin/queries";
import { OrdersFilterBar } from "@/components/admin/orders-filter-bar";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAED } from "@/lib/constants";
import type { OrderStatus } from "@/lib/admin/types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const orders = await getOrders({
    search: params.q,
    status: (params.status as OrderStatus | undefined) ?? "all",
    dateFrom: params.from,
    dateTo: params.to,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} found.
        </p>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <OrdersFilterBar />
      </Suspense>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="sr-only">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="max-w-[160px] truncate">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.phone}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm capitalize">{order.paymentMethod}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatAED(order.total)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-brand-emerald-900 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No orders match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
