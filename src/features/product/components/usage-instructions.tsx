import { Section, SectionHeading } from "@/components/layout/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { USAGE_STEPS as STATIC_USAGE_STEPS } from "@/features/product/data/product";
import type { UsageStep } from "@/types/product";

export function UsageInstructions({
  steps = STATIC_USAGE_STEPS,
}: {
  steps?: UsageStep[];
}) {
  return (
    <Section className="bg-white">
      <SectionHeading eyebrow="Getting started" title="How to apply" />
      <StaggerGroup
        as="ol"
        className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step, index) => (
          <StaggerItem
            key={step.step}
            as="li"
            className="relative flex flex-col gap-3 pl-6 lg:border-l lg:border-border lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
          >
            <span className="font-heading text-[2.75rem] leading-none font-light tracking-tight text-brand-bronze-600/70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-lg font-medium">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  );
}
