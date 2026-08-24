"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/features/product/components/product-gallery";

interface LightboxProps {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, activeIndex, onClose, onNavigate }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const active = images[activeIndex];

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        onNavigate((activeIndex + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        onNavigate((activeIndex - 1 + images.length) % images.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length, onClose, onNavigate]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${active.label} — image viewer`}
        className="fixed inset-0 z-100 flex items-center justify-center bg-brand-stone-900/90 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close image viewer"
          onClick={onClose}
          className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X />
        </button>

        <button
          type="button"
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-6"
        >
          <ChevronLeft />
        </button>

        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square w-full max-w-lg overflow-hidden rounded-2xl shadow-elevated md:max-w-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={active.src}
            alt={active.label}
            fill
            sizes="(min-width: 768px) 576px, 100vw"
            className="object-cover"
          />
        </motion.div>

        <button
          type="button"
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex + 1) % images.length);
          }}
          className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6"
        >
          <ChevronRight />
        </button>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((image, i) => (
            <button
              key={image.assetSlot}
              type="button"
              aria-label={`View ${image.label}`}
              aria-current={i === activeIndex}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(i);
              }}
              className={`h-1.5 rounded-full bg-white/40 transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-white" : "w-1.5"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
