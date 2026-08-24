"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbSpec {
  position: string;
  color: string;
  dx: number;
  dy: number;
  duration: number;
  delay?: number;
  parallax: number;
}

const PRESETS: Record<string, OrbSpec[]> = {
  emerald: [
    {
      position: "left-[-10%] top-[-15%] size-[32rem]",
      color: "bg-brand-emerald-700/20",
      dx: 40,
      dy: 30,
      duration: 22,
      parallax: 40,
    },
    {
      position: "right-[-15%] top-[10%] size-[26rem]",
      color: "bg-brand-bronze-400/15",
      dx: -30,
      dy: 40,
      duration: 26,
      delay: 2,
      parallax: -30,
    },
    {
      position: "left-[20%] bottom-[-20%] size-[24rem]",
      color: "bg-brand-emerald-900/10",
      dx: 25,
      dy: -25,
      duration: 30,
      delay: 4,
      parallax: 55,
    },
  ],
  bronze: [
    {
      position: "left-[10%] top-[-10%] size-[28rem]",
      color: "bg-brand-bronze-400/20",
      dx: 30,
      dy: 20,
      duration: 24,
      parallax: 35,
    },
    {
      position: "right-[-10%] bottom-[-15%] size-[26rem]",
      color: "bg-brand-emerald-700/15",
      dx: -25,
      dy: -20,
      duration: 28,
      delay: 3,
      parallax: -40,
    },
  ],
  sand: [
    {
      position: "left-[-5%] top-[0%] size-[24rem]",
      color: "bg-brand-emerald-100/60",
      dx: 20,
      dy: 15,
      duration: 26,
      parallax: 30,
    },
    {
      position: "right-[0%] bottom-[-10%] size-[22rem]",
      color: "bg-brand-bronze-100/50",
      dx: -20,
      dy: 20,
      duration: 30,
      delay: 2,
      parallax: -35,
    },
  ],
};

function Orb({ orb }: { orb: OrbSpec }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-orb.parallax, orb.parallax]
  );

  return (
    <motion.div
      ref={ref}
      className={cn("absolute", orb.position)}
      style={{ y: parallaxY }}
    >
      <motion.div
        className={cn("size-full rounded-full blur-3xl", orb.color)}
        animate={
          shouldReduceMotion ? undefined : { x: [0, orb.dx, 0], y: [0, orb.dy, 0] }
        }
        transition={{
          duration: orb.duration,
          delay: orb.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

export function AmbientBackground({
  variant = "emerald",
  className,
}: {
  variant?: keyof typeof PRESETS;
  className?: string;
}) {
  const orbs = PRESETS[variant];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {orbs.map((orb, i) => (
        <Orb key={i} orb={orb} />
      ))}
    </div>
  );
}
