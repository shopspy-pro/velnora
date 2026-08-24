import Image from "next/image";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";

export function ProblemAgitation({
  image,
}: {
  image?: { url: string; alt: string };
}) {
  if (!image) {
    return (
      <Section className="bg-white" containerClassName="max-w-3xl">
        <FadeIn className="flex flex-col gap-5 text-center">
          <Copy />
        </FadeIn>
      </Section>
    );
  }

  return (
    <Section className="bg-white">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <FadeIn y={16} className="relative order-2 aspect-4/5 overflow-hidden rounded-3xl shadow-elevated md:order-1">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </FadeIn>
        <FadeIn delay={0.1} y={16} className="order-1 flex flex-col gap-5 md:order-2">
          <Copy />
        </FadeIn>
      </div>
    </Section>
  );
}

function Copy() {
  return (
    <>
      <h2 className="text-balance font-heading text-3xl leading-[1.1] font-medium tracking-tight md:text-4xl">
        Stairs shouldn&apos;t feel like a decision.
      </h2>
      <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
        Long shifts on your feet, a morning walk, or just getting up from
        the sofa — a tired, achy knee has a way of making ordinary moments
        feel like hard work. Most people reach for an ice pack, a
        heating pad they can&apos;t wear out of the house, or nothing at
        all.
      </p>
      <p className="text-balance font-heading text-xl leading-snug italic text-brand-emerald-900 md:text-2xl">
        Flexi Knee Patches were designed to go where those solutions
        can&apos;t — quietly, comfortably, under your clothes, all day.
      </p>
    </>
  );
}
