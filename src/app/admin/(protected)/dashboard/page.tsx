import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Loader,
  Truck,
  CheckCircle2,
  XCircle,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { getDashboardStats, getAnalytics } from "@/lib/admin/queries";
import { StatCard } from "@/components/admin/stat-card";
import { MiniBarChart } from "@/components/admin/charts";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatAED } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const [stats, analytics] = await Promise.all([getDashboardStats(), getAnalytics()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of how Velnora is doing right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total orders" value={stats.totalOrders} icon={ShoppingBag} tone="emerald" />
        <StatCard label="Total revenue" value={formatAED(stats.totalRevenue)} icon={Wallet} tone="bronze" />
        <StatCard label="New" value={stats.newOrders} icon={Clock} />
        <StatCard label="Confirmed" value={stats.confirmedOrders} icon={CheckCircle2} />
        <StatCard label="Processing" value={stats.processingOrders} icon={Loader} />
        <StatCard label="Shipped" value={stats.shippedOrders} icon={Truck} />
        <StatCard label="Delivered" value={stats.deliveredOrders} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Cancelled" value={stats.cancelledOrders} icon={XCircle} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-medium">Orders, last 14 days</h2>
          <div className="mt-4">
            <MiniBarChart
              data={analytics.dailySeries.map((d) => ({
                label: d.date.slice(5),
                value: d.orders,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-medium">Recent orders</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {stats.recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium tabular-nums">{formatAED(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
            {stats.recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </ul>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-emerald-900 hover:underline"
          >
            View all orders
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
