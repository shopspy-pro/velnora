import type { Metadata } from "next";
import { Prose } from "@/components/layout/prose";
import { PolicyMarkdown } from "@/components/layout/policy-markdown";
import { getStorefrontPolicyPage } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStorefrontPolicyPage("privacy-policy");
  return {
    title: page?.metaTitle || "Privacy Policy",
    description: page?.metaDescription || "How Velnora collects, uses, and protects your information.",
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getStorefrontPolicyPage("privacy-policy");

  return (
    <Prose>
      <h1>{page?.title ?? "Privacy Policy"}</h1>
      <p>
        Last updated:{" "}
        {new Date().toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <PolicyMarkdown body={page?.body ?? "Content coming soon."} />
    </Prose>
  );
}
