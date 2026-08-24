import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  FileText,
  Star,
  HelpCircle,
  BarChart3,
  Settings,
  MessageCircle,
  Image as ImageIcon,
  Files,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Inbox", href: "/admin/inbox", icon: MessageCircle },
  { label: "Product", href: "/admin/product", icon: Package },
  { label: "Packages", href: "/admin/packages", icon: Boxes },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Pages", href: "/admin/pages", icon: Files },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
