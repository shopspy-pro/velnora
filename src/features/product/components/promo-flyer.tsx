import Image from "next/image";
import { Section, SectionHeading } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { SITE } from "@/lib/constants";

const PROMO_IMAGE_URL =
  "https://bpzlzesbedyvuqobdolb.supabase.co/storage/v1/object/public/site-media/velnora-redesign/promo_flyer.jpg";

export function PromoFlyer() {
  return (
    <Section className="bg-brand-sage-100">
      <SectionHeading eyebrow="Special offer" title="Relief you can feel" />
      <FadeIn y={16} className="mx-auto mt-10 w-full max-w-2xl">
        <div className="relative aspect-[1254/1009] w-full overflow-hidden rounded-3xl shadow-elevated">
          <Image
            src={PROMO_IMAGE_URL}
            alt={`${SITE.name} — natural relief for knee pain`}
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
          />
        </div>
      </FadeIn>
    </Section>
  );
}
