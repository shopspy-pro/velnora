"use client";

import { useState, type FormEvent } from "react";
import { PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/constants";

interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { label: string; quantity: number; subtotal: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Order received",
  pending: "Order received",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <PackageSearch className="size-10 text-brand-emerald-900" strokeWidth={1.25} />
        <h1 className="font-heading text-2xl font-medium md:text-3xl">
          Track your order
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your order number and the phone number used at checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            required
            placeholder="VEL-XXXXXX"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            required
            type="tel"
            placeholder="+971 5X XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit" variant="premium" size="xl" loading={isLoading}>
          Track order
        </Button>
      </form>

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {order && (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-medium">
              {order.orderNumber}
            </span>
            <span className="rounded-full bg-brand-emerald-100 px-3 py-1 text-xs font-medium text-brand-emerald-900">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.label} × {item.quantity}
                </span>
                <span>{formatAED(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border pt-3 text-sm font-medium">
            <span>Total</span>
            <span>{formatAED(order.total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"} ·{" "}
            {order.paymentStatus}
          </p>
        </div>
      )}
    </div>
  );
}
