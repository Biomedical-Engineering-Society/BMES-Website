import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import RouteTransition from "./components/RouteTransition";
import RevealOnScroll from "./components/RevealOnScroll";
import { SITE } from "@/lib/site";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.shortName} · ${SITE.tagline}`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: [
    "BMES",
    "Biomedical Engineering Society",
    "Toronto Metropolitan University",
    "TMU",
    "biomedical engineering",
    "student society",
  ],
  openGraph: {
    title: `${SITE.shortName} · ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: `${SITE.name}, ${SITE.university}`,
    locale: "en_CA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#156cce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${manrope.variable}`}>
      <head>
        {/* Scroll reveals are progressive enhancement: without JS, show everything. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="bg-white font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>

        <Navbar />

        <main id="main">{children}</main>

        <Footer />
        <ChatWidget />
        <RouteTransition />
        <RevealOnScroll />
      </body>
    </html>
  );
}
