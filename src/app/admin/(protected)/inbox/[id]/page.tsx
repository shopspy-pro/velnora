import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getConversationDetail } from "@/lib/admin/queries";
import { InboxReplyForm } from "@/components/admin/inbox-reply-form";
import { cn } from "@/lib/utils";

export default async function AdminInboxConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversationDetail(id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/inbox"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to inbox
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-medium">
              {conversation.customerLanguage
                ? `Customer (${conversation.customerLanguage})`
                : "Customer"}
            </h1>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
              conversation.aiPaused
                ? "bg-brand-bronze-100 text-brand-bronze-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {conversation.aiPaused ? "You're handling this" : "AI handling"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-snug",
                m.sender === "customer"
                  ? "bg-muted"
                  : m.sender === "admin"
                    ? "ml-auto bg-brand-emerald-900 text-brand-sand-50"
                    : "ml-auto bg-brand-bronze-100"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
                {m.sender === "customer" ? "Customer" : m.sender === "admin" ? "You" : "AI"}
              </p>
              <p className="mt-0.5">{m.body}</p>
              {m.sender === "customer" && m.translatedBody && m.translatedBody !== m.body && (
                <p className="mt-1.5 border-t border-black/10 pt-1.5 text-xs italic text-muted-foreground">
                  English: {m.translatedBody}
                </p>
              )}
            </div>
          ))}
          {conversation.messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
        </div>

        <InboxReplyForm
          conversationId={conversation.id}
          aiPaused={conversation.aiPaused}
          customerLanguage={conversation.customerLanguage}
        />
      </div>
    </div>
  );
}
