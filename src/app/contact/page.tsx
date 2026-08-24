import type { Metadata } from "next";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { Prose } from "@/components/layout/prose";
import { PolicyMarkdown } from "@/components/layout/policy-markdown";
import { getStorefrontPolicyPage, getStorefrontContactInfo } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStorefrontPolicyPage("contact");
  return {
    title: page?.metaTitle || "Contact Us",
    description: page?.metaDescription || "Get in touch with the Velnora customer care team.",
  };
}

export default async function ContactPage() {
  const [page, contactInfo] = await Promise.all([
    getStorefrontPolicyPage("contact"),
    getStorefrontContactInfo(),
  ]);

  return (
    <Prose>
      <h1>{page?.title ?? "Contact us"}</h1>
      <PolicyMarkdown
        body={
          page?.body ??
          "Questions about your order, the product, or anything else? We're based in the UAE and happy to help."
        }
      />

      <div className="mt-8 flex flex-col gap-4">
        <a
          href={`mailto:${contactInfo.email}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 no-underline hover:border-brand-emerald-700/50"
        >
          <Mail className="size-5 text-brand-emerald-900" />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
          </div>
        </a>
        <a
          href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 no-underline hover:border-brand-emerald-700/50"
        >
          <MessageCircle className="size-5 text-brand-emerald-900" />
          <div>
            <p className="text-sm font-medium text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground">{contactInfo.whatsapp}</p>
          </div>
        </a>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Clock className="size-5 text-brand-emerald-900" />
          <div>
            <p className="text-sm font-medium text-foreground">Support hours</p>
            <p className="text-sm text-muted-foreground">{contactInfo.hours}</p>
          </div>
        </div>
      </div>
    </Prose>
  );
}
