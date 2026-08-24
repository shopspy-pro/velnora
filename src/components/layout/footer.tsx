import Link from "next/link";
import { Banknote, Clock, Lock, MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { FOOTER_LINKS, SITE, SOCIAL } from "@/lib/constants";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { getStorefrontContent, getStorefrontContactInfo } from "@/lib/storefront-data";

const BADGE_ICONS = {
  shipping: Truck,
  cod: Banknote,
  returns: RotateCcw,
  secure: ShieldCheck,
  ssl: Lock,
  wear: Clock,
  emirates: MapPin,
} as const;

export async function Footer() {
  const [content, contactInfo] = await Promise.all([
    getStorefrontContent(),
    getStorefrontContactInfo(),
  ]);
  const footerBadges = content.trustBadges.slice(0, 5);

  return (
    <footer className="border-t border-border bg-brand-sand-100">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <StaggerGroup className="grid gap-4 border-b border-border pb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {footerBadges.map((badge) => {
            const Icon = BADGE_ICONS[badge.id as keyof typeof BADGE_ICONS] ?? ShieldCheck;
            return (
              <StaggerItem key={badge.id} className="flex items-center gap-2.5">
                <Icon className="size-5 shrink-0 text-brand-emerald-900" />
                <span className="text-sm font-medium">{badge.label}</span>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <div className="grid gap-10 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-heading text-2xl font-medium italic text-brand-emerald-900">
              {contactInfo.storeName}
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">
              {SITE.tagline}. Designed for everyday comfort, delivered across
              the UAE.
            </p>
            <NewsletterForm />
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Policies" links={FOOTER_LINKS.policies} />
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${contactInfo.email}`}
              className="hover:text-foreground"
            >
              {contactInfo.email}
            </a>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Instagram
            </a>
            <a
              href={SOCIAL.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-sm font-medium">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
