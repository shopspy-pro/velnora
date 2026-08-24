import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getConversations } from "@/lib/admin/queries";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function AdminInboxPage() {
  const conversations = await getConversations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Conversations from the website chat widget. Customer messages are auto-translated to
          English — your replies are auto-translated back into their language and polished
          before sending.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/admin/inbox/${c.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-brand-emerald-700/50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-emerald-100 text-brand-emerald-900">
              <MessageCircle className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {c.customerLanguage ? `Customer (${c.customerLanguage})` : "Customer"}
                </p>
                {c.aiPaused ? (
                  <span className="rounded-full bg-brand-bronze-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-bronze-600">
                    You&apos;re handling this
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    AI handling
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.lastMessagePreview ?? "No messages yet."}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(c.lastMessageAt)}
            </span>
          </Link>
        ))}
        {conversations.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-soft">
            No conversations yet. They&apos;ll appear here as customers use the chat widget on
            the website.
          </div>
        )}
      </div>
    </div>
  );
}
