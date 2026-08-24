import type {
  Benefit,
  ComparisonRow,
  FaqItem,
  PricingTier,
  UsageStep,
} from "@/types/product";

export const PRODUCT = {
  id: "flexi-knee-patches",
  name: "Flexi Knee Patches",
  brand: "Velnora",
  shortDescription:
    "Self-adhesive far-infrared patches designed to bring soothing warmth and gentle support to tired, achy knees — so you can keep moving through your day.",
  metaTitle: "Flexi Knee Patches — Far-Infrared Knee Support | Velnora",
  metaDescription:
    "Flexi Knee Patches by Velnora use far-infrared and tourmaline technology to deliver soothing warmth to the knee. Free UAE shipping, Cash on Delivery available.",
} as const;

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "single",
    label: "1 Box",
    units: 1,
    patchesPerUnit: 6,
    price: 129,
    compareAtPrice: 179,
    pricePerUnit: 129,
  },
  {
    id: "triple",
    label: "3 Boxes",
    units: 3,
    patchesPerUnit: 6,
    price: 299,
    compareAtPrice: 537,
    pricePerUnit: 99.67,
    badge: "Most Popular",
    isPopular: true,
  },
  {
    id: "five",
    label: "5 Boxes",
    units: 5,
    patchesPerUnit: 6,
    price: 429,
    compareAtPrice: 895,
    pricePerUnit: 85.8,
    badge: "Best Value",
  },
];

export const BENEFITS: Benefit[] = [
  {
    id: "warmth",
    icon: "Flame",
    title: "Soothing, gentle warmth",
    description:
      "Far-infrared and tourmaline layers work with your body's own heat to deliver a steady, comforting warmth exactly where you need it.",
  },
  {
    id: "discreet",
    icon: "Shirt",
    title: "Thin enough to wear all day",
    description:
      "A low-profile, breathable design that sits comfortably under trousers, leggings, or a long skirt without shifting.",
  },
  {
    id: "on-the-go",
    icon: "Footprints",
    title: "Built for real days",
    description:
      "Whether you're on your feet at work, out walking, or simply climbing the stairs at home, each patch stays in place for up to 12 hours.",
  },
  {
    id: "simple",
    icon: "Sparkles",
    title: "No devices, no charging",
    description:
      "Peel, apply, go. There's no battery, app, or setup — just a self-adhesive patch that gets to work on contact.",
  },
];

export const USAGE_STEPS: UsageStep[] = [
  {
    step: 1,
    title: "Cleanse & dry",
    description:
      "Make sure the skin around your knee is clean, dry, and free of lotion before applying.",
  },
  {
    step: 2,
    title: "Peel & position",
    description:
      "Remove the backing and center the patch over the area of the knee where you feel discomfort.",
  },
  {
    step: 3,
    title: "Press & smooth",
    description:
      "Press the edges down firmly so the patch adheres fully and moves naturally with your knee.",
  },
  {
    step: 4,
    title: "Wear up to 12 hours",
    description:
      "Leave in place through your day or overnight, then remove gently. Allow the skin a rest period before reapplying.",
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "No pills or ingestion required",
    velnora: true,
    patches: "Varies",
    pills: false,
  },
  {
    feature: "Discreet under everyday clothing",
    velnora: true,
    patches: "Varies",
    pills: true,
  },
  {
    feature: "Wear duration",
    velnora: "Up to 12 hours",
    patches: "2–4 hours",
    pills: "As directed",
  },
  {
    feature: "No batteries or charging",
    velnora: true,
    patches: true,
    pills: true,
  },
  {
    feature: "Reapply throughout the day",
    velnora: true,
    patches: true,
    pills: false,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What are Flexi Knee Patches made from?",
    answer:
      "Each patch has a breathable fabric base with a far-infrared and tourmaline-infused core, finished with a medical-grade adhesive that's gentle on skin.",
  },
  {
    question: "How long does one patch last?",
    answer:
      "Each patch is designed for up to 12 hours of continuous wear. We recommend giving your skin a short rest before applying a new patch to the same area.",
  },
  {
    question: "Is this a medical treatment?",
    answer:
      "Flexi Knee Patches are a comfort and wellness product, not a medical device or treatment. If you have a diagnosed joint condition or persistent pain, please speak with a doctor or physiotherapist.",
  },
  {
    question: "Can I wear it during exercise?",
    answer:
      "Yes — the low-profile design stays in place during walking, light exercise, and daily movement. For high-intensity training or water sports, we recommend removing it beforehand.",
  },
  {
    question: "Do you deliver across the UAE?",
    answer:
      "Yes, we deliver to all seven Emirates. Orders placed before 2pm typically arrive within 2–4 business days. Cash on Delivery is available everywhere we ship.",
  },
  {
    question: "What if it's not right for me?",
    answer:
      "You're covered by our 30-day return policy on unopened boxes. Reach out to our support team and we'll walk you through the process.",
  },
];

export const GUARANTEE = {
  title: "Our promise to you",
  description:
    "If your Flexi Knee Patches don't arrive in perfect condition, or an unopened box isn't right for you, we'll make it right within 30 days of delivery.",
} as const;
