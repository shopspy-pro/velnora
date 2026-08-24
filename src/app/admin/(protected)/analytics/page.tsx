import { Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { getAnalytics } from "@/lib/admin/queries";
import { StatCard } from "@/components/admin/stat-card";
import { MiniBarChart, MiniLineChart, DonutChart } from "@/components/admin/charts";
import { formatAED } from "@/lib/constants";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Calculated live from stored order data — no estimates.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total orders" value={analytics.totalOrders} icon={ShoppingBag} tone="emerald" />
        <StatCard label="Total revenue" value={formatAED(analytics.totalRevenue)} icon={Wallet} tone="bronze" />
        <StatCard
          label="Average order value"
          value={formatAED(Math.round(analytics.averageOrderValue))}
          icon={TrendingUp}
        />
        <StatCard
          label="Top package"
          value={analytics.mostSelectedPackage?.label ?? "—"}
          icon={Package}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-medium">Orders, last 14 days</h2>
          <div className="mt-4">
            <MiniBarChart
              data={analytics.dailySeries.map((d) => ({ label: d.date.slice(5), value: d.orders }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-medium">Revenue, last 14 days</h2>
          <div className="mt-4">
            <MiniLineChart
              data={analytics.dailySeries.map((d) => ({ label: d.date.slice(5), value: d.revenue }))}
              valuePrefix="AED "
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Delivered vs. cancelled</h2>
        <div className="mt-4">
          <DonutChart
            segments={[
              { label: "Delivered", value: analytics.deliveredVsCancelled.delivered, color: "var(--color-brand-emerald-900)" },
              { label: "Cancelled", value: analytics.deliveredVsCancelled.cancelled, color: "var(--color-destructive)" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
