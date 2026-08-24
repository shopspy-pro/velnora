"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Layers, Sun, Waves } from "lucide-react";
import { SectionHeading } from "@/components/layout/section";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { cn } from "@/lib/utils";

const DEFAULT_SRCS = [
  "/images/product/patch-bent.jpg",
  "/images/product/on-the-knee.jpg",
  "/images/product/hero-main.jpg",
];

const BEAT_META = [
  {
    icon: Layers,
    assetSlot: "story-fabric",
    title: "Breathable fabric base",
    description:
      "A soft, flexible layer that moves with your knee and stays comfortable through hours of wear — thin enough to disappear under everyday clothing.",
  },
  {
    icon: Sun,
    assetSlot: "story-core",
    title: "Far-infrared & tourmaline core",
    description:
      "Tourmaline mineral particles interact with your body's own warmth to generate a gentle, far-infrared heat — no batteries, no charging, no setup.",
  },
  {
    icon: Waves,
    assetSlot: "story-warmth",
    title: "Steady, wearable warmth",
    description:
      "That warmth radiates evenly across the patch for up to 12 hours — no hot spots, no bulk, just consistent comfort that keeps pace with your day.",
  },
] as const;

export function ProductStory({
  images,
}: {
  images?: { url: string; alt: string }[];
}) {
  const BEATS = BEAT_META.map((meta, i) => ({
    ...meta,
    src: images?.[i]?.url ?? DEFAULT_SRCS[i],
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    beatRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const active = BEATS[activeIndex];

  return (
    <section id="how-it-works" className="relative py-16 md:py-24">
      <AmbientBackground variant="emerald" className="opacity-50" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="The technology"
          title="How Flexi Knee Patches work"
          description="Three layers, working together to bring soothing warmth exactly where you need it."
        />

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="order-1 md:order-2">
            <div className="sticky top-24">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-elevated md:aspect-4/5">
                <motion.div
                  key={activeIndex}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 1.03 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.src}
                    alt={active.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>

                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {BEATS.map((beat, i) => (
                    <span
                      key={beat.title}
                      className={cn(
                        "h-1.5 rounded-full bg-white/50 transition-all duration-300",
                        i === activeIndex ? "w-6 bg-white" : "w-1.5"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-2 flex flex-col md:order-1 md:pl-8">
            <div className="absolute left-0 top-1 hidden h-[calc(100%-1rem)] w-px bg-border md:block">
              <motion.div
                className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-brand-emerald-900 shadow-glow"
                animate={{
                  top: `${(activeIndex / (BEATS.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {BEATS.map((beat, index) => (
              <div
                key={beat.title}
                ref={(el) => {
                  beatRefs.current[index] = el;
                }}
                data-index={index}
                className="flex min-h-[65vh] flex-col justify-center gap-4 py-8 md:min-h-[70vh]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                      index === activeIndex
                        ? "bg-brand-emerald-900 text-brand-sand-50"
                        : "bg-brand-emerald-100 text-brand-emerald-900/50"
                    )}
                  >
                    <beat.icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-heading text-sm text-muted-foreground">
                    Layer {index + 1} of {BEATS.length}
                  </span>
                </div>
                <h3
                  className={cn(
                    "font-heading text-2xl font-medium transition-opacity duration-500 md:text-3xl",
                    index === activeIndex ? "opacity-100" : "opacity-40"
                  )}
                >
                  {beat.title}
                </h3>
                <p
                  className={cn(
                    "max-w-md text-base text-muted-foreground transition-opacity duration-500",
                    index === activeIndex ? "opacity-100" : "opacity-40"
                  )}
                >
                  {beat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
