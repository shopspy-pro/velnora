import type { Metadata } from "next";
import { Prose } from "@/components/layout/prose";
import { PolicyMarkdown } from "@/components/layout/policy-markdown";
import { getStorefrontPolicyPage } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStorefrontPolicyPage("shipping-returns");
  return {
    title: page?.metaTitle || "Shipping & Returns",
    description:
      page?.metaDescription || "Velnora delivery times, fees, and our 30-day return policy for the UAE.",
  };
}

export default async function ShippingReturnsPage() {
  const page = await getStorefrontPolicyPage("shipping-returns");

  return (
    <Prose>
      <h1>{page?.title ?? "Shipping & Returns"}</h1>
      <PolicyMarkdown body={page?.body ?? "Content coming soon."} />
    </Prose>
  );
}
