import { ProductHeroInfo } from "@/features/product/components/product-hero-info";
import { PurchaseBox } from "@/features/product/components/purchase-box";
import { ProductGallery, type GalleryImage } from "@/features/product/components/product-gallery";
import { FadeIn } from "@/components/motion/fade-in";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { HeroShapes } from "@/components/motion/hero-shapes";

export function Hero({
  heading,
  description,
  ctaLabel,
  images,
}: {
  heading: string;
  description: string;
  ctaLabel?: string;
  images?: GalleryImage[];
}) {
  return (
    <section
      id="product"
      className="relative bg-brand-sand-50"
    >
      <AmbientBackground variant="emerald" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-6 md:py-20 lg:py-24">
        <FadeIn y={16} className="relative md:sticky md:top-24 md:self-start">
          <HeroShapes />
          <ProductGallery images={images} />
        </FadeIn>

        <FadeIn className="flex flex-col gap-6" delay={0.12} y={16}>
          <ProductHeroInfo heading={heading} description={description} />
          <PurchaseBox ctaLabel={ctaLabel} />
        </FadeIn>
      </div>
    </section>
  );
}
