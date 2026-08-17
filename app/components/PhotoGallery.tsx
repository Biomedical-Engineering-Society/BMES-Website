"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./BrandIcons";

export type GalleryPhoto = {
  src: string;
  alt: string;
};

const AUTOPLAY_MS = 5000;

/**
 * Photo stage. Every photo is mounted and crossfaded on opacity, so moving
 * between them never shows a blank frame while a new file loads.
 *
 * Advances on its own until the visitor takes control, then stops for good.
 */
export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState(0);
  const [taken, setTaken] = useState(false);

  const count = photos.length;

  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  /** Any interaction ends autoplay permanently. */
  const take = useCallback((action: () => void) => {
    setTaken(true);
    action();
  }, []);

  useEffect(() => {
    if (taken || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [taken, count]);

  if (count === 0) return null;

  return (
    <div className="group/gallery relative h-[300px] overflow-hidden rounded-[18px] bg-placeholder sm:h-[420px] lg:h-[540px]">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={i === index ? photo.alt : ""}
          fill
          sizes="(max-width: 1024px) 100vw, 1264px"
          priority={i === 0}
          className="object-cover transition-opacity duration-[600ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      {/* Shading at the foot of the frame, to hold the indicators. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(7,27,51,0)_0%,rgba(7,27,51,0.55)_100%)]"
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => take(() => step(-1))}
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[rgba(7,27,51,0.42)] text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white hover:text-ink md:left-6 md:h-12 md:w-12 md:opacity-75 md:group-hover/gallery:opacity-100 md:focus-visible:opacity-100"
      >
        <ArrowLeftIcon size={20} />
      </button>

      <button
        type="button"
        onClick={() => take(() => step(1))}
        aria-label="Next photo"
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[rgba(7,27,51,0.42)] text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white hover:text-ink md:right-6 md:h-12 md:w-12 md:opacity-75 md:group-hover/gallery:opacity-100 md:focus-visible:opacity-100"
      >
        <ArrowRightIcon size={20} />
      </button>

      {/* While autoplay runs, the active indicator fills in time with it. */}
      <div
        className="absolute inset-x-0 bottom-5 flex justify-center gap-2 px-5 md:bottom-6"
        role="group"
        aria-label="Choose a photo"
      >
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            aria-pressed={i === index}
            aria-label={`Photo ${i + 1} of ${count}`}
            onClick={() => take(() => setIndex(i))}
            className="group/dot h-6 w-10 md:w-14"
          >
            <span className="mt-2.5 block h-[3px] overflow-hidden rounded-full bg-white/35 transition-colors group-hover/dot:bg-white/60">
              <span
                className="block h-full rounded-full bg-white"
                style={
                  i === index
                    ? taken
                      ? { width: "100%" }
                      : { animation: `galleryFill ${AUTOPLAY_MS}ms linear forwards` }
                    : { width: 0 }
                }
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
