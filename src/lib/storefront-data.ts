import { createServiceClient } from "@/lib/supabase/server";
import {
  PRICING_TIERS as STATIC_PRICING_TIERS,
  FAQ_ITEMS as STATIC_FAQ_ITEMS,
  BENEFITS as STATIC_BENEFITS,
  GUARANTEE as STATIC_GUARANTEE,
  USAGE_STEPS as STATIC_USAGE_STEPS,
  COMPARISON_ROWS as STATIC_COMPARISON_ROWS,
  PRODUCT as STATIC_PRODUCT,
} from "@/features/product/data/product";
import { CONTACT as STATIC_CONTACT, SITE } from "@/lib/constants";
import type { PricingTier, FaqItem, Benefit, UsageStep, ComparisonRow } from "@/types/product";
import type {
  FaqItemRow,
  MediaAssetRow,
  MediaSection,
  PackageRow,
  PolicyPageRow,
  SettingsRow,
} from "@/lib/supabase/types";
import type { ShippingConfig } from "@/features/checkout/lib/shipping";

export type { ShippingConfig } from "@/features/checkout/lib/shipping";
export { resolveShippingFee } from "@/features/checkout/lib/shipping";

/**
 * Server-only reads of the same data the admin panel manages, used by the
 * storefront and checkout so admin edits (packages, shipping/COD, FAQ)
 * actually take effect for customers. Every function falls back to the
 * static content in src/features/product/data/product.ts if Supabase isn't
 * configured or the table is empty — the storefront never breaks because
 * of a missing/misconfigured backend.
 */

function mapPackageRowToTier(row: PackageRow): PricingTier {
  return {
    id: row.id,
    label: row.name,
    units: row.units,
    patchesPerUnit: row.patches_per_unit,
    price: Number(row.price),
    compareAtPrice: Number(row.compare_at_price),
    pricePerUnit: Number(row.price) / row.units,
    badge: row.badge ?? undefined,
    isPopular: row.is_popular,
  };
}

export async function getStorefrontPackages(): Promise<PricingTier[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return STATIC_PRICING_TIERS;
    return (data as PackageRow[]).map(mapPackageRowToTier);
  } catch {
    return STATIC_PRICING_TIERS;
  }
}

export async function getStorefrontPackageById(id: string): Promise<PricingTier | null> {
  const tiers = await getStorefrontPackages();
  return tiers.find((t) => t.id === id) ?? null;
}

export async function getStorefrontFaqs(): Promise<FaqItem[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return STATIC_FAQ_ITEMS;
    return (data as FaqItemRow[]).map((row) => ({
      question: row.question,
      answer: row.answer,
    }));
  } catch {
    return STATIC_FAQ_ITEMS;
  }
}

const DEFAULT_SHIPPING: ShippingConfig = {
  uaeShippingFee: 0,
  freeShippingThreshold: null,
  codEnabled: true,
};

export async function getStorefrontShipping(): Promise<ShippingConfig> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("key", "shipping")
      .maybeSingle();

    if (error || !data) return DEFAULT_SHIPPING;
    return (data as SettingsRow).value as unknown as ShippingConfig;
  } catch {
    return DEFAULT_SHIPPING;
  }
}

export interface ComparisonTableContent {
  columns: { velnora: string; patches: string; pills: string };
  rows: ComparisonRow[];
}

export interface TrustBadge {
  id: string;
  label: string;
}

export interface StorefrontContent {
  heroHeading: string;
  heroDescription: string;
  heroCtaText: string;
  trustMessages: string[];
  benefits: Benefit[];
  guaranteeTitle: string;
  guaranteeDescription: string;
  usageSteps: UsageStep[];
  comparisonTable: ComparisonTableContent;
  trustBadges: TrustBadge[];
  seo: { title: string; description: string };
  video: { source: "youtube" | "upload"; youtubeUrl: string; uploadUrl: string };
}

