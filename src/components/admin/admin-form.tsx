"use client";

import { useTransition, type ReactNode, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  className,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success(result.message ?? "Saved.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)}>
      {children}
      <Button type="submit" variant="premium" loading={isPending} className="w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
