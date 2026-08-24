import type { Metadata } from "next";
import { Prose } from "@/components/layout/prose";
import { PolicyMarkdown } from "@/components/layout/policy-markdown";
import { getStorefrontPolicyPage } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStorefrontPolicyPage("about");
  return {
    title: page?.metaTitle || "About Velnora",
    description:
      page?.metaDescription ||
      "Velnora designs thoughtful, everyday wellness products for the UAE — starting with Flexi Knee Patches.",
  };
}

export default async function AboutPage() {
  const page = await getStorefrontPolicyPage("about");

  return (
    <Prose>
      <h1>{page?.title ?? "About Velnora"}</h1>
      <PolicyMarkdown body={page?.body ?? "Content coming soon."} />
    </Prose>
  );
}
