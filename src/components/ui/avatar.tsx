import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-brand-emerald-900 text-brand-sand-50",
  "bg-brand-bronze-600 text-brand-stone-900",
  "bg-brand-emerald-100 text-brand-emerald-900",
  "bg-brand-sand-300 text-brand-stone-900",
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function getToneIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return Math.abs(hash);
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-heading text-sm font-medium",
        PALETTE[getToneIndex(name)],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
