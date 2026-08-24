"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

const DEFAULT_SHOTS = [
  {
    label: "Morning routine",
    assetSlot: "lifestyle-morning",
    src: "/images/product/lifestyle-sleep.jpg",
  },
  {
    label: "On your feet at work",
    assetSlot: "lifestyle-work",
    src: "/images/product/lifestyle-garden.jpg",
  },
  {
    label: "Out walking",
    assetSlot: "lifestyle-walking",
    src: "/images/product/lifestyle-stairs.jpg",
  },
  {
    label: "Light movement",
    assetSlot: "lifestyle-exercise",
    src: "/images/product/lifestyle-cycling.jpg",
  },
];

export interface GalleryShot {
  label: string;
  assetSlot: string;
  src: string;
}

export function Gallery({ shots = DEFAULT_SHOTS }: { shots?: GalleryShot[] }) {
  const SHOTS = shots.length > 0 ? shots : DEFAULT_SHOTS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updateState() {
      if (!track) return;
      setCanScrollPrev(track.scrollLeft > 8);
      setCanScrollNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
    }

    updateState();
    track.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      track.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, []);

  function scrollByDirection(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="A day with Velnora"
        title="Wherever your day takes you"
      />
      <StaggerGroup
        ref={trackRef}
        className="scroll-fade-x mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar md:grid md:grid-cols-4 md:overflow-visible"
      >
        {SHOTS.map(({ label, assetSlot, src }) => (
          <StaggerItem
            key={assetSlot}
            className="w-[70%] shrink-0 snap-start md:w-auto"
          >
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-[1.02]">
              <Image
                src={src}
                alt={label}
                fill
                sizes="(min-width: 768px) 25vw, 70vw"
                className="object-cover"
              />
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous photos"
          disabled={!canScrollPrev}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next photos"
          disabled={!canScrollNext}
          onClick={() => scrollByDirection(1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </Section>
  );
}