const DEFAULT_COMPARISON_TABLE: ComparisonTableContent = {
  columns: { velnora: "Flexi Knee Patches", patches: "Generic Patches", pills: "Oral Pain Relief" },
  rows: STATIC_COMPARISON_ROWS,
};

const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { id: "shipping", label: "Free UAE Shipping" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "30-Day Returns" },
  { id: "secure", label: "Secure Checkout" },
  { id: "ssl", label: "SSL Protected" },
  { id: "wear", label: "Up to 12 Hours Wear" },
  { id: "emirates", label: "All 7 Emirates" },
];

const DEFAULT_CONTENT: StorefrontContent = {
  heroHeading: "Flexi Knee Patches",
  heroDescription:
    "Self-adhesive far-infrared patches for soothing, everyday knee comfort.",
  heroCtaText: "Add to Bag",
  trustMessages: ["Free UAE shipping", "Cash on Delivery", "30-day returns"],
  benefits: STATIC_BENEFITS,
  guaranteeTitle: STATIC_GUARANTEE.title,
  guaranteeDescription: STATIC_GUARANTEE.description,
  usageSteps: STATIC_USAGE_STEPS,
  comparisonTable: DEFAULT_COMPARISON_TABLE,
  trustBadges: DEFAULT_TRUST_BADGES,
  seo: { title: STATIC_PRODUCT.metaTitle, description: STATIC_PRODUCT.metaDescription },
  video: {
    source: "youtube",
    youtubeUrl: "https://youtube.com/shorts/6kcHyBXlkJs",
    uploadUrl: "",
  },
};

interface RawSiteContent {
  heroHeading?: string;
  heroDescription?: string;
  heroCtaText?: string;
  trustMessages?: string[];
  benefits?: { id: string; title: string; description: string }[];
  guaranteeTitle?: string;
  guaranteeDescription?: string;
  usageSteps?: UsageStep[];
  comparisonTable?: ComparisonTableContent;
  trustBadges?: TrustBadge[];
  seo?: { title?: string; description?: string };
  video?: { source?: "youtube" | "upload"; youtubeUrl?: string; uploadUrl?: string };
}

