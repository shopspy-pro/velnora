import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPolicyPage } from "@/lib/admin/queries";
import { updatePolicyPageAction } from "@/lib/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPolicyPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/pages"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to pages
        </Link>
        <h1 className="font-heading text-2xl font-medium">{page.title}</h1>
        <p className="text-sm text-muted-foreground">/{page.slug}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <AdminForm action={updatePolicyPageAction}>
          <input type="hidden" name="slug" value={page.slug} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Page title</Label>
            <Input id="title" name="title" defaultValue={page.title} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metaTitle">SEO title</Label>
              <Input id="metaTitle" name="metaTitle" defaultValue={page.metaTitle ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metaDescription">SEO description</Label>
              <Input id="metaDescription" name="metaDescription" defaultValue={page.metaDescription ?? ""} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Page content</Label>
            <p className="text-xs text-muted-foreground">
              Start a line with <code>## </code> for a heading, <code>- </code> for a bullet
              point, and leave a blank line between paragraphs.
            </p>
            <Textarea
              id="body"
              name="body"
              defaultValue={page.body}
              required
              className="min-h-96 font-mono text-sm"
            />
          </div>
        </AdminForm>
      </div>
    </div>
  );
}
