import { Section, SectionHeading } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { extractYoutubeId } from "@/lib/youtube";

export function VideoShowcase({
  video,
}: {
  video: { source: "youtube" | "upload"; youtubeUrl: string; uploadUrl: string };
}) {
  const ytId = video.source === "youtube" ? extractYoutubeId(video.youtubeUrl) : "";
  if (video.source === "youtube" && !ytId) return null;
  if (video.source === "upload" && !video.uploadUrl) return null;

  return (
    <Section className="bg-brand-sage-100">
      <SectionHeading eyebrow="See it in action" title="Watch how it works" />
      <FadeIn y={16} className="mx-auto mt-10 w-full max-w-sm">
        <div className="aspect-9/16 overflow-hidden rounded-3xl shadow-elevated">
          {video.source === "youtube" ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              title="Flexi Knee Patches — video"
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.uploadUrl}
              controls
              playsInline
              className="size-full object-cover"
            />
          )}
        </div>
      </FadeIn>
    </Section>
  );
}
