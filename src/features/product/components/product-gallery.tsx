"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";

const Lightbox = dynamic(
  () => import("@/components/ui/lightbox").then((mod) => mod.Lightbox),
  { ssr: false }
);

export interface GalleryImage {
  label: string;
  assetSlot: string;
  src: string;
}

const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    label: "Flexi Knee Patch — hero shot",
    assetSlot: "hero-main",
    src: "/images/product/hero-main.jpg",
  },
  {
    label: "On the knee",
    assetSlot: "hero-thumb-1",
    src: "/images/product/on-the-knee.jpg",
  },
  {
    label: "Packaging",
    assetSlot: "hero-thumb-2",
    src: "/images/product/packaging.jpg",
  },
  {
    label: "Macro detail",
    assetSlot: "hero-thumb-3",
    src: "/images/product/macro-texture.jpg",
  },
];

export function ProductGallery({
  images = DEFAULT_GALLERY_IMAGES,
}: {
  images?: GalleryImage[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const shouldReduceMotion = useReducedMotion();
  const GALLERY_IMAGES = images.length > 0 ? images : DEFAULT_GALLERY_IMAGES;
  const active = GALLERY_IMAGES[activeIndex];

  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-18, 18]
  );

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        ref={parallaxRef}
        style={{ y: parallaxY }}
        className="group relative aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-elevated"
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View ${active.label} full-screen`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
      >
        <motion.div
          key={activeIndex}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div
            className="relative h-full w-full transition-transform duration-300 ease-out group-hover:scale-125"
            style={{ transformOrigin: zoomOrigin }}
          >
            <Image
              src={active.src}
              alt={active.label}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <span className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Expand className="size-4" />
        </span>
      </motion.div>

      <div className="grid grid-cols-4 gap-3">
        {GALLERY_IMAGES.map((image, index) => (
          <button
            key={image.assetSlot}
            type="button"
            aria-label={`Show ${image.label}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-xl ring-offset-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald-700",
              index === activeIndex
                ? "ring-2 ring-brand-emerald-900"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={image.src}
              alt={image.label}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {isLightboxOpen && (
        <Lightbox
          images={GALLERY_IMAGES}
          activeIndex={activeIndex}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}
