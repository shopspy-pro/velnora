import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div
        className={cn(
          "mx-auto max-w-6xl px-4 md:px-6",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "mx-auto max-w-2xl text-center items-center"
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-bronze-600">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-3xl font-medium text-balance md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-balance text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
