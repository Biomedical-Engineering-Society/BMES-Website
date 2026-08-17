"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals, without wrapper elements.
 *
 * Mounted once in the layout. Any element opts in with a bare `data-reveal`
 * attribute; this flips it to `data-reveal="shown"` when it enters the
 * viewport. Observing centrally keeps server components on the server and adds
 * no wrapper div inside grid or flex parents.
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
