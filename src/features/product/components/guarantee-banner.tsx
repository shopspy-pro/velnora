"use client";

import { ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/motion/fade-in";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { TrustMarquee, type TrustBadge } from "@/components/motion/trust-marquee";

function GuaranteeIcon() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className="flex size-16 items-center justify-center rounded-full bg-brand-bronze-400/10 ring-1 ring-brand-bronze-400/30"
      initial={shouldReduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <ShieldCheck className="size-8 text-brand-bronze-400" strokeWidth={1.25} />
    </motion.span>
  );
}

export function GuaranteeBanner({
  title,
  description,
  trustBadges,
}: {
  title: string;
  description: string;
  trustBadges?: TrustBadge[];
}) {
  return (
    <section className="relative overflow-hidden bg-brand-emerald-900">
      <AmbientBackground variant="bronze" className="opacity-60" />
      <FadeIn className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center md:px-6">
        <GuaranteeIcon />
        <h2 className="font-heading text-2xl font-medium text-brand-sand-50 md:text-3xl">
          {title}
        </h2>
        <p className="text-balance text-brand-sand-100/80 md:text-lg">
          {description}
        </p>
        <TrustMarquee className="mt-4 max-w-xl" badges={trustBadges} />
      </FadeIn>
    </section>
  );
}
