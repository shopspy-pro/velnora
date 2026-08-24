import { createServiceClient } from "@/lib/supabase/server";
import type {
  ChatConversationRow,
  ChatMessageRow,
  FaqItemRow,
  MediaAssetRow,
  MediaSection,
  OrderItemRow,
  OrderRow,
  PackageRow,
  PolicyPageRow,
  ProductImageRow,
  ProductRow,
  ReviewRow,
  SettingsRow,
} from "@/lib/supabase/types";
import {
  mapFaqRow,
  mapOrderRow,
  mapPackageRow,
  mapProductRow,
  mapReviewRow,
} from "./mappers";
import type {
  AdminMediaAsset,
  AdminOrder,
  AdminPolicyPage,
  OrderStatus,
  ShippingSettings,
  SiteContent,
  StoreSettings,
} from "./types";

export interface OrderFilters {
  status?: OrderStatus | "all";
  search?: string;
  dateFrom?: string; // yyyy-mm-dd
  dateTo?: string; // yyyy-mm-dd
}

export async function getOrders(filters: OrderFilters = {}): Promise<AdminOrder[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    // Strip characters that would break PostgREST's or() filter syntax.
    const q = filters.search.trim().replace(/[,()%]/g, "");
    if (q) {
      query = query.or(
        `order_number.ilike.%${q}%,customer_full_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
      );
    }
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getOrders failed", error);
    return [];
  }

  const rows = (data ?? []) as (OrderRow & { order_items: OrderItemRow[] })[];
  return rows.map((row) => mapOrderRow(row, row.order_items));
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as OrderRow & { order_items: OrderItemRow[] };
  return mapOrderRow(row, row.order_items);
}

export async function getDashboardStats() {
  const orders = await getOrders();

  const countByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 6);

  return {
    totalOrders: orders.length,
    newOrders: countByStatus("new"),
    confirmedOrders: countByStatus("confirmed"),
    processingOrders: countByStatus("processing"),
    shippedOrders: countByStatus("shipped"),
    deliveredOrders: countByStatus("delivered"),
    cancelledOrders: countByStatus("cancelled"),
    totalRevenue: revenue,
    recentOrders,
  };
}

export async function getAnalytics() {
  const orders = await getOrders();

  const days: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key);
    days.push({
      date: key,
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0),
    });
  }

  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  const packageCounts = new Map<string, { label: string; count: number }>();
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const entry = packageCounts.get(item.packageId) ?? { label: item.label, count: 0 };
      entry.count += item.quantity;
      packageCounts.set(item.packageId, entry);
    });
  });
  const mostSelectedPackage = [...packageCounts.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  return {
    dailySeries: days,
    deliveredVsCancelled: { delivered, cancelled },
    mostSelectedPackage,
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue,
  };
}

export async function getProduct() {
  const supabase = createServiceClient();
  const { data: productData, error } = await supabase
    .from("products")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !productData) {
    throw new Error("No product row found — the catalog seed migration may not have run.");
  }
  const product = productData as ProductRow;

  const { data: imagesData } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id);

  return mapProductRow(product, (imagesData ?? []) as ProductImageRow[]);
}

export async function getPackages() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPackages failed", error);
    return [];
  }
  return ((data ?? []) as PackageRow[]).map(mapPackageRow);
}

export async function getReviews() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviews failed", error);
    return [];
  }
  return ((data ?? []) as ReviewRow[]).map(mapReviewRow);
}

export async function getFaqs() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getFaqs failed", error);
    return [];
  }
  return ((data ?? []) as FaqItemRow[]).map(mapFaqRow);
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("key", "homepage")
    .maybeSingle();

  if (error || !data) {
    throw new Error("No site_content row found — the seed migration may not have run.");
  }
  const value = (data as SettingsRow).value as unknown as Partial<SiteContent>;
  return {
    ...value,
    video: value.video ?? {
      source: "youtube",
      youtubeUrl: "https://youtube.com/shorts/6kcHyBXlkJs",
      uploadUrl: "",
    },
  } as SiteContent;
}

// ------------------------------------------------------------------- pages

export async function getPolicyPages(): Promise<AdminPolicyPage[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    console.error("getPolicyPages failed", error);
    return [];
  }
  return ((data ?? []) as PolicyPageRow[]).map(mapPolicyPageRow);
}

export async function getPolicyPage(slug: string): Promise<AdminPolicyPage | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapPolicyPageRow(data as PolicyPageRow);
}

function mapPolicyPageRow(row: PolicyPageRow): AdminPolicyPage {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    body: row.body,
    updatedAt: row.updated_at,
  };
}

// ------------------------------------------------------------------- media

export async function getMediaAssets(section: MediaSection): Promise<AdminMediaAsset[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("section", section)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getMediaAssets failed", error);
    return [];
  }
  return ((data ?? []) as MediaAssetRow[]).map((row) => ({
    id: row.id,
    section: row.section,
    url: row.url,
    alt: row.alt,
    caption: row.caption,
    sortOrder: row.sort_order,
  }));
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", "shipping")
    .maybeSingle();

  if (error || !data) {
    throw new Error("No shipping settings row found — the seed migration may not have run.");
  }
  return (data as SettingsRow).value as unknown as ShippingSettings;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", "store")
    .maybeSingle();

  if (error || !data) {
    throw new Error("No store settings row found — the seed migration may not have run.");
  }
  return (data as SettingsRow).value as unknown as StoreSettings;
}

// -------------------------------------------------------------- chat inbox

export interface AdminConversationListItem {
  id: string;
  sessionId: string;
  customerLanguage: string | null;
  aiPaused: boolean;
  status: "open" | "closed";
  lastMessageAt: string;
  lastMessagePreview: string | null;
}

export async function getConversations(): Promise<AdminConversationListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*, chat_messages(body, sender, created_at)")
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("getConversations failed", error);
    return [];
  }

  type Row = ChatConversationRow & {
    chat_messages: { body: string; sender: string; created_at: string }[];
  };

  return ((data ?? []) as Row[]).map((row) => {
    const lastMessage = [...row.chat_messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    return {
      id: row.id,
      sessionId: row.session_id,
      customerLanguage: row.customer_language,
      aiPaused: row.ai_paused,
      status: row.status,
      lastMessageAt: row.last_message_at,
      lastMessagePreview: lastMessage?.body ?? null,
    };
  });
}

export interface AdminConversationDetail {
  id: string;
  sessionId: string;
  customerLanguage: string | null;
  aiPaused: boolean;
  status: "open" | "closed";
  messages: {
    id: string;
    sender: "customer" | "ai" | "admin";
    body: string;
    translatedBody: string | null;
    createdAt: string;
  }[];
}

export async function getConversationDetail(
  id: string
): Promise<AdminConversationDetail | null> {
  const supabase = createServiceClient();
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (convError || !conversation) return null;
  const row = conversation as ChatConversationRow;

  const { data: messagesData } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return {
    id: row.id,
    sessionId: row.session_id,
    customerLanguage: row.customer_language,
    aiPaused: row.ai_paused,
    status: row.status,
    messages: ((messagesData ?? []) as ChatMessageRow[]).map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      translatedBody: m.translated_body,
      createdAt: m.created_at,
    })),
  };
}
