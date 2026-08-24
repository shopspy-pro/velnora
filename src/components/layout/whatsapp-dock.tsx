"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStorefrontConfigStore } from "@/features/product/store/storefront-config-store";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! Ask me anything about Flexi Knee Patches — sizing, pricing, shipping, anything.",
};

const SESSION_STORAGE_KEY = "velnora-chat-session";
const POLL_INTERVAL_MS = 4000;

function buildWhatsAppUrl(whatsapp: string, message?: string) {
  const phone = whatsapp.replace(/[^0-9]/g, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${params}`;
}

/**
 * Floating "Chat with Velnora" widget. Customer messages get an automatic
 * AI reply (via /api/chat → Gemini, grounded in real product/FAQ/shipping
 * data) in whatever language they wrote in. A WhatsApp button stays
 * available at all times for reaching a human — this never replaces that,
 * only adds an instant first line of support on top of it.
 *
 * Every message is also persisted server-side under a per-browser
 * sessionId so an admin can take the conversation over from the inbox —
 * once they do, the AI stops auto-replying and this widget instead polls
 * for the admin's (auto-translated, already in the customer's language)
 * reply while the panel is open.
 */
export function WhatsAppDock() {
  const whatsapp = useStorefrontConfigStore((state) => state.whatsapp);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const shownAdminMessageIds = useRef<Set<string>>(new Set());
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
    }
  }, [messages, isOpen, isSending]);

  // While the panel is open, poll for messages an admin sent from the
  // inbox — this is the only way the widget learns about them, since a
  // human's reply can arrive minutes after the customer's last message.
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    async function poll() {
      try {
        const res = await fetch(`/api/chat/poll?sessionId=${encodeURIComponent(sessionId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const adminMessages = (data.messages ?? []).filter(
          (m: { id: string; sender: string }) =>
            m.sender === "admin" && !shownAdminMessageIds.current.has(m.id)
        );
        if (adminMessages.length === 0) return;

        adminMessages.forEach((m: { id: string }) => shownAdminMessageIds.current.add(m.id));
        setMessages((prev) => [
          ...prev,
          ...adminMessages.map((m: { body: string }) => ({
            role: "assistant" as const,
            content: m.body,
          })),
        ]);
      } catch {
        // Silent — polling failures aren't worth surfacing to the customer.
      }
    }

    void poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  function openDock() {
    setIsOpen(true);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || isSending || !sessionId) {
      openDock();
      return;
    }

    const history = messages;
    const nextMessages = [...history, { role: "user", content: text } satisfies ChatMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.filter((m) => m !== GREETING),
          sessionId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "not_configured") {
          setNotConfigured(true);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data?.error ?? "Something went wrong. Please try WhatsApp instead." },
          ]);
        }
        return;
      }

      // awaitingAdmin: a human has already taken this conversation over,
      // so there's no AI reply to show — the polling effect above will
      // pick up their answer once sent.
      if (data.awaitingAdmin) return;

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Couldn't reach us right now — please try WhatsApp instead." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isOpen) {
      sendMessage();
      return;
    }
    openDock();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    sendMessage();
  }

  return (
    <form
      className="fixed bottom-24 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] md:right-6"
      onSubmit={handleSubmit}
    >
      <div className="flex w-full flex-col-reverse overflow-hidden rounded-2xl bg-brand-emerald-900 p-2 text-brand-sand-50 shadow-elevated">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand-50/10"
          >
            <MessageCircle className="size-4.5 text-brand-bronze-400" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">
              Chat with Velnora
            </p>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 truncate text-xs text-brand-sand-100/60"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                key={isSending ? "sending" : isOpen ? "open" : "idle"}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {isSending ? "Typing…" : isOpen ? "Ask about sizing, delivery, anything" : "Usually replies instantly"}
              </motion.p>
            </AnimatePresence>
          </div>
          {isOpen && (
            <a
              href={buildWhatsAppUrl(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with a human on WhatsApp"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-brand-sand-100/70 transition-colors hover:bg-white/10 hover:text-brand-sand-50"
              title="Chat with a human on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.486 2 2.01 6.476 2.01 11.994c0 1.995.575 3.85 1.564 5.417L2.01 22l4.703-1.542a9.943 9.943 0 0 0 5.29 1.532h.004c5.518 0 9.993-4.476 9.993-9.994C22 6.478 17.522 2 12.004 2Zm0 18.14a8.16 8.16 0 0 1-4.163-1.143l-.298-.177-2.79.914.914-2.72-.194-.28a8.15 8.15 0 0 1-1.259-4.34c0-4.51 3.671-8.181 8.194-8.181 4.514 0 8.187 3.67 8.187 8.183 0 4.512-3.673 8.183-8.191 8.183Z" />
              </svg>
            </a>
          )}
          <button
            aria-label={isOpen ? "Send message" : "Open chat"}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-bronze-600 text-brand-stone-900 transition-colors hover:bg-brand-bronze-400 disabled:opacity-60"
            type="submit"
            disabled={isSending}
          >
            {isOpen ? (
              <Send className="size-4" strokeWidth={2} />
            ) : (
              <MessageCircle className="size-4" strokeWidth={2} />
            )}
          </button>
        </div>

        <motion.div
          animate={{
            height: isOpen ? 380 : 0,
            opacity: isOpen ? 1 : 0,
          }}
          aria-hidden={!isOpen}
          className="overflow-hidden"
          initial={false}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mb-2 flex h-[372px] flex-col">
            <button
              aria-label="Close chat"
              className="absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-md text-brand-sand-100/60 hover:bg-white/10 hover:text-brand-sand-50"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-3.5" strokeWidth={2.25} />
            </button>

            <div
              ref={threadRef}
              className="flex-1 space-y-2.5 overflow-y-auto px-2 pt-1 pb-2"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug",
                    msg.role === "user"
                      ? "ml-auto bg-brand-bronze-600 text-brand-stone-900"
                      : "bg-white/10 text-brand-sand-50"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isSending && (
                <div className="flex w-fit items-center gap-1 rounded-xl bg-white/10 px-3 py-2.5">
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-sand-100/70 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-sand-100/70 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-sand-100/70" />
                </div>
              )}
              {notConfigured && (
                <div className="rounded-xl bg-brand-bronze-400/10 px-3 py-2.5 text-xs text-brand-sand-100/80 ring-1 ring-brand-bronze-400/30">
                  Live chat isn&apos;t set up yet — tap the WhatsApp icon above to reach us directly.
                </div>
              )}
            </div>

            <textarea
              aria-label="Message for Velnora"
              className="h-14 w-full shrink-0 resize-none border-t border-white/10 bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-brand-sand-100/40"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask about sizing, delivery, anything…"
              ref={textareaRef}
              value={draft}
              disabled={isSending}
            />
          </div>
        </motion.div>
      </div>
    </form>
  );
}
