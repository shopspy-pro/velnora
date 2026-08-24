import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-all duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-brand-emerald-700 focus-visible:ring-3 focus-visible:ring-brand-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
