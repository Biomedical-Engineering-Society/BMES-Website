"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { CloseIcon } from "./BrandIcons";
import { type BmesEvent, eventCta, formatLongDate } from "@/lib/events";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * Event details dialog. Fixed to the viewport, so it stays centred however far
 * the page has been scrolled. Closes on Esc, backdrop click or either close
 * control, traps Tab while open, and restores focus on close.
 */
export default function EventModal({
  event,
  onClose,
}: {
  event: BmesEvent | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.key === "Escape") {
        nativeEvent.preventDefault();
        onClose();
        return;
      }
      if (nativeEvent.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (nativeEvent.shiftKey && document.activeElement === first) {
        nativeEvent.preventDefault();
        last.focus();
      } else if (!nativeEvent.shiftKey && document.activeElement === last) {
        nativeEvent.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!event) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [event, handleKeyDown]);

  if (!event) return null;

  const cta = eventCta(event);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(5,15,30,0.72)] p-5 backdrop-blur-[4px] md:p-10"
      onMouseDown={(clickEvent) => {
        if (clickEvent.target === clickEvent.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="relative max-h-[calc(100dvh-4rem)] w-full max-w-[560px] overflow-y-auto rounded-[18px] bg-white p-7 shadow-[0_40px_80px_-30px_rgba(5,15,30,0.7)] md:p-9 md:pb-[30px]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close event details"
          className="absolute right-5 top-5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-track text-muted transition-colors hover:bg-hairline hover:text-ink md:right-[22px] md:top-[22px]"
        >
          <CloseIcon size={16} />
        </button>

        <div className="flex flex-col gap-4">
          <span className="inline-flex self-start rounded-full bg-brand-tint-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
            {event.category}
          </span>

          <h3
            id="event-modal-title"
            className="font-display pr-10 text-[clamp(1.4rem,3vw,1.75rem)] font-bold leading-[1.12] tracking-[-0.025em] text-pretty"
          >
            {event.title}
          </h3>

          <dl className="flex flex-col gap-2.5 rounded-[10px] border border-hairline bg-surface p-4 text-[15px] text-navlink md:px-5">
            <div className="flex gap-3">
              <dt className="w-[74px] shrink-0 font-bold text-muted">Date</dt>
              <dd>{formatLongDate(event.date)}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-[74px] shrink-0 font-bold text-muted">Time</dt>
              <dd>{event.time}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-[74px] shrink-0 font-bold text-muted">Where</dt>
              <dd>{event.location}</dd>
            </div>
          </dl>

          <p className="text-[15px] leading-[1.6] text-body md:text-base">{event.description}</p>

          <div className="flex items-center justify-end gap-3.5 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-1.5 py-2.5 text-[15px] font-semibold text-muted transition-colors hover:text-ink"
            >
              Close
            </button>
            {cta.external ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                {cta.label} →
              </a>
            ) : (
              <Link href={cta.href} className="btn btn-sm btn-primary">
                {cta.label} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
