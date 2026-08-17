"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The brand moment between pages.
 *
 * A white curtain carrying the BMES mark drops the instant an internal link is
 * clicked and lifts once the new route has painted, so navigation reads as one
 * continuous branded motion instead of a hard content swap.
 *
 * The click listener runs in the capture phase because Next's Link intercepts
 * the bubble phase; without it the curtain would only appear after the route
 * had already changed, which is too late to cover anything.
 */

const HOLD_AFTER_ROUTE_CHANGE = 260;
const SAFETY_TIMEOUT = 2000;

export default function RouteTransition() {
  const pathname = usePathname();
  // Starts down, deliberately. Rendering it active would bake an opaque white
  // overlay into every prerendered page, so a slow connection or a JS failure
  // would leave the visitor staring at a blank screen. The curtain exists to
  // cover client-side navigation, and a first page load is not one.
  const [active, setActive] = useState(false);
  const isFirstRender = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lift the curtain once the new route has rendered.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setActive(false), HOLD_AFTER_ROUTE_CHANGE);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  // Drop the curtain the moment an internal link is clicked.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      setActive(true);

      // If the navigation never completes, do not strand the visitor behind it.
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => setActive(false), SAFETY_TIMEOUT);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-[320ms] ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-brand-tint">
        <span
          className="block h-full w-1/3 bg-brand"
          style={{ animation: active ? "curtainSweep 1100ms ease-in-out infinite" : "none" }}
        />
      </span>

      <Image
        src="/brand/bmes-mark.png"
        alt=""
        width={220}
        height={220}
        priority
        className="h-24 w-24 object-contain md:h-28 md:w-28"
        style={{ animation: active ? "markPulse 1400ms ease-in-out infinite" : "none" }}
      />
    </div>
  );
}
