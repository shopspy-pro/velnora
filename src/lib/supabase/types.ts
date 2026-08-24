export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  customer_full_name: string;
  customer_phone: string;
  customer_email: string | null;
  emirate: string;
  city: string;
  address_line1: string;
  address_line2: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  notes: string | null;
}

export interface OrderInsert {
  id?: string;
  order_number: string;
  created_at?: string;
  status?: OrderStatus;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  stripe_session_id?: string | null;
  customer_full_name: string;
  customer_phone: string;
  customer_email?: string | null;
  emirate: string;
  city: string;
  address_line1: string;
  address_line2?: string | null;
  subtotal: number;
  shipping_fee?: number;
  total: number;
  currency?: string;
  notes?: string | null;
}

export type OrderUpdate = Partial<OrderInsert>;

export interface OrderItemRow {
  id: string;
  order_id: string;
  tier_id: string;
  label: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItemInsert {
  id?: string;
  order_id: string;
  tier_id: string;
  label: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderItemUpdate = Partial<OrderItemInsert>;

export interface ReviewRow {
  id: string;
  created_at: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_published: boolean;
  is_verified_purchase: boolean;
  linked_order_number: string | null;
}

export interface ReviewInsert {
  id?: string;
  created_at?: string;
  customer_name: string;
  rating: number;
  title?: string | null;
  body: string;
  is_published?: boolean;
  is_verified_purchase?: boolean;
  linked_order_number?: string | null;
}

export type ReviewUpdate = Partial<ReviewInsert>;

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  created_at: string;
  source: string | null;
}

export interface NewsletterSubscriberInsert {
  id?: string;
  email: string;
  created_at?: string;
  source?: string | null;
}

export type NewsletterSubscriberUpdate = Partial<NewsletterSubscriberInsert>;

// ---------------------------------------------------------- admin panel

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  base_price: number;
  stock_status: StockStatus;
  is_available: boolean;
}

export type ProductUpdate = Partial<Omit<ProductRow, "id">>;

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface PackageRow {
  id: string;
  name: string;
  units: number;
  patches_per_unit: number;
  price: number;
  compare_at_price: number;
  badge: string | null;
  is_popular: boolean;
  is_available: boolean;
  sort_order: number;
}

export type PackageUpdate = Partial<Omit<PackageRow, "id">>;

export interface FaqItemRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_enabled: boolean;
}

export interface FaqItemInsert {
  id?: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_enabled?: boolean;
}

export type FaqItemUpdate = Partial<FaqItemInsert>;

export interface SettingsRow {
  key: string;
  value: Record<string, unknown>;
}

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
}

// ------------------------------------------------------------------- CMS

export interface PolicyPageRow {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  body: string;
  updated_at: string;
}

export type PolicyPageUpdate = Partial<Omit<PolicyPageRow, "slug" | "updated_at">>;

export type MediaSection = "hero_gallery" | "story" | "day_in_life";

export interface MediaAssetRow {
  id: string;
  section: MediaSection;
  url: string;
  alt: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface MediaAssetInsert {
  section: MediaSection;
  url: string;
  alt: string;
  caption?: string | null;
  sort_order?: number;
}

export type MediaAssetUpdate = Partial<Omit<MediaAssetRow, "id" | "created_at">>;

// -------------------------------------------------------------- chat inbox

export type ChatSender = "customer" | "ai" | "admin";
export type ChatConversationStatus = "open" | "closed";

export interface ChatConversationRow {
  id: string;
  session_id: string;
  customer_language: string | null;
  ai_paused: boolean;
  status: ChatConversationStatus;
  created_at: string;
  last_message_at: string;
}

export interface ChatConversationInsert {
  session_id: string;
}

export type ChatConversationUpdate = Partial<
  Omit<ChatConversationRow, "id" | "session_id" | "created_at">
>;

export interface ChatMessageRow {
  id: string;
  conversation_id: string;
  sender: ChatSender;
  body: string;
  translated_body: string | null;
  created_at: string;
}

export interface ChatMessageInsert {
  conversation_id: string;
  sender: ChatSender;
  body: string;
  translated_body?: string | null;
}
