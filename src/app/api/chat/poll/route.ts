import { NextResponse } from "next/server";
import { getConversationBySessionId, getConversationMessages } from "@/lib/chat/store";

/**
 * Lets the widget pick up messages an admin sent from the inbox without the
 * customer needing to type anything — polled only while a conversation is
 * ai_paused (i.e. a human has taken over). sessionId is a random,
 * unguessable value generated client-side and never shown anywhere else,
 * same trust model as an order-tracking number.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const conversation = await getConversationBySessionId(sessionId);
  if (!conversation) {
    return NextResponse.json({ messages: [], aiPaused: false });
  }

  const messages = await getConversationMessages(conversation.id);

  return NextResponse.json({
    aiPaused: conversation.aiPaused,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });
}
