export const SITE = {
  name: "Velnora",
  legalName: "Velnora Wellness FZE",
  tagline: "Everyday comfort, thoughtfully designed",
  domain: "velnora.ae",
  url: "https://velnora.ae",
  description:
    "Flexi Knee Patches by Velnora — premium far-infrared knee support patches designed for everyday comfort and mobility.",
  locale: "en-AE",
  currency: "AED",
  country: "United Arab Emirates",
} as const;

export const CONTACT = {
  email: "care@velnora.ae",
  whatsapp: "+971500000000",
  hours: "Sunday–Thursday, 9am–6pm (GST)",
  address: "Dubai, United Arab Emirates",
} as const;

export const SOCIAL = {
  instagram: "https://instagram.com/velnora.ae",
  tiktok: "https://tiktok.com/@velnora.ae",
} as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/#product" },
  { label: "Benefits", href: "/#benefits" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "Flexi Knee Patches", href: "/#product" },
    { label: "Track Your Order", href: "/track-order" },
  ],
  company: [
    { label: "About Velnora", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  policies: [
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

export const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export function formatAED(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
