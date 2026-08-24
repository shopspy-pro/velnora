"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { destroyAdminSession, getAdminSession } from "./session";
import { getConversationById, saveAdminReply, setAiPaused } from "@/lib/chat/store";
import type {
  FaqItemRow,
  MediaAssetRow,
  MediaSection,
  OrderRow,
  PackageUpdate,
  ProductUpdate,
  SettingsRow,
} from "@/lib/supabase/types";
import type { OrderStatus, ShippingSettings, SiteContent, StoreSettings } from "./types";

export interface ActionResult {
  success: boolean;
  message?: string;
}

const UNAUTHORIZED: ActionResult = {
  success: false,
  message: "Your session has expired. Please log in again.",
};

/**
 * Defense in depth: proxy.ts already blocks unauthenticated requests from
 * ever reaching an /admin/* page, but every mutation re-checks the session
 * independently here too, so these Server Actions stay safe even if they're
 * ever invoked from somewhere the proxy matcher doesn't cover.
 */
async function requireAdmin(): Promise<ActionResult | null> {
  const session = await getAdminSession();
  return session ? null : UNAUTHORIZED;
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- Orders

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { error, count } = await supabase
    .from("orders")
    .update({ status }, { count: "exact" })
    .eq("id", orderId);

  if (error) {
    return { success: false, message: "Failed to update order status." };
  }
  if (!count) {
    return { success: false, message: "Order not found." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/analytics");
  return { success: true, message: `Order marked as ${status}.` };
}

// --------------------------------------------------------------- Product

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const basePrice = Number(formData.get("basePrice"));
  const stockStatus = String(formData.get("stockStatus") ?? "in_stock");
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name || !description || Number.isNaN(basePrice)) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const update: ProductUpdate = {
    name,
    description,
    base_price: basePrice,
    stock_status: stockStatus as ProductUpdate["stock_status"],
    is_available: isAvailable,
  };

  const { error } = await supabase
    .from("products")
    .update(update)
    .eq("id", "flexi-knee-patches");

  if (error) {
    return { success: false, message: "Failed to update product." };
  }

  revalidatePath("/admin/product");
  revalidatePath("/");
  return { success: true, message: "Product updated." };
}

// -------------------------------------------------------------- Packages

export async function updatePackageAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, message: "Package not found." };

  const name = String(formData.get("name") ?? "").trim();
  const units = Number(formData.get("units"));
  const price = Number(formData.get("price"));
  const compareAtPrice = Number(formData.get("compareAtPrice"));
  const badgeRaw = String(formData.get("badge") ?? "").trim();
  const isPopular = formData.get("isPopular") === "on";
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name || Number.isNaN(units) || Number.isNaN(price) || Number.isNaN(compareAtPrice)) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const update: PackageUpdate = {
    name,
    units,
    price,
    compare_at_price: compareAtPrice,
    badge: badgeRaw || null,
    is_popular: isPopular,
    is_available: isAvailable,
  };

  const { error, count } = await supabase
    .from("packages")
    .update(update, { count: "exact" })
    .eq("id", id);
  if (error) {
    return { success: false, message: "Failed to update package." };
  }
  if (!count) {
    return { success: false, message: "Package not found." };
  }

  // Only one package can be "Most Popular" at a time.
  if (isPopular) {
    await supabase.from("packages").update({ is_popular: false }).neq("id", id);
  }

  revalidatePath("/admin/packages");
  revalidatePath("/");
  revalidatePath("/checkout");
  return { success: true, message: `${name} updated.` };
}

// --------------------------------------------------------------- Content

async function getSiteContentValue(): Promise<SiteContent> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("key", "homepage")
    .maybeSingle();
  if (error || !data) {
    throw new Error("site_content row missing");
  }
  return (data as SettingsRow).value as unknown as SiteContent;
}

