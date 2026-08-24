import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { CartButton } from "@/features/cart/components/cart-button";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 shadow-soft backdrop-blur-md transition-shadow duration-300">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="font-heading text-2xl font-medium italic tracking-tight text-brand-emerald-900 transition-opacity hover:opacity-80"
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-3.5 py-2 text-[13px] font-medium tracking-wide text-foreground/75 uppercase transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-px h-px origin-center scale-x-0 bg-brand-bronze-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <MagneticButton
            className="hidden lg:inline-block"
            rounded="rounded-[min(var(--radius-md),12px)]"
          >
            <Link
              href="/#product"
              className={buttonVariants({ variant: "cta", size: "sm" })}
            >
              Shop Now
            </Link>
          </MagneticButton>
          <CartButton />
          <MobileNav />
        </div>
      </div>
      <CartDrawer />
    </header>
  );
}
