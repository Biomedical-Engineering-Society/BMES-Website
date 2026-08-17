"use client";

import { useEffect, useState } from "react";

/**
 * The campus timelapse behind the home page headline.
 *
 * Purely decorative, so there is no on-screen control: anyone who has asked
 * their system for reduced motion never sees it start, and gets the poster
 * frame instead. That is the setting the motion opt-out belongs to.
 */
export default function HeroVideo({ poster, src }: { poster: string; src: string }) {
  // Assume reduced motion until the browser says otherwise, so the very first
  // paint is a still image rather than motion that has to be stopped.
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

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
    <video
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
  );
}
