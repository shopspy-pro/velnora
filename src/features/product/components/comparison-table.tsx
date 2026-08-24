import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { COMPARISON_ROWS as STATIC_COMPARISON_ROWS } from "@/features/product/data/product";
import { cn } from "@/lib/utils";
import type { ComparisonRow } from "@/types/product";

const STATIC_COLUMNS = { velnora: "Flexi Knee Patches", patches: "Generic Patches", pills: "Oral Pain Relief" };

function Cell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn(
          "mx-auto size-5",
          highlight ? "text-brand-emerald-900" : "text-muted-foreground"
        )}
      />
    ) : (
      <X className="mx-auto size-5 text-muted-foreground/50" />
    );
  }
  return (
    <span
      className={cn(
        "text-sm",
        highlight ? "font-medium text-brand-emerald-900" : "text-muted-foreground"
      )}
    >
      {value}
    </span>
  );
}

export function ComparisonTable({
  columns = STATIC_COLUMNS,
  rows = STATIC_COMPARISON_ROWS,
}: {
  columns?: { velnora: string; patches: string; pills: string };
  rows?: ComparisonRow[];
}) {
  return (
    <Section>
      <SectionHeading eyebrow="How it compares" title="Why people switch to Velnora" />
      <FadeIn className="mt-10 overflow-hidden rounded-2xl border border-border shadow-soft">
        <div className="scroll-fade-x no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-muted/95 p-4 text-sm font-medium text-muted-foreground backdrop-blur-sm"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="relative bg-brand-emerald-900/5 p-4 text-center font-heading text-sm font-medium text-brand-emerald-900"
                >
                  <span className="mb-1 inline-block rounded-full bg-brand-bronze-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-stone-900">
                    Recommended
                  </span>
                  <span className="shimmer block">{columns.velnora}</span>
                </th>
                <th scope="col" className="p-4 text-center text-sm font-medium text-muted-foreground">
                  {columns.patches}
                </th>
                <th scope="col" className="p-4 text-center text-sm font-medium text-muted-foreground">
                  {columns.pills}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "group transition-colors hover:bg-muted/30",
                    index !== rows.length - 1 && "border-b border-border"
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-background p-4 text-left text-sm font-normal transition-colors group-hover:bg-muted"
                  >
                    {row.feature}
                  </th>
                  <td className="bg-brand-emerald-100/30 p-4 text-center">
                    <Cell value={row.velnora} highlight />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.patches} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.pills} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </Section>
  );
}
