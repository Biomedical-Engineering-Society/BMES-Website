"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals, without wrapper elements.
 *
 * Mounted once in the layout. Any element anywhere in the app can opt in by
 * adding a bare `data-reveal` attribute; this watches the document and flips it
 * to `data-reveal="shown"` when it comes into view. Doing it centrally means
 * server components stay server components and grid or flex parents never gain
 * a stray wrapper div that would break their layout.
 */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = (element: Element) => element.setAttribute("data-reveal", "shown");

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    const observeAll = (root: ParentNode) => {
      root.querySelectorAll?.('[data-reveal=""]').forEach((element) => observer.observe(element));
    };

    observeAll(document);

    // Pick up anything rendered later, such as a view toggle or a filter change.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal=""]')) observer.observe(node);
          observeAll(node);
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
