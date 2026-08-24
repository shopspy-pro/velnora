"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// A lingering `transform` (even at its resting value) creates a new
// containing block per the CSS spec, which silently breaks any
// `position: fixed`/`sticky` descendant. Framer Motion keeps the transform
// style applied at rest, so it's cleared once the intro animation finishes.
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (ref.current) ref.current.style.transform = "none";
      }}
    >
      {children}
    </motion.div>
  );
}
