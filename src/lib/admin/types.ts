/**
 * Types for the admin panel's data layer. These are shaped to match what
 * the future Supabase tables should look like (see
 * docs/admin-supabase-integration.md), so swapping the in-memory demo store
 * (./demo-store.ts) for real Supabase queries is a like-for-like change —
 * the UI components consume these same shapes either way.
 */

export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type AdminPaymentMethod = "cod" | "card";

export interface AdminOrderItem {
  id: string;
  packageId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  status: OrderStatus;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  customerName: string;
  phone: string;
  email: string | null;
  emirate: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  images: { id: string; url: string; alt: string }[];
  basePrice: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  isAvailable: boolean;
}

export interface AdminPackage {
  id: string;
  name: string;
  units: number;
  patchesPerUnit: number;
  price: number;
  compareAtPrice: number;
  badge: string | null;
  isPopular: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface AdminReview {
  id: string;
  createdAt: string;
  customerName: string;
  rating: number;
  title: string | null;
  body: string;
  isPublished: boolean;
  isVerifiedPurchase: boolean;
  linkedOrderNumber: string | null;
  isDemoContent: boolean;
}

export interface AdminFaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface SiteContent {
  heroHeading: string;
  heroDescription: string;
  heroCtaText: string;
  trustMessages: string[];
  benefits: { id: string; title: string; description: string }[];
  howItWorksIntro: string;
  guaranteeTitle: string;
  guaranteeDescription: string;
  usageSteps: { step: number; title: string; description: string }[];
  comparisonTable: {
    columns: { velnora: string; patches: string; pills: string };
    rows: {
      feature: string;
      velnora: boolean | string;
      patches: boolean | string;
      pills: boolean | string;
    }[];
  };
  trustBadges: { id: string; label: string }[];
  seo: { title: string; description: string };
  video: { source: "youtube" | "upload"; youtubeUrl: string; uploadUrl: string };
}

export interface AdminPolicyPage {
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  body: string;
  updatedAt: string;
}

export type MediaSection = "hero_gallery" | "story" | "day_in_life";

export interface AdminMediaAsset {
  id: string;
  section: MediaSection;
  url: string;
  alt: string;
  caption: string | null;
  sortOrder: number;
}

export interface ShippingSettings {
  uaeShippingFee: number;
  freeShippingThreshold: number | null;
  codEnabled: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  contactPhone: string;
  whatsapp: string;
  currency: string;
  supportHours: string;
}
