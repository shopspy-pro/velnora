import { cn } from "@/lib/utils";

/**
 * Crisp, layered rounded-shape backdrop (not blurred, unlike AmbientBackground)
 * — the "organic pill/blob pattern behind the product" look common in
 * premium skincare hero sections. Purely decorative.
 */
export function HeroShapes({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <div className="absolute right-[6%] top-[8%] size-[62%] rounded-[45%_55%_60%_40%/55%_45%_55%_45%] bg-brand-sage-100" />
      <div className="absolute right-[18%] bottom-[6%] size-[38%] rounded-[60%_40%_45%_55%/45%_55%_40%_60%] bg-brand-emerald-100/70" />
      <div className="absolute right-[2%] bottom-[18%] size-[20%] rounded-full bg-brand-bronze-100" />
    </div>
  );
}