export async function updateSiteContentAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const current = await getSiteContentValue();

  const heroHeading = String(formData.get("heroHeading") ?? "").trim();
  const heroDescription = String(formData.get("heroDescription") ?? "").trim();
  const heroCtaText = String(formData.get("heroCtaText") ?? "").trim();
  const trustMessages = String(formData.get("trustMessages") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const howItWorksIntro = String(formData.get("howItWorksIntro") ?? "").trim();
  const guaranteeTitle = String(formData.get("guaranteeTitle") ?? "").trim();
  const guaranteeDescription = String(formData.get("guaranteeDescription") ?? "").trim();

  const next: SiteContent = {
    ...current,
    heroHeading,
    heroDescription,
    heroCtaText,
    trustMessages,
    howItWorksIntro,
    guaranteeTitle,
    guaranteeDescription,
  };

  const { error } = await supabase
    .from("site_content")
    .update({ value: next })
    .eq("key", "homepage");

  if (error) {
    return { success: false, message: "Failed to update homepage content." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Homepage content updated." };
}

export async function updateVideoContentAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const current = await getSiteContentValue();

  const source = String(formData.get("source") ?? "youtube") as "youtube" | "upload";
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const file = formData.get("file");

  let uploadUrl = current.video?.uploadUrl ?? "";

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("video/")) {
      return { success: false, message: "Only video files are allowed." };
    }
    const ext = file.name.split(".").pop() || "mp4";
    const path = `video/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) {
      return { success: false, message: "Failed to upload video." };
    }
    const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    uploadUrl = publicUrlData.publicUrl;
  }

  const next: SiteContent = {
    ...current,
    video: { source, youtubeUrl, uploadUrl },
  };

  const { error } = await supabase
    .from("site_content")
    .update({ value: next })
    .eq("key", "homepage");

  if (error) {
    return { success: false, message: "Failed to update video." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Video updated." };
}

export async function updateBenefitAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const id = String(formData.get("id") ?? "");
  const current = await getSiteContentValue();
  const benefit = current.benefits.find((b) => b.id === id);
  if (!benefit) return { success: false, message: "Benefit not found." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const next: SiteContent = {
    ...current,
    benefits: current.benefits.map((b) => (b.id === id ? { ...b, title, description } : b)),
  };

  const { error } = await supabase
    .from("site_content")
    .update({ value: next })
    .eq("key", "homepage");

  if (error) {
    return { success: false, message: "Failed to update benefit." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Benefit updated." };
}

// --------------------------------------------------------------- Reviews

export async function setReviewPublishedAction(
  reviewId: string,
  isPublished: boolean
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { error, count } = await supabase
    .from("reviews")
    .update({ is_published: isPublished }, { count: "exact" })
    .eq("id", reviewId);

  if (error) {
    return { success: false, message: "Failed to update review." };
  }
  if (!count) {
    return { success: false, message: "Review not found." };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true, message: isPublished ? "Review approved and published." : "Review hidden." };
}

export async function deleteReviewAction(reviewId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { error, count } = await supabase
    .from("reviews")
    .delete({ count: "exact" })
    .eq("id", reviewId);

  if (error || !count) {
    return { success: false, message: "Review not found." };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true, message: "Review deleted." };
}

export async function setReviewVerifiedAction(
  reviewId: string,
  isVerifiedPurchase: boolean
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();

  if (isVerifiedPurchase) {
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("linked_order_number")
      .eq("id", reviewId)
      .maybeSingle();

    const linkedOrderNumber = (reviewData as { linked_order_number: string | null } | null)
      ?.linked_order_number;

    if (!linkedOrderNumber) {
      return {
        success: false,
        message:
          "Can't mark as verified purchase — this review isn't linked to a real order. Link it to an order number first.",
      };
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", linkedOrderNumber)
      .maybeSingle();

    if (!(orderData as OrderRow | null)) {
      return {
        success: false,
        message: "Can't mark as verified purchase — linked order number doesn't match a real order.",
      };
    }
  }

  const { error, count } = await supabase
    .from("reviews")
    .update({ is_verified_purchase: isVerifiedPurchase }, { count: "exact" })
    .eq("id", reviewId);

  if (error) {
    return { success: false, message: "Failed to update review." };
  }
  if (!count) {
    return { success: false, message: "Review not found." };
  }

  revalidatePath("/admin/reviews");
  return { success: true, message: "Verified purchase status updated." };
}

// ------------------------------------------------------------------ FAQ

export async function addFaqAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return { success: false, message: "Question and answer are required." };

  const { data: existing } = await supabase
    .from("faq_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const maxOrder = (existing as { sort_order: number }[] | null)?.[0]?.sort_order ?? 0;

  const { error } = await supabase.from("faq_items").insert({
    question,
    answer,
    sort_order: maxOrder + 1,
    is_enabled: true,
  });

  if (error) {
    return { success: false, message: "Failed to add FAQ." };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ added." };
}

export async function updateFaqAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!id || !question || !answer) {
    return { success: false, message: "Question and answer are required." };
  }

  const { error, count } = await supabase
    .from("faq_items")
    .update({ question, answer }, { count: "exact" })
    .eq("id", id);

  if (error) {
    return { success: false, message: "Failed to update FAQ." };
  }
  if (!count) {
    return { success: false, message: "FAQ not found — it may have been deleted by another admin." };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ updated." };
}

export async function deleteFaqAction(faqId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { error, count } = await supabase
    .from("faq_items")
    .delete({ count: "exact" })
    .eq("id", faqId);
  if (error || !count) {
    return { success: false, message: "FAQ not found." };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ deleted." };
}

export async function toggleFaqEnabledAction(faqId: string, isEnabled: boolean): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { error, count } = await supabase
    .from("faq_items")
    .update({ is_enabled: isEnabled }, { count: "exact" })
    .eq("id", faqId);

  if (error) {
    return { success: false, message: "Failed to update FAQ." };
  }
  if (!count) {
    return { success: false, message: "FAQ not found." };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { success: true, message: isEnabled ? "FAQ enabled." : "FAQ disabled." };
}

export async function reorderFaqAction(faqId: string, direction: "up" | "down"): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { data, error: listError } = await supabase
    .from("faq_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (listError || !data) return { success: false, message: "Failed to reorder FAQ." };

  const sorted = data as FaqItemRow[];
  const index = sorted.findIndex((f) => f.id === faqId);
  if (index === -1) return { success: false, message: "FAQ not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return { success: false };

  const a = sorted[index];
  const b = sorted[swapIndex];

  const [{ error: errA }, { error: errB }] = await Promise.all([
    supabase.from("faq_items").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("faq_items").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  if (errA || errB) {
    return { success: false, message: "Failed to reorder FAQ." };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { success: true };
}

// -------------------------------------------------------------- Settings

export async function updateShippingSettingsAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const uaeShippingFee = Number(formData.get("uaeShippingFee"));
  const freeShippingThresholdRaw = String(formData.get("freeShippingThreshold") ?? "").trim();
  const codEnabled = formData.get("codEnabled") === "on";

  if (Number.isNaN(uaeShippingFee)) {
    return { success: false, message: "Shipping fee must be a number." };
  }

  const value: ShippingSettings = {
    uaeShippingFee,
    freeShippingThreshold: freeShippingThresholdRaw ? Number(freeShippingThresholdRaw) : null,
    codEnabled,
  };

  const { error } = await supabase
    .from("store_settings")
    .update({ value })
    .eq("key", "shipping");

  if (error) {
    return { success: false, message: "Failed to update shipping settings." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/");
  return { success: true, message: "Shipping & COD settings updated." };
}

export async function updateStoreSettingsAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const storeName = String(formData.get("storeName") ?? "").trim();
  const storeEmail = String(formData.get("storeEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const supportHours = String(formData.get("supportHours") ?? "").trim();

  if (!storeName || !storeEmail) {
    return { success: false, message: "Store name and email are required." };
  }

  const { data: currentData } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", "store")
    .maybeSingle();
  const current = (currentData as SettingsRow | null)?.value as unknown as StoreSettings | undefined;

  const value: StoreSettings = {
    ...(current ?? { currency: "AED" }),
    storeName,
    storeEmail,
    contactPhone,
    whatsapp,
    supportHours,
  } as StoreSettings;

  const { error } = await supabase
    .from("store_settings")
    .update({ value })
    .eq("key", "store");

  if (error) {
    return { success: false, message: "Failed to update store settings." };
  }

  revalidatePath("/admin/settings");
  return { success: true, message: "Store settings updated." };
}

// ------------------------------------------------------------------- Inbox

export async function sendAdminReplyAction(
  conversationId: string,
  rawText: string
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const text = rawText.trim();
  if (!text) return { success: false, message: "Reply can't be empty." };

  const conversation = await getConversationById(conversationId);
  if (!conversation) return { success: false, message: "Conversation not found." };

  try {
    await saveAdminReply(conversation, text);
  } catch {
    return { success: false, message: "Failed to send reply." };
  }

  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${conversationId}`);
  return { success: true, message: "Reply sent." };
}

