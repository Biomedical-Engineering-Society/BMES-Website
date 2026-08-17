"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The campus timelapse behind the home page headline.
 *
 * Auto-playing motion that runs for more than five seconds needs a way to stop
 * it (WCAG 2.2.2), and anyone who has asked their system for reduced motion
 * should never see it start. So: visitors with `prefers-reduced-motion: reduce`
 * get the poster frame only, and everyone else gets a pause control.
 */
export default function HeroVideo({ poster, src }: { poster: string; src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Assume reduced motion until the browser tells us otherwise, so the very
  // first paint is a still image rather than a video that has to be stopped.
  const [reducedMotion, setReducedMotion] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReducedMotion(query.matches);
      setPlaying(!query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  if (reducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-navy bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
      />
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={src} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background video" : "Play background video"}
        // Bottom left, because the chat launcher owns the bottom right corner.
        className="absolute bottom-5 left-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-[rgba(7,27,51,0.55)] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink md:bottom-8 md:left-8"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <polygon points="7,4 20,12 7,20" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}
