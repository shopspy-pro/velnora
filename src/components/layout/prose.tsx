import { cn } from "@/lib/utils";

export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl px-4 py-16 md:px-6 md:py-24",
        "[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-medium [&_h1]:md:text-4xl",
        "[&_h2]:font-heading [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-medium",
        "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_ul]:space-y-1.5",
        "[&_a]:text-brand-emerald-900 [&_a]:underline [&_a]:underline-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
