import { Section, SectionHeading } from "@/components/layout/section";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { ReviewsCarousel } from "@/features/reviews/components/reviews-carousel";
import { DEMO_REVIEWS } from "@/features/reviews/data/demo-reviews";
import { createPublicClient } from "@/lib/supabase/client";
import type { ReviewRow } from "@/lib/supabase/types";

async function getPublishedReviews(): Promise<ReviewRow[]> {
  const supabase = createPublicClient();
  if (!supabase) return DEMO_REVIEWS;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(9);

  if (error) {
    console.error("failed to load reviews", error);
    return DEMO_REVIEWS;
  }

  const reviews = (data as ReviewRow[] | null) ?? [];
  return reviews.length > 0 ? reviews : DEMO_REVIEWS;
}

export async function ReviewsSection() {
  const reviews = await getPublishedReviews();

  return (
    <Section className="relative overflow-hidden bg-brand-emerald-100/30">
      <AmbientBackground variant="sand" className="opacity-70" />
      <SectionHeading
        eyebrow="Customer stories"
        title="What people are saying"
      />

      <ReviewsCarousel reviews={reviews} />
    </Section>
  );
}
