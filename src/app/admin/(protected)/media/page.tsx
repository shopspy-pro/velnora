import { getMediaAssets } from "@/lib/admin/queries";
import { MediaSectionManager } from "@/components/admin/media-section-manager";

export default async function AdminMediaPage() {
  const [heroGallery, story, dayInLife] = await Promise.all([
    getMediaAssets("hero_gallery"),
    getMediaAssets("story"),
    getMediaAssets("day_in_life"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Media</h1>
        <p className="text-sm text-muted-foreground">
          Manage every photo shown on the storefront. Upload, reorder, edit alt text, or delete —
          changes appear on the website immediately.
        </p>
      </div>

      <MediaSectionManager
        section="hero_gallery"
        title="Product gallery"
        description="The main product photos at the top of the homepage, including the zoomable hero image."
        assets={heroGallery}
      />
      <MediaSectionManager
        section="story"
        title="'How it works' images"
        description="The three images in the sticky scroll story section (fabric, core, warmth). Order matches the three layers."
        assets={story}
      />
      <MediaSectionManager
        section="day_in_life"
        title="'A day with Velnora' gallery"
        description="The four lifestyle photos in the scrolling gallery near the bottom of the homepage."
        assets={dayInLife}
      />
    </div>
  );
}
