import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VideoBubble } from "@/features/product/components/video-bubble";
import { StickyBuyBar } from "@/features/product/components/sticky-buy-bar";
import { StorefrontFrame } from "@/components/layout/storefront-frame";
import { StorefrontConfigSync } from "@/components/providers/storefront-config-sync";
import {
  getStorefrontPackages,
  getStorefrontShipping,
  getStorefrontContactInfo,
  getStorefrontContent,
} from "@/lib/storefront-data";
import { SITE } from "@/lib/constants";
import "./globals.css";

// Self-hosted (not next/font/google) so the build never depends on a
// live connection to Google Fonts — see docs/image-prompts.md sibling
// note in README for how these files were sourced.
const fraunces = localFont({
  variable: "--font-heading",
  src: [
    {
      path: "./fonts/fraunces-normal-variable.woff2",
      style: "normal",
      weight: "300 900",
    },
    {
      path: "./fonts/fraunces-italic-variable.woff2",
      style: "italic",
      weight: "300 900",
    },
  ],
});

const manrope = localFont({
  variable: "--font-sans",
  src: [
    {
      path: "./fonts/manrope-variable.woff2",
      style: "normal",
      weight: "200 800",
    },
  ],
});

// Every route shares this layout, which reads current packages/shipping
// from Supabase — without this, Next.js's default fetch caching would
// freeze that data at build time and admin edits would never appear on
// the live site until the next deploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Velnora | Flexi Knee Patches",
    template: "%s | Velnora",
  },
  description: SITE.description,
  keywords: [
    "Flexi Knee Patches",
    "Velnora",
    "knee support patches UAE",
    "far infrared knee patch",
    "knee comfort Dubai",
  ],
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: SITE.name,
    url: SITE.url,
    title: "Velnora | Flexi Knee Patches",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Velnora | Flexi Knee Patches",
    description: SITE.description,
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tiers, shipping, contactInfo, content] = await Promise.all([
    getStorefrontPackages(),
    getStorefrontShipping(),
    getStorefrontContactInfo(),
    getStorefrontContent(),
  ]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-emerald-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-sand-50"
        >
          Skip to main content
        </a>
        <StorefrontConfigSync tiers={tiers} shipping={shipping} whatsapp={contactInfo.whatsapp} />
        <StorefrontFrame
          announcement={<AnnouncementBar />}
          header={<Header />}
          footer={<Footer />}
          video={<VideoBubble video={content.video} />}
          stickyBuyBar={<StickyBuyBar />}
        >
          {children}
        </StorefrontFrame>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
