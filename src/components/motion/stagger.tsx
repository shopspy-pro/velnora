"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { AriaAttributes, ElementType, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface StaggerGroupProps extends AriaAttributes {
  children: ReactNode;
  className?: string;
  gap?: number;
  as?: ElementType;
  role?: string;
}

/** Wrap a list/grid of StaggerItem children to reveal them in sequence. */
export const StaggerGroup = forwardRef<HTMLDivElement, StaggerGroupProps>(
  function StaggerGroup({ children, className, gap = 0.09, as = "div", ...rest }, ref) {
    const shouldReduceMotion = useReducedMotion();
    const MotionTag = motion[as as "div"];
    const container: Variants = {
      hidden: {},
      visible: {
        transition: shouldReduceMotion
          ? {}
          : { staggerChildren: gap, delayChildren: 0.05 },
      },
    };

    return (
      <MotionTag
        ref={ref}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  }
);

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as as "div"];
  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: EASE },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
