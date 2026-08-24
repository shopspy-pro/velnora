import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

const ROUTES = [
  "",
  "/about",
  "/contact",
  "/faq",
  "/shipping-returns",
  "/privacy-policy",
  "/terms",
  "/track-order",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
