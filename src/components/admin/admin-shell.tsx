"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarPhoto, AvatarPhotoFallback } from "@/components/ui/avatar-photo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./admin-nav";
import { logoutAction } from "@/lib/admin/actions";

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ adminEmail }: { adminEmail: string }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-muted"
        >
          <AvatarPhoto className="size-8">
            <AvatarPhotoFallback>{getInitials(adminEmail)}</AvatarPhotoFallback>
          </AvatarPhoto>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {adminEmail}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <p className="truncate px-2 pb-1.5 text-xs text-muted-foreground">{adminEmail}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onSelect={() => setOpen(false)}>
          <Link href="/admin/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            setOpen(false);
            void logoutAction();
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="font-heading text-lg italic text-brand-emerald-900">
            Velnora
          </span>
          <span className="rounded-full bg-brand-bronze-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-bronze-600">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t border-border p-2">
          <UserMenu adminEmail={adminEmail} />
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <span className="font-heading text-base italic text-brand-emerald-900">
          Velnora <span className="text-xs not-italic text-brand-bronze-600">Admin</span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open admin menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </Button>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2 font-heading text-base italic">
              Velnora
              <span className="rounded-full bg-brand-bronze-100 px-2 py-0.5 text-[10px] font-semibold not-italic uppercase tracking-wide text-brand-bronze-600">
                Admin
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-border p-2">
            <UserMenu adminEmail={adminEmail} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
