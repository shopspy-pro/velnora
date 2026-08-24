import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "emerald" | "bronze" | "destructive";
  className?: string;
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-muted text-foreground",
    emerald: "bg-brand-emerald-100 text-brand-emerald-900",
    bronze: "bg-brand-bronze-100 text-brand-bronze-600",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft",
        className
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          toneClasses[tone]
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-heading text-xl font-medium tabular-nums">{value}</p>
      </div>
    </div>
  );
}
