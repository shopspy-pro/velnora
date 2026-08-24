import { getSiteContent } from "@/lib/admin/queries";
import {
  updateSiteContentAction,
  updateBenefitAction,
  updateUsageStepAction,
  updateComparisonColumnsAction,
  updateComparisonRowAction,
  updateTrustBadgeAction,
  updateSeoAction,
  updateVideoContentAction,
} from "@/lib/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Homepage content</h1>
        <p className="text-sm text-muted-foreground">
          Edit the copy shown on the storefront. Layout and design stay
          exactly as they are — only text changes here.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Hero &amp; trust</h2>
        <AdminForm action={updateSiteContentAction} className="mt-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heroHeading">Hero heading</Label>
            <Input id="heroHeading" name="heroHeading" defaultValue={content.heroHeading} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heroDescription">Hero description</Label>
            <Textarea
              id="heroDescription"
              name="heroDescription"
              defaultValue={content.heroDescription}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heroCtaText">CTA button text</Label>
            <Input id="heroCtaText" name="heroCtaText" defaultValue={content.heroCtaText} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trustMessages">Trust messages (one per line)</Label>
            <Textarea
              id="trustMessages"
              name="trustMessages"
              defaultValue={content.trustMessages.join("\n")}
              className="min-h-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="howItWorksIntro">&ldquo;How It Works&rdquo; intro</Label>
            <Textarea
              id="howItWorksIntro"
              name="howItWorksIntro"
              defaultValue={content.howItWorksIntro}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guaranteeTitle">Guarantee title</Label>
            <Input id="guaranteeTitle" name="guaranteeTitle" defaultValue={content.guaranteeTitle} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guaranteeDescription">Guarantee description</Label>
            <Textarea
              id="guaranteeDescription"
              name="guaranteeDescription"
              defaultValue={content.guaranteeDescription}
            />
          </div>
        </AdminForm>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Video</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Controls both the &ldquo;Watch how it works&rdquo; section and the small floating
          video bubble. Use a YouTube link, or upload your own video file — whichever
          is selected below is what shows on the site.
        </p>
        <AdminForm action={updateVideoContentAction} className="mt-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="video-source">Video source</Label>
            <select
              id="video-source"
              name="source"
              defaultValue={content.video.source}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="youtube">YouTube link</option>
              <option value="upload">Uploaded video file</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="video-youtube-url">YouTube link</Label>
            <Input
              id="video-youtube-url"
              name="youtubeUrl"
              placeholder="https://youtube.com/shorts/..."
              defaultValue={content.video.youtubeUrl}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="video-file">Upload a video file</Label>
            <input
              id="video-file"
              name="file"
              type="file"
              accept="video/*"
              className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
            />
            {content.video.uploadUrl && (
              <p className="text-xs text-muted-foreground">
                Current uploaded file: {content.video.uploadUrl.split("/").pop()}
              </p>
            )}
          </div>
        </AdminForm>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Benefits</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The four benefit cards on the homepage. Icons and layout stay fixed — only text is editable.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {content.benefits.map((benefit) => (
            <div key={benefit.id} className="rounded-xl border border-border p-4">
              <AdminForm action={updateBenefitAction} submitLabel="Save">
                <input type="hidden" name="id" value={benefit.id} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`title-${benefit.id}`}>Title</Label>
                  <Input id={`title-${benefit.id}`} name="title" defaultValue={benefit.title} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`desc-${benefit.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${benefit.id}`}
                    name="description"
                    defaultValue={benefit.description}
                    className="min-h-20"
                    required
                  />
                </div>
              </AdminForm>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">How to apply — steps</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The four numbered steps in the &ldquo;Getting started&rdquo; section.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {content.usageSteps.map((step) => (
            <div key={step.step} className="rounded-xl border border-border p-4">
              <AdminForm action={updateUsageStepAction} submitLabel="Save">
                <input type="hidden" name="step" value={step.step} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`step-title-${step.step}`}>Step {step.step} title</Label>
                  <Input id={`step-title-${step.step}`} name="title" defaultValue={step.title} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`step-desc-${step.step}`}>Description</Label>
                  <Textarea
                    id={`step-desc-${step.step}`}
                    name="description"
                    defaultValue={step.description}
                    className="min-h-20"
                    required
                  />
                </div>
              </AdminForm>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Comparison table</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          &ldquo;Why people switch to Velnora&rdquo; table. For a cell, type{" "}
          <code>true</code> or <code>false</code> for a checkmark/dash, or any other text (like{" "}
          <code>2–4 hours</code>) to show that text instead.
        </p>

        <div className="mt-4 rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium">Column headers</h3>
          <AdminForm action={updateComparisonColumnsAction} submitLabel="Save" className="mt-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="col-velnora">Velnora column</Label>
                <Input
                  id="col-velnora"
                  name="velnora"
                  defaultValue={content.comparisonTable.columns.velnora}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="col-patches">Generic patches column</Label>
                <Input
                  id="col-patches"
                  name="patches"
                  defaultValue={content.comparisonTable.columns.patches}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="col-pills">Oral relief column</Label>
                <Input
                  id="col-pills"
                  name="pills"
                  defaultValue={content.comparisonTable.columns.pills}
                  required
                />
              </div>
            </div>
          </AdminForm>
        </div>

        <div className="mt-4 grid gap-4">
          {content.comparisonTable.rows.map((row, index) => (
            <div key={index} className="rounded-xl border border-border p-4">
              <AdminForm action={updateComparisonRowAction} submitLabel="Save">
                <input type="hidden" name="index" value={index} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`row-feature-${index}`}>Feature</Label>
                  <Input id={`row-feature-${index}`} name="feature" defaultValue={row.feature} required />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`row-velnora-${index}`}>Velnora</Label>
                    <Input id={`row-velnora-${index}`} name="velnora" defaultValue={String(row.velnora)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`row-patches-${index}`}>Generic patches</Label>
                    <Input id={`row-patches-${index}`} name="patches" defaultValue={String(row.patches)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`row-pills-${index}`}>Oral relief</Label>
                    <Input id={`row-pills-${index}`} name="pills" defaultValue={String(row.pills)} />
                  </div>
                </div>
              </AdminForm>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Trust badges</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Shown in the scrolling marquee strip and the footer (footer shows the first five).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {content.trustBadges.map((badge) => (
            <div key={badge.id} className="rounded-xl border border-border p-3">
              <AdminForm action={updateTrustBadgeAction} submitLabel="Save" className="gap-2">
                <input type="hidden" name="id" value={badge.id} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`badge-${badge.id}`} className="sr-only">
                    Badge label
                  </Label>
                  <Input id={`badge-${badge.id}`} name="label" defaultValue={badge.label} required />
                </div>
              </AdminForm>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-heading text-base font-medium">Homepage SEO</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The title and description shown in Google search results and browser tabs.
        </p>
        <AdminForm action={updateSeoAction} className="mt-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seo-title">SEO title</Label>
            <Input id="seo-title" name="title" defaultValue={content.seo.title} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seo-description">SEO description</Label>
            <Textarea id="seo-description" name="description" defaultValue={content.seo.description} required />
          </div>
        </AdminForm>
      </div>
    </div>
  );
}
