import Link from "next/link";
import { FileText } from "lucide-react";
import { getPolicyPages } from "@/lib/admin/queries";

export default async function AdminPagesListPage() {
  const pages = await getPolicyPages();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Pages</h1>
        <p className="text-sm text-muted-foreground">
          Edit the full text of About, Contact, Privacy Policy, Terms, and Shipping &amp; Returns.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/pages/${page.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-brand-emerald-700/50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-emerald-100 text-brand-emerald-900">
              <FileText className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{page.title}</p>
              <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
