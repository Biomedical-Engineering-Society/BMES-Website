import Link from "next/link";
import type { BannerContent } from "@/lib/announcement";

/** Roughly how many characters one copy needs so the loop never shows a gap on a wide screen. */
const MIN_COPY_CHARS = 160;
/** Scroll speed, in seconds per character, so long and short messages move at the same pace. */
const SECONDS_PER_CHAR = 0.22;

/**
 * The scrolling strip under the home page hero.
 *
 * The items are repeated until one copy is wider than the screen, then the copy
 * is rendered twice and slid left by exactly one copy, so the loop is seamless.
 * Screen readers get one plain copy; the moving one is hidden from them.
 */
export default function Ticker({ items, href, external, className = "" }: BannerContent & { className?: string }) {
  const length = items.join("").length + items.length * 6;
  const repeats = Math.max(1, Math.ceil(MIN_COPY_CHARS / Math.max(1, length)));
  const copy = Array.from({ length: repeats }, (_, round) => items.map((item) => ({ item, repeat: round > 0 }))).flat();
  const duration = `${Math.round(Math.max(20, length * repeats * SECONDS_PER_CHAR))}s`;

  const strip = (
    <>
      <span className="sr-only">{items.join(". ")}</span>
      <span className="ticker-track" style={{ "--ticker-duration": duration } as React.CSSProperties} aria-hidden="true">
        {[0, 1].map((copyIndex) => (
          <span key={copyIndex} className="ticker-copy">
            {copy.map(({ item, repeat }, index) => (
              <span key={index} className={`ticker-item${repeat ? " ticker-repeat" : index === items.length - 1 ? " ticker-last" : ""}`}>
                {item}
              </span>
            ))}
          </span>
        ))}
      </span>
    </>
  );

  return (
    <section aria-label="Announcements" className={`ticker ${className}`}>
      {!href ? (
        <div className="ticker-inner">{strip}</div>
      ) : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="ticker-inner">
          {strip}
        </a>
      ) : (
        <Link href={href} className="ticker-inner">
          {strip}
        </Link>
      )}
    </section>
  );
}
