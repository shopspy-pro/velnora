"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Suppresses the storefront chrome (announcement bar, header, footer,
 * WhatsApp dock) on /admin routes, since the admin panel has its own UI
 * shell. The chrome elements are rendered server-side in the root layout
 * and passed in as pre-built React elements, so this client component only
 * decides whether to show them — it never re-renders their contents.
 */
export function StorefrontFrame({
  announcement,
  header,
  footer,
  video,
  stickyBuyBar,
  children,
}: {
  announcement: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  video: ReactNode;
  stickyBuyBar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdmin && announcement}
      {!isAdmin && header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isAdmin && footer}
      {!isAdmin && video}
      {!isAdmin && stickyBuyBar}
    </>
  );
}