export async function resumeAiAction(conversationId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await setAiPaused(conversationId, false);

  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${conversationId}`);
  return { success: true, message: "AI is handling this conversation again." };
}

// ------------------------------------------------------- Content (extended)

export async function updateUsageStepAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const step = Number(formData.get("step"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !description) {
    return { success: false, message: "Title and description are required." };
  }

  const current = await getSiteContentValue();
  const usageSteps = current.usageSteps ?? [];
  const next: SiteContent = {
    ...current,
    usageSteps: usageSteps.map((s) => (s.step === step ? { ...s, title, description } : s)),
  };

  const { error } = await supabase.from("site_content").update({ value: next }).eq("key", "homepage");
  if (error) return { success: false, message: "Failed to update step." };

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Step updated." };
}

export async function updateComparisonColumnsAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const velnora = String(formData.get("velnora") ?? "").trim();
  const patches = String(formData.get("patches") ?? "").trim();
  const pills = String(formData.get("pills") ?? "").trim();
  if (!velnora || !patches || !pills) {
    return { success: false, message: "All three column labels are required." };
  }

  const current = await getSiteContentValue();
  const next: SiteContent = {
    ...current,
    comparisonTable: { ...current.comparisonTable, columns: { velnora, patches, pills } },
  };
  const { error } = await supabase.from("site_content").update({ value: next }).eq("key", "homepage");
  if (error) return { success: false, message: "Failed to update columns." };

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Column labels updated." };
}

function parseComparisonCell(raw: string): boolean | string {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  return trimmed;
}

export async function updateComparisonRowAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const index = Number(formData.get("index"));
  const current = await getSiteContentValue();
  const rows = current.comparisonTable?.rows ?? [];
  if (Number.isNaN(index) || index < 0 || index >= rows.length) {
    return { success: false, message: "Row not found." };
  }

  const feature = String(formData.get("feature") ?? "").trim();
  if (!feature) return { success: false, message: "Feature name is required." };
  const velnora = parseComparisonCell(String(formData.get("velnora") ?? ""));
  const patches = parseComparisonCell(String(formData.get("patches") ?? ""));
  const pills = parseComparisonCell(String(formData.get("pills") ?? ""));

  const nextRows = rows.map((r, i) => (i === index ? { feature, velnora, patches, pills } : r));
  const next: SiteContent = {
    ...current,
    comparisonTable: { ...current.comparisonTable, rows: nextRows },
  };
  const { error } = await supabase.from("site_content").update({ value: next }).eq("key", "homepage");
  if (error) return { success: false, message: "Failed to update row." };

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Row updated." };
}

export async function updateTrustBadgeAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { success: false, message: "Label is required." };

  const current = await getSiteContentValue();
  const badges = current.trustBadges ?? [];
  const next: SiteContent = {
    ...current,
    trustBadges: badges.map((b) => (b.id === id ? { ...b, label } : b)),
  };
  const { error } = await supabase.from("site_content").update({ value: next }).eq("key", "homepage");
  if (error) return { success: false, message: "Failed to update badge." };

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Trust badge updated." };
}

export async function updateSeoAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !description) {
    return { success: false, message: "Title and description are required." };
  }

  const current = await getSiteContentValue();
  const next: SiteContent = { ...current, seo: { title, description } };
  const { error } = await supabase.from("site_content").update({ value: next }).eq("key", "homepage");
  if (error) return { success: false, message: "Failed to update SEO." };

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "SEO updated." };
}

// -------------------------------------------------------------------- Pages

export async function updatePolicyPageAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!slug || !title || !body) {
    return { success: false, message: "Title and body are required." };
  }

  const { error, count } = await supabase
    .from("policy_pages")
    .update(
      {
        title,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        body,
        updated_at: new Date().toISOString(),
      },
      { count: "exact" }
    )
    .eq("slug", slug);

  if (error) return { success: false, message: "Failed to update page." };
  if (!count) return { success: false, message: "Page not found." };

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${slug}`);
  revalidatePath(`/${slug}`);
  return { success: true, message: "Page updated." };
}

