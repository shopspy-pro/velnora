import Image from "next/image";
import { SITE } from "@/lib/constants";
import { FadeIn } from "@/components/motion/fade-in";

const BANNER_IMAGE_URL =
  "https://bpzlzesbedyvuqobdolb.supabase.co/storage/v1/object/public/site-media/velnora-redesign/hero_banner_cropped.jpg";

export function BrandBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-sage-100">
      <FadeIn className="relative mx-auto aspect-[1600/580] w-full max-w-[1600px]">
        <Image
          src={BANNER_IMAGE_URL}
          alt={`${SITE.name} — Flexi Knee Patches`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </FadeIn>
    </section>
  );
}
