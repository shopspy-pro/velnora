import { Flame, Footprints, Shirt, Sparkles, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { cn } from "@/lib/utils";
import type { Benefit } from "@/types/product";

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Shirt,
  Footprints,
  Sparkles,
};

const BENTO_SPAN = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
];

export function BenefitsGrid({ benefits }: { benefits: Benefit[] }) {
  return (
    <Section id="benefits">
      <SectionHeading
        eyebrow="Why Velnora"
        title="Built around real days, not routines"
        description="No devices, no downtime — just quiet comfort that fits into whatever your day looks like."
      />
      <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {benefits.map((benefit, index) => {
          const Icon = ICON_MAP[benefit.icon] ?? Sparkles;
          const isFeatured = index === 0;
          return (
            <StaggerItem
              key={benefit.id}
              className={cn(
                "group relative flex flex-col justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-emerald-700/40 hover:shadow-elevated",
                BENTO_SPAN[index],
                isFeatured && "lg:p-8"
              )}
            >
              {isFeatured && (
                <AmbientBackground variant="sand" className="opacity-70" />
              )}
              <span
                className={cn(
                  "relative flex shrink-0 items-center justify-center rounded-full bg-brand-emerald-100 text-brand-emerald-900 transition-transform duration-300 group-hover:scale-105",
                  isFeatured ? "size-14" : "size-11"
                )}
              >
                <Icon className={isFeatured ? "size-6" : "size-5"} strokeWidth={1.5} />
              </span>
              <h3
                className={cn(
                  "relative font-heading font-medium",
                  isFeatured ? "text-2xl" : "text-base"
                )}
              >
                {benefit.title}
              </h3>
              <p
                className={cn(
                  "relative text-muted-foreground",
                  isFeatured ? "max-w-xs text-base" : "text-sm"
                )}
              >
                {benefit.description}
              </p>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </Section>
  );
}
