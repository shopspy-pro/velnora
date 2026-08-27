import { NextResponse } from "next/server";
import { z } from "zod";
import { askVelnoraAssistant, ChatNotConfiguredError, type ChatMessage } from "@/lib/gemini/server";
import { getOrCreateConversation, saveAiMessage, saveCustomerMessage } from "@/lib/chat/store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

const requestSchema = z.object({
  message: z.string().trim().min(1, "Message can't be empty.").max(2000),
  history: z.array(messageSchema).max(20).optional(),
  sessionId: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  // Every message here costs a Gemini API call — cap it per IP so the
  // widget can't be scripted into running up the bill or DoS-ing the key.
  const ip = getClientIp(request.headers);
  if (!rateLimit(`chat:${ip}`, 20, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down a bit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const conversation = await getOrCreateConversation(parsed.data.sessionId);
    await saveCustomerMessage(conversation, parsed.data.message);

    if (conversation.aiPaused) {
      // A human admin has taken over this conversation — the widget will
      // pick up their reply via polling instead of getting an AI answer.
      return NextResponse.json({ reply: null, awaitingAdmin: true });
    }

    const reply = await askVelnoraAssistant(
      parsed.data.message,
      (parsed.data.history ?? []) as ChatMessage[]
    );
    await saveAiMessage(conversation.id, reply);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof ChatNotConfiguredError) {
      return NextResponse.json(
        { error: "not_configured", message: "Live chat isn't set up yet." },
        { status: 503 }
      );
    }
    console.error("chat request failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }
}
