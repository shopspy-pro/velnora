"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  setReviewPublishedAction,
  setReviewVerifiedAction,
  deleteReviewAction,
} from "@/lib/admin/actions";

export function ReviewRowActions({
  reviewId,
  isPublished,
  isVerifiedPurchase,
}: {
  reviewId: string;
  isPublished: boolean;
  isVerifiedPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ success: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        if (result.message) toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={isPublished ? "Hide review" : "Approve and publish review"}
        disabled={isPending}
        onClick={() => run(() => setReviewPublishedAction(reviewId, !isPublished))}
      >
        {isPublished ? <EyeOff /> : <Eye />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={isVerifiedPurchase ? "Unmark verified purchase" : "Mark verified purchase"}
        disabled={isPending}
        onClick={() => run(() => setReviewVerifiedAction(reviewId, !isVerifiedPurchase))}
      >
        {isVerifiedPurchase ? <ShieldCheck className="text-brand-emerald-900" /> : <ShieldOff />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete review"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this review permanently?")) {
            run(() => deleteReviewAction(reviewId));
          }
        }}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}
