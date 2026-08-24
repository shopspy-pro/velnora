import type { Metadata } from "next";
import { FaqAccordion } from "@/features/product/components/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Flexi Knee Patches.",
};

export default function FaqPage() {
  return <FaqAccordion />;
}
