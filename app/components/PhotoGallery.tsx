"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./BrandIcons";

export type GalleryPhoto = {
  src: string;
  alt: string;
};

/**
 * Manual-only photo stage. Every photo is mounted and crossfaded on opacity, so
 * moving between them never shows a blank frame while a new file loads.
 *
 * No autoplay: the team asked for the visitor to stay in control.
 */
export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  const step = (delta: number) =>
    setIndex((current) => (current + delta + photos.length) % photos.length);

  return (
    <div className="relative h-[300px] overflow-hidden rounded-[18px] bg-placeholder sm:h-[420px] lg:h-[540px]">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={i === index ? photo.alt : ""}
          fill
          sizes="(max-width: 1024px) 100vw, 1264px"
          priority={i === 0}
          className="object-cover transition-opacity duration-[400ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-5 md:inset-x-[30px] md:bottom-[26px]">
        {/* The pill keeps the white indicators readable over a bright photo. */}
        {/* A group of toggle buttons, not a tablist: there is no tabpanel here
            and none of the tablist keyboard model is implemented. */}
        <div
          className="flex gap-2 rounded-full bg-[rgba(7,27,51,0.45)] px-3 py-2.5 backdrop-blur-sm"
          role="group"
          aria-label="Choose a photo"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              aria-pressed={i === index}
              aria-label={`Photo ${i + 1} of ${photos.length}`}
              onClick={() => setIndex(i)}
              className={`h-[5px] w-[26px] rounded-full transition-colors md:w-[34px] ${
                i === index ? "bg-white" : "bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/50 bg-[rgba(7,27,51,0.45)] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/50 bg-[rgba(7,27,51,0.45)] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