// -------------------------------------------------------------------- Media

const MEDIA_BUCKET = "site-media";

export async function uploadMediaAssetAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const section = String(formData.get("section") ?? "") as MediaSection;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Please choose an image." };
  }
  if (!file.type.startsWith("image/")) {
    return { success: false, message: "Only image files are allowed." };
  }

  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${section}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return { success: false, message: "Failed to upload image." };
  }

  const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data: existing } = await supabase
    .from("media_assets")
    .select("sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: false })
    .limit(1);
  const maxOrder = (existing as { sort_order: number }[] | null)?.[0]?.sort_order ?? 0;

  const alt = String(formData.get("alt") ?? "").trim() || "Velnora product photo";

  const { error: insertError } = await supabase.from("media_assets").insert({
    section,
    url: publicUrlData.publicUrl,
    alt,
    sort_order: maxOrder + 1,
  });
  if (insertError) {
    return { success: false, message: "Image uploaded but failed to save — please retry." };
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  return { success: true, message: "Image uploaded." };
}

export async function updateMediaAssetAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const id = String(formData.get("id") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!id || !alt) return { success: false, message: "Alt text is required." };

  const { error, count } = await supabase
    .from("media_assets")
    .update({ alt }, { count: "exact" })
    .eq("id", id);
  if (error || !count) return { success: false, message: "Failed to update image." };

  revalidatePath("/admin/media");
  revalidatePath("/");
  return { success: true, message: "Image updated." };
}

