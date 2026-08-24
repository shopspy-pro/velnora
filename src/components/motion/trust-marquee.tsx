"use client";

import { Banknote, Clock, Lock, MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustBadge {
  id: string;
  label: string;
}

const BADGE_ICONS = {
  shipping: Truck,
  cod: Banknote,
  returns: RotateCcw,
  secure: ShieldCheck,
  ssl: Lock,
  wear: Clock,
  emirates: MapPin,
} as const;

const DEFAULT_BADGES: TrustBadge[] = [
  { id: "shipping", label: "Free UAE Shipping" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "30-Day Returns" },
  { id: "secure", label: "Secure Checkout" },
  { id: "ssl", label: "SSL Protected" },
  { id: "wear", label: "Up to 12 Hours Wear" },
  { id: "emirates", label: "All 7 Emirates" },
];

/**
 * Frosted-glass marquee strip, adapted from a glassmorphism hero pattern —
 * reads correctly here because this section sits on a dark background.
 * Shows Velnora's actual trust signals, not fabricated stats.
 */
export function TrustMarquee({
  className,
  badges = DEFAULT_BADGES,
}: {
  className?: string;
  badges?: TrustBadge[];
}) {
  const items = badges.map((b) => ({
    icon: BADGE_ICONS[b.id as keyof typeof BADGE_ICONS] ?? ShieldCheck,
    label: b.label,
  }));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-5 backdrop-blur-xl",
        className
      )}
    >
      <div
        className="flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="animate-marquee flex shrink-0 gap-10 whitespace-nowrap px-5">
          {[...items, ...items].map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              aria-hidden={i >= items.length}
              className="flex items-center gap-2 text-brand-sand-100/70 transition-colors hover:text-brand-sand-50"
            >
              <Icon className="size-4 shrink-0 text-brand-bronze-400" strokeWidth={1.75} />
              <span className="text-sm font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
