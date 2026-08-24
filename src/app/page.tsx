import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/features/product/components/hero";
import { BrandBanner } from "@/features/product/components/brand-banner";
import { ProblemAgitation } from "@/features/product/components/problem-agitation";
import { VideoShowcase } from "@/features/product/components/video-showcase";
import { ProductStory } from "@/features/product/components/product-story";
import { UsageInstructions } from "@/features/product/components/usage-instructions";
import { BenefitsGrid } from "@/features/product/components/benefits-grid";
import { Gallery } from "@/features/product/components/gallery";
import { ComparisonTable } from "@/features/product/components/comparison-table";
import { PromoFlyer } from "@/features/product/components/promo-flyer";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { ReviewsSkeleton } from "@/features/reviews/components/reviews-skeleton";
import { FaqAccordion } from "@/features/product/components/faq-accordion";
import { GuaranteeBanner } from "@/features/product/components/guarantee-banner";
import { PRODUCT, PRICING_TIERS } from "@/features/product/data/product";
import { getStorefrontContent, getStorefrontMedia } from "@/lib/storefront-data";
import { SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getStorefrontContent();
  return {
    title: content.seo.title || PRODUCT.metaTitle,
    description: content.seo.description || PRODUCT.metaDescription,
    alternates: { canonical: "/" },
  };
}

function ProductJsonLd() {
  const cheapest = Math.min(...PRICING_TIERS.map((t) => t.price));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT.name,
    brand: { "@type": "Brand", name: PRODUCT.brand },
    description: PRODUCT.shortDescription,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: SITE.currency,
      lowPrice: cheapest,
      highPrice: Math.max(...PRICING_TIERS.map((t) => t.price)),
      offerCount: PRICING_TIERS.length,
      availability: "https://schema.org/InStock",
      url: SITE.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function Home() {
  const [content, heroImages, storyImages, dayInLifeImages] = await Promise.all([
    getStorefrontContent(),
    getStorefrontMedia("hero_gallery"),
    getStorefrontMedia("story"),
    getStorefrontMedia("day_in_life"),
  ]);

  return (
    <>
      <ProductJsonLd />
      <BrandBanner />
      <Hero
        heading={content.heroHeading}
        description={content.heroDescription}
        ctaLabel={content.heroCtaText}
        images={heroImages.map((img) => ({ label: img.alt, assetSlot: img.id, src: img.url }))}
      />
      <ProblemAgitation />
      <VideoShowcase video={content.video} />
      <ProductStory images={storyImages.map((img) => ({ url: img.url, alt: img.alt }))} />
      <UsageInstructions steps={content.usageSteps} />
      <BenefitsGrid benefits={content.benefits} />
      <Gallery
        shots={dayInLifeImages.map((img) => ({ label: img.alt, assetSlot: img.id, src: img.url }))}
      />
      <ComparisonTable columns={content.comparisonTable.columns} rows={content.comparisonTable.rows} />
      <PromoFlyer />
      <div id="reviews">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection />
        </Suspense>
      </div>
      <FaqAccordion />
      <GuaranteeBanner
        title={content.guaranteeTitle}
        description={content.guaranteeDescription}
        trustBadges={content.trustBadges}
      />
    </>
  );
}
