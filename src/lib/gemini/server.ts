import {
  getStorefrontContent,
  getStorefrontFaqs,
  getStorefrontPackages,
  getStorefrontShipping,
  getStorefrontContactInfo,
} from "@/lib/storefront-data";
import { SITE, formatAED } from "@/lib/constants";

const GEMINI_MODEL = "gemini-3.6-flash";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ChatNotConfiguredError extends Error {}

/**
 * Builds the assistant's system instruction from CURRENT store data (same
 * source the admin panel edits) so it never answers with stale prices or
 * made-up policies — and instructs it to always reply in whatever language
 * the customer just used, so translation is implicit rather than a
 * separate step.
 */
async function buildSystemInstruction(): Promise<string> {
  const [content, tiers, faqs, shipping, contactInfo] = await Promise.all([
    getStorefrontContent(),
    getStorefrontPackages(),
    getStorefrontFaqs(),
    getStorefrontShipping(),
    getStorefrontContactInfo(),
  ]);

  const tierLines = tiers
    .map((t) => `- ${t.label}: ${formatAED(t.price)} (was ${formatAED(t.compareAtPrice)}), ${t.units * t.patchesPerUnit} patches total${t.isPopular ? " — most popular" : ""}`)
    .join("\n");

  const faqLines = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  const shippingLine = shipping.uaeShippingFee === 0
    ? "Free shipping across the UAE."
    : `UAE shipping fee: ${formatAED(shipping.uaeShippingFee)}${shipping.freeShippingThreshold ? `, free above ${formatAED(shipping.freeShippingThreshold)}` : ""}.`;
  const codLine = shipping.codEnabled
    ? "Cash on Delivery is available."
    : "Cash on Delivery is currently unavailable — card payment only.";

  return `You are the friendly customer support assistant for ${SITE.name}, an online store in the UAE selling one product: Flexi Knee Patches.

PRODUCT
${content.heroHeading} — ${content.heroDescription}

PACK SIZES & PRICING (always quote these exact prices, never estimate)
${tierLines}

WHY CUSTOMERS LIKE IT
${content.benefits.map((b) => `- ${b.title}: ${b.description}`).join("\n")}

SHIPPING & PAYMENT
${shippingLine} ${codLine}

GUARANTEE
${content.guaranteeTitle} — ${content.guaranteeDescription}

FREQUENTLY ASKED QUESTIONS
${faqLines}

CONTACT FOR ANYTHING YOU CAN'T ANSWER
Email: ${contactInfo.email} · WhatsApp: ${contactInfo.whatsapp} · Hours: ${contactInfo.hours}

RULES
- Only answer questions about ${SITE.name}, Flexi Knee Patches, orders, shipping, returns, or this conversation. If asked something unrelated, politely redirect to the product or suggest contacting support.
- Never invent prices, policies, or facts not listed above. If you don't know, say so and point to WhatsApp/email.
- Keep replies short and warm — 2-4 sentences, no bullet lists unless truly helpful.
- CRITICAL: Always reply in the same language the customer's latest message is written in, even if earlier messages were in a different language. Match their language exactly (e.g. Urdu, Hindi, Arabic, English, French, etc.) — this includes Roman/transliterated script if that's what they used.
- Do not mention that you are an AI or a language model unless directly asked.`;
}

async function callGemini(
  contents: { role: string; parts: { text: string }[] }[],
  systemInstructionText: string,
  maxOutputTokens = 2048
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ChatNotConfiguredError("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstructionText }] },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

  if (!text) {
    throw new Error("Gemini returned no text.");
  }

  return text.trim();
}

export async function askVelnoraAssistant(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const systemInstruction = await buildSystemInstruction();

  const contents = [
    ...history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  return callGemini(contents, systemInstruction, 2048);
}

export interface IncomingTranslation {
  language: string;
  translatedToEnglish: string;
}

/**
 * Used by the admin inbox so a human agent can read a customer's message
 * regardless of what language they wrote in. Always translates to English
 * (reliable target for any source language) and reports the detected
 * language name so the reply can later be translated back into it.
 */
export async function translateForAdmin(text: string): Promise<IncomingTranslation> {
  const instruction = `You translate short customer-support messages. Detect the language of the message and translate it into natural English.
Reply with EXACTLY two lines, nothing else:
LANGUAGE: <the language name, e.g. Urdu, Arabic, Hindi, English>
ENGLISH: <the English translation>`;

  const raw = await callGemini(
    [{ role: "user", parts: [{ text }] }],
    instruction,
    2048
  );

  const languageMatch = raw.match(/LANGUAGE:\s*(.+)/i);
  const englishMatch = raw.match(/ENGLISH:\s*([\s\S]+)/i);

  return {
    language: languageMatch?.[1]?.trim() || "English",
    translatedToEnglish: englishMatch?.[1]?.trim() || text,
  };
}

/**
 * Used when an admin sends a manual reply from the inbox: takes whatever
 * they typed (any language, any tone) and turns it into a polished,
 * professional message in the customer's own language, so the customer
 * always receives a clean reply regardless of how the admin drafted it.
 */
export async function translateReplyForCustomer(
  adminText: string,
  targetLanguage: string
): Promise<string> {
  const instruction = `You help a customer support agent send replies. Rewrite the agent's message into ${targetLanguage}: correct grammar, warm and professional tone, keep it concise. Preserve the original meaning and any prices/facts exactly — do not add or remove information. Reply with ONLY the rewritten message, nothing else (no labels, no quotes).`;

  return callGemini(
    [{ role: "user", parts: [{ text: adminText }] }],
    instruction,
    2048
  );
}
