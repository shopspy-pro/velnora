# Velnora — Image Shot List & AI Generation Prompts

Every image slot below is currently rendered as a branded placeholder (see
[`PlaceholderImage`](../src/components/ui/placeholder-image.tsx)) with a
visible `assetSlot` tag matching the names here. To replace a placeholder:

1. Generate or shoot the image described below.
2. Export at the aspect ratio noted (crop to exact ratio before upload).
3. Save into `public/images/product/<slot-name>.jpg` (create the folder).
4. In the matching component, swap `<PlaceholderImage .../>` for `next/image`
   pointing at the new file — the `label`/`className` props carry over
   directly as `alt`/`className`.

Brand direction for every shot: warm, calm, premium wellness — think soft
natural light, muted sand/emerald/bronze tones, no harsh clinical white, no
visible faces required (hands/knee/lifestyle framing preferred for a
comfort product). Avoid stock-photo gloss; favour a slightly editorial,
Aesop/Ouai-adjacent aesthetic.

---

## Hero (`src/features/product/components/hero.tsx`)

### `hero-main` — aspect 1:1 (mobile) / 4:5 (desktop)
> Editorial product shot of a single self-adhesive knee patch (soft sand-beige
> fabric, subtle emerald-green brand marking) resting on a warm linen surface
> beside a folded neutral-toned towel, shot from above at a slight angle,
> soft natural window light from the left, shallow depth of field, warm
> emerald and sand color grading, minimal premium wellness aesthetic, no
> text, no logos, high resolution product photography style.

### `hero-thumb-1` — aspect 1:1
> Close-up lifestyle photo of a person's hand smoothing a self-adhesive knee
> patch onto their own knee, soft daylight, warm skin tones, cropped below
> the face, neutral loungewear, calm and unhurried mood, shallow depth of
> field, muted sand and emerald color palette, no visible logos.

### `hero-thumb-2` — aspect 1:1
> Flat-lay product packaging photo: a minimalist emerald-green and sand
> cardboard box labeled "Flexi Knee Patches" by Velnora, lid off, a neat row
> of individually wrapped patches visible inside, styled on a warm neutral
> linen background with a small sprig of dried eucalyptus beside it, soft
> top-down natural light, premium unboxing aesthetic, no other text overlays.

### `hero-thumb-3` — aspect 1:1
> Macro close-up photograph of the knee patch's textured material — visible
> weave of the breathable fabric layer and a faint mineral-flecked core
> layer, shot at a steep angle with soft raking light to show texture,
> warm neutral tones with a hint of emerald, extremely shallow depth of
> field, no text.

---

## Lifestyle Gallery (`src/features/product/components/gallery.tsx`)

All four images: aspect 3:4, consistent warm/editorial grading so they read
as one cohesive set when placed in a row.

### `lifestyle-morning`
> Lifestyle photograph of a person's legs and feet stepping out of bed onto
> a warm wooden floor in soft morning light, cropped below the waist, calm
> unhurried mood, neutral bedding in sand tones, warm sunlight streaming in,
> no visible face, editorial wellness photography style.

### `lifestyle-work`
> Lifestyle photograph from the waist down of a person standing at a
> reception desk or shop counter, one leg slightly forward, professional
> neutral-toned clothing, warm indoor lighting, candid unposed feel, no
> visible face, editorial commercial photography style.

### `lifestyle-walking`
> Lifestyle photograph of a person's legs walking along an outdoor path or
> promenade (Dubai Marina-style waterfront optional), mid-stride, casual
> neutral athleisure, warm late-afternoon light with long soft shadows, no
> visible face, aspirational but grounded mood.

### `lifestyle-exercise`
> Lifestyle photograph of a person doing a light stretch or gentle floor
> exercise on a yoga mat at home, knee area in focus, soft warm indoor
> light, calm and low-intensity mood (not a gym/high-performance shot),
> neutral tones, no visible face, editorial wellness photography style.

---

## Already covered in code (no photography needed)

- **Open Graph / social share image** — generated dynamically at build time
  from brand colors and typography via
  [`src/app/opengraph-image.tsx`](../src/app/opengraph-image.tsx) using
  `next/og`. No action needed unless the brand palette changes.

## Optional future additions

- **Favicon / app icon** — currently using the Next.js default
  `src/app/favicon.ico`. Replace with a Velnora "V" wordmark or emblem once
  final branding assets exist (`src/app/icon.png`, 512×512, transparent
  background, emerald-on-transparent or sand-on-transparent mark).
- **Packaging render** — if Flexi Knee Patches box design is finalized
  digitally before physical production, a 3D packaging render can replace
  `hero-thumb-2` ahead of real photography.
