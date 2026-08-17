"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the route changes. Adjusting state during
  // render rather than in an effect: React re-runs this component immediately
  // with the new value, so the menu never paints open on the new page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // A hairline at rest, a whisper of a shadow once the page moves under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Never leave the page scroll-locked behind an open menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const contactActive = isActive(pathname, "/contact");

  // Solid at rest, then glass once the page moves under it: content scrolling
  // past stays faintly visible through the header instead of disappearing
  // behind an opaque bar.
  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled
          ? "border-hairline/70 bg-white/72 shadow-[0_10px_30px_-24px_rgba(7,27,51,0.45)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-hairline bg-white"
      }`}
    >
      <div className="shell-nav flex items-center justify-between gap-6 py-2.5 md:py-3.5">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 md:gap-3.5"
          aria-label="BMES TMU, home"
        >
          <Image
            src="/brand/bmes-mark.png"
            alt=""
            width={128}
            height={128}
            priority
            className="h-11 w-11 shrink-0 object-contain md:h-16 md:w-16"
          />
          <span className="flex flex-col gap-[3px] border-l border-hairline pl-3 md:pl-3.5">
            <span className="font-display text-[13px] font-bold leading-[1.1] tracking-[-0.01em] text-brand sm:text-[15px] md:text-base">
              Biomedical Engineering Society
            </span>
            <span className="text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-muted sm:text-[10px] md:text-[11px]">
              Toronto Metropolitan University
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors duration-150 hover:bg-brand-tint hover:text-brand ${
                  active ? "bg-brand-tint text-brand" : "text-navlink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            aria-current={contactActive ? "page" : undefined}
            className={`btn btn-sm btn-primary ml-3 ${contactActive ? "bg-brand-hover" : ""}`}
          >
            Contact us
          </Link>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-hairline text-ink transition-colors hover:border-brand hover:text-brand lg:hidden"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d={menuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="border-t border-hairline bg-white lg:hidden"
      >
        <nav className="shell-nav flex flex-col gap-1 py-4" aria-label="Primary, mobile">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-3.5 text-base font-semibold transition-colors ${
                  active ? "bg-brand-tint text-brand" : "text-navlink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn btn-primary mt-2 w-full">
            Contact us
          </Link>
        </nav>
      </div>
    </header>
  );
}