export async function deleteMediaAssetAction(id: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { data: assetData } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const asset = assetData as MediaAssetRow | null;
  if (!asset) return { success: false, message: "Image not found." };

  const { error, count } = await supabase.from("media_assets").delete({ count: "exact" }).eq("id", id);
  if (error || !count) return { success: false, message: "Failed to delete image." };

  // Best-effort storage cleanup — only attempt for our own uploaded files
  // (identifiable by bucket path in the URL), never for the static
  // /images/product/... fallback paths seeded by the migration.
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const markerIndex = asset.url.indexOf(marker);
  if (markerIndex !== -1) {
    const path = asset.url.slice(markerIndex + marker.length);
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  return { success: true, message: "Image deleted." };
}

export async function reorderMediaAssetAction(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createServiceClient();
  const { data: assetData } = await supabase.from("media_assets").select("*").eq("id", id).maybeSingle();
  const asset = assetData as MediaAssetRow | null;
  if (!asset) return { success: false, message: "Image not found." };

  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .eq("section", asset.section)
    .order("sort_order", { ascending: true });
  const sorted = (data ?? []) as MediaAssetRow[];
  const index = sorted.findIndex((a) => a.id === id);
  if (index === -1) return { success: false };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return { success: false };

  const a = sorted[index];
  const b = sorted[swapIndex];
  const [{ error: errA }, { error: errB }] = await Promise.all([
    supabase.from("media_assets").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("media_assets").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);
  if (errA || errB) return { success: false, message: "Failed to reorder." };

  revalidatePath("/admin/media");
  revalidatePath("/");
  return { success: true };
}
