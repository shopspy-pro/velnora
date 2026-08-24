"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </Button>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-heading text-lg italic">
            {SITE.name}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-4 pb-4">
          <Link
            href="/#product"
            onClick={() => setIsOpen(false)}
            className={buttonVariants({
              variant: "cta",
              size: "xl",
              className: "w-full",
            })}
          >
            Shop Flexi Knee Patches
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
