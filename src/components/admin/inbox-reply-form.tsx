"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendAdminReplyAction, resumeAiAction } from "@/lib/admin/actions";

export function InboxReplyForm({
  conversationId,
  aiPaused,
  customerLanguage,
}: {
  conversationId: string;
  aiPaused: boolean;
  customerLanguage: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    const text = draft.trim();
    if (!text || isPending) return;

    startTransition(async () => {
      const result = await sendAdminReplyAction(conversationId, text);
      if (result.success) {
        setDraft("");
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to send reply.");
      }
    });
  }

  function handleResumeAi() {
    startTransition(async () => {
      const result = await resumeAiAction(conversationId);
      if (result.success) {
        toast.success(result.message ?? "AI resumed.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <p className="text-xs text-muted-foreground">
        Type in any language or style — it&apos;ll be translated into{" "}
        <span className="font-medium">{customerLanguage ?? "the customer's language"}</span> and
        polished into a professional message before sending.
      </p>
      <div className="flex items-end gap-2">
        <textarea
          className="h-20 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Type your reply…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isPending}
        />
        <Button
          variant="premium"
          size="icon-lg"
          aria-label="Send reply"
          disabled={isPending || !draft.trim()}
          onClick={handleSend}
        >
          <Send />
        </Button>
      </div>
      {aiPaused && (
        <button
          type="button"
          className="self-start text-xs font-medium text-brand-emerald-900 hover:underline"
          onClick={handleResumeAi}
          disabled={isPending}
        >
          Hand this conversation back to the AI
        </button>
      )}
    </div>
  );
}
