"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ReviewRow } from "@/lib/supabase/types";

/**
 * Featured-testimonial spotlight — one review at a time with a word-by-word
 * blur-in reveal, adapted from the classic "animated testimonials" pattern.
 * Uses the initials Avatar (not a photo) since these are real customer
 * reviews without customer photos — no stock/stranger images stand in for
 * a real reviewer's face.
 */
export function ReviewsCarousel({
  reviews,
  autoplay = false,
}: {
  reviews: ReviewRow[];
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);
  const review = reviews[active];

  function handleNext() {
    setActive((prev) => (prev + 1) % reviews.length);
  }

  function handlePrev() {
    setActive((prev) => (prev - 1 + reviews.length) % reviews.length);
  }

  useEffect(() => {
    if (!autoplay || reviews.length < 2) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reviews.length]);

  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
      <div className="flex justify-center md:justify-start">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-[2] rounded-full bg-brand-emerald-100/50 blur-2xl"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotate: 6 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <Avatar
                name={review.customer_name}
                className="size-24 text-2xl md:size-32 md:text-3xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={review.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h3 className="font-heading text-xl font-medium">
                {review.customer_name}
              </h3>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-xs font-medium text-brand-emerald-700">
                  <ShieldCheck className="size-3.5" />
                  Verified Purchase
                </span>
              )}
            </div>

            <div
              className="mt-1.5 flex items-center justify-center gap-0.5 md:justify-start"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-4"
                  fill={i < review.rating ? "currentColor" : "none"}
                  strokeWidth={1.5}
                  color="var(--color-brand-bronze-600)"
                />
              ))}
            </div>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              {review.body.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * i }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </p>
          </motion.div>
        </AnimatePresence>

        {reviews.length > 1 && (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="group flex size-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-brand-emerald-100"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="group flex size-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-brand-emerald-100"
            >
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>

            <div className="ml-2 flex items-center gap-1.5">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full bg-brand-emerald-900/25 transition-all duration-300",
                    i === active ? "w-6 bg-brand-emerald-900" : "w-1.5"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
