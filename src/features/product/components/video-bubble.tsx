"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { extractYoutubeId } from "@/lib/youtube";

export function VideoBubble({
  video,
}: {
  video: { source: "youtube" | "upload"; youtubeUrl: string; uploadUrl: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const ytId = video.source === "youtube" ? extractYoutubeId(video.youtubeUrl) : "";
  if (video.source === "youtube" && !ytId) return null;
  if (video.source === "upload" && !video.uploadUrl) return null;

  const loopSrc =
    video.source === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1`
      : "";
  const fullSrc =
    video.source === "youtube" ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1` : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Watch how it works"
        className="fixed bottom-24 right-4 z-40 w-28 overflow-hidden rounded-2xl shadow-elevated ring-2 ring-white transition-transform hover:scale-105 md:right-6"
      >
        <div className="pointer-events-none relative aspect-9/16 w-full">
          {video.source === "youtube" ? (
            <iframe
              src={loopSrc}
              title="Flexi Knee Patches — preview"
              className="size-full"
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          ) : (
            <video
              src={video.uploadUrl}
              autoPlay
              muted
              loop
              playsInline
              className="size-full object-cover"
            />
          )}
        </div>
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Flexi Knee Patches — video"
              className="fixed inset-0 z-100 flex items-center justify-center bg-brand-stone-900/90 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
            >
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close video"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X />
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-9/16 w-full max-w-xs overflow-hidden rounded-2xl shadow-elevated"
                onClick={(e) => e.stopPropagation()}
              >
                {video.source === "youtube" ? (
                  <iframe
                    src={fullSrc}
                    title="Flexi Knee Patches — video"
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={video.uploadUrl}
                    controls
                    autoPlay
                    playsInline
                    className="size-full object-cover"
                  />
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
