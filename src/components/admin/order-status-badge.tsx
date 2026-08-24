import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/admin/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-brand-emerald-100 text-brand-emerald-900 border-transparent",
  confirmed: "bg-blue-100 text-blue-800 border-transparent",
  processing: "bg-brand-bronze-100 text-brand-bronze-600 border-transparent",
  shipped: "bg-purple-100 text-purple-800 border-transparent",
  delivered: "bg-brand-emerald-900 text-brand-sand-50 border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn("font-medium", STATUS_STYLES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
