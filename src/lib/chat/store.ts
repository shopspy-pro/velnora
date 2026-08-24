import { createServiceClient } from "@/lib/supabase/server";
import { translateForAdmin, translateReplyForCustomer } from "@/lib/gemini/server";
import type {
  ChatConversationRow,
  ChatMessageRow,
} from "@/lib/supabase/types";

export interface ChatConversation {
  id: string;
  sessionId: string;
  customerLanguage: string | null;
  aiPaused: boolean;
  status: "open" | "closed";
  createdAt: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "customer" | "ai" | "admin";
  body: string;
  translatedBody: string | null;
  createdAt: string;
}

function mapConversation(row: ChatConversationRow): ChatConversation {
  return {
    id: row.id,
    sessionId: row.session_id,
    customerLanguage: row.customer_language,
    aiPaused: row.ai_paused,
    status: row.status,
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
  };
}

function mapMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    body: row.body,
    translatedBody: row.translated_body,
    createdAt: row.created_at,
  };
}

export async function getOrCreateConversation(
  sessionId: string
): Promise<ChatConversation> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return mapConversation(existing as ChatConversationRow);
  }

  const { data: created, error } = await supabase
    .from("chat_conversations")
    .insert({ session_id: sessionId })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error("Failed to create chat conversation.");
  }

  return mapConversation(created as ChatConversationRow);
}

/**
 * Saves the customer's message and translates it to English in the same
 * step, so the admin inbox always has a readable gloss without a separate
 * on-demand action. Also updates the conversation's detected language,
 * which later drives the target language for admin replies.
 */
export async function saveCustomerMessage(
  conversation: ChatConversation,
  text: string
): Promise<{ message: ChatMessage; language: string }> {
  const supabase = createServiceClient();
  const { language, translatedToEnglish } = await translateForAdmin(text);

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversation.id,
      sender: "customer",
      body: text,
      translated_body: translatedToEnglish,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Failed to save customer message.");
  }

  await supabase
    .from("chat_conversations")
    .update({ customer_language: language, last_message_at: new Date().toISOString() })
    .eq("id", conversation.id);

  return { message: mapMessage(data as ChatMessageRow), language };
}

export async function saveAiMessage(
  conversationId: string,
  text: string
): Promise<ChatMessage> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender: "ai", body: text })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Failed to save AI message.");
  }

  await supabase
    .from("chat_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return mapMessage(data as ChatMessageRow);
}

/**
 * Admin's reply gets rewritten into the customer's detected language
 * (falling back to English if none was ever detected) before it's stored —
 * the widget only ever displays the polished, translated version. Marks
 * the conversation as ai_paused so the AI stops auto-replying once a human
 * has stepped in.
 */
export async function saveAdminReply(
  conversation: ChatConversation,
  rawText: string
): Promise<ChatMessage> {
  const supabase = createServiceClient();
  const targetLanguage = conversation.customerLanguage || "English";
  const polished = await translateReplyForCustomer(rawText, targetLanguage);

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversation.id, sender: "admin", body: polished })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Failed to save admin reply.");
  }

  await supabase
    .from("chat_conversations")
    .update({ ai_paused: true, last_message_at: new Date().toISOString() })
    .eq("id", conversation.id);

  return mapMessage(data as ChatMessageRow);
}

export async function setAiPaused(
  conversationId: string,
  paused: boolean
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("chat_conversations")
    .update({ ai_paused: paused })
    .eq("id", conversationId);
}

export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as ChatMessageRow[]).map(mapMessage);
}

export async function getConversationBySessionId(
  sessionId: string
): Promise<ChatConversation | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  return data ? mapConversation(data as ChatConversationRow) : null;
}

export async function getConversationById(
  id: string
): Promise<ChatConversation | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ? mapConversation(data as ChatConversationRow) : null;
}