export async function getStorefrontContent(): Promise<StorefrontContent> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .eq("key", "homepage")
      .maybeSingle();

    if (error || !data) return DEFAULT_CONTENT;
    const raw = (data as SettingsRow).value as unknown as RawSiteContent;

    // Admin-managed benefits only carry title/description — icons stay
    // fixed design elements, matched back in by id from the static list.
    const benefits: Benefit[] = (raw.benefits ?? []).map((b) => {
      const staticMatch = STATIC_BENEFITS.find((sb) => sb.id === b.id);
      return {
        id: b.id,
        icon: staticMatch?.icon ?? "Sparkles",
        title: b.title,
        description: b.description,
      };
    });

    return {
      heroHeading: raw.heroHeading || DEFAULT_CONTENT.heroHeading,
      heroDescription: raw.heroDescription || DEFAULT_CONTENT.heroDescription,
      heroCtaText: raw.heroCtaText || DEFAULT_CONTENT.heroCtaText,
      trustMessages:
        raw.trustMessages && raw.trustMessages.length > 0
          ? raw.trustMessages
          : DEFAULT_CONTENT.trustMessages,
      benefits: benefits.length > 0 ? benefits : DEFAULT_CONTENT.benefits,
      guaranteeTitle: raw.guaranteeTitle || DEFAULT_CONTENT.guaranteeTitle,
      guaranteeDescription: raw.guaranteeDescription || DEFAULT_CONTENT.guaranteeDescription,
      usageSteps:
        raw.usageSteps && raw.usageSteps.length > 0 ? raw.usageSteps : DEFAULT_CONTENT.usageSteps,
      comparisonTable: raw.comparisonTable ?? DEFAULT_CONTENT.comparisonTable,
      trustBadges:
        raw.trustBadges && raw.trustBadges.length > 0
          ? raw.trustBadges
          : DEFAULT_CONTENT.trustBadges,
      video: {
        source: raw.video?.source ?? DEFAULT_CONTENT.video.source,
        youtubeUrl: raw.video?.youtubeUrl || DEFAULT_CONTENT.video.youtubeUrl,
        uploadUrl: raw.video?.uploadUrl || DEFAULT_CONTENT.video.uploadUrl,
      },
      seo: {
        title: raw.seo?.title || DEFAULT_CONTENT.seo.title,
        description: raw.seo?.description || DEFAULT_CONTENT.seo.description,
      },
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export interface StorefrontMediaAsset {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
}

const DEFAULT_MEDIA: Record<MediaSection, StorefrontMediaAsset[]> = {
  hero_gallery: [
    { id: "hero-main", url: "/images/product/hero-main.jpg", alt: "Flexi Knee Patch — hero shot", caption: null },
    { id: "hero-thumb-1", url: "/images/product/on-the-knee.jpg", alt: "On the knee", caption: null },
    { id: "hero-thumb-2", url: "/images/product/packaging.jpg", alt: "Packaging", caption: null },
    { id: "hero-thumb-3", url: "/images/product/macro-texture.jpg", alt: "Macro detail", caption: null },
  ],
  story: [
    { id: "story-fabric", url: "/images/product/patch-bent.jpg", alt: "Breathable fabric base", caption: null },
    { id: "story-core", url: "/images/product/on-the-knee.jpg", alt: "Far-infrared & tourmaline core", caption: null },
    { id: "story-warmth", url: "/images/product/hero-main.jpg", alt: "Steady, wearable warmth", caption: null },
  ],
  day_in_life: [
    { id: "day-1", url: "/images/product/lifestyle-sleep.jpg", alt: "Morning routine", caption: null },
    { id: "day-2", url: "/images/product/lifestyle-garden.jpg", alt: "On your feet at work", caption: null },
    { id: "day-3", url: "/images/product/lifestyle-stairs.jpg", alt: "Out walking", caption: null },
    { id: "day-4", url: "/images/product/lifestyle-cycling.jpg", alt: "Light movement", caption: null },
  ],
};

export async function getStorefrontMedia(section: MediaSection): Promise<StorefrontMediaAsset[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("section", section)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_MEDIA[section];
    return (data as MediaAssetRow[]).map((row) => ({
      id: row.id,
      url: row.url,
      alt: row.alt,
      caption: row.caption,
    }));
  } catch {
    return DEFAULT_MEDIA[section];
  }
}

export interface StorefrontPolicyPage {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  body: string;
}

export async function getStorefrontPolicyPage(slug: string): Promise<StorefrontPolicyPage | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("policy_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as PolicyPageRow;
    return {
      title: row.title,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      body: row.body,
    };
  } catch {
    return null;
  }
}

export interface StorefrontContactInfo {
  storeName: string;
  email: string;
  whatsapp: string;
  hours: string;
}

const DEFAULT_CONTACT_INFO: StorefrontContactInfo = {
  storeName: SITE.name,
  email: STATIC_CONTACT.email,
  whatsapp: STATIC_CONTACT.whatsapp,
  hours: STATIC_CONTACT.hours,
};

export async function getStorefrontContactInfo(): Promise<StorefrontContactInfo> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("key", "store")
      .maybeSingle();

    if (error || !data) return DEFAULT_CONTACT_INFO;
    const value = (data as SettingsRow).value as unknown as {
      storeName?: string;
      storeEmail?: string;
      whatsapp?: string;
      supportHours?: string;
    };

    return {
      storeName: value.storeName || DEFAULT_CONTACT_INFO.storeName,
      email: value.storeEmail || DEFAULT_CONTACT_INFO.email,
      whatsapp: value.whatsapp || DEFAULT_CONTACT_INFO.whatsapp,
      hours: value.supportHours || DEFAULT_CONTACT_INFO.hours,
    };
  } catch {
    return DEFAULT_CONTACT_INFO;
  }
}
