import type { Metadata } from "next";
import { Prose } from "@/components/layout/prose";
import { PolicyMarkdown } from "@/components/layout/policy-markdown";
import { getStorefrontPolicyPage } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStorefrontPolicyPage("terms");
  return {
    title: page?.metaTitle || "Terms of Service",
    description: page?.metaDescription || "The terms that govern your use of the Velnora website and your orders.",
  };
}

export default async function TermsPage() {
  const page = await getStorefrontPolicyPage("terms");

  return (
    <Prose>
      <h1>{page?.title ?? "Terms of Service"}</h1>
      <PolicyMarkdown body={page?.body ?? "Content coming soon."} />
    </Prose>
  );
}
