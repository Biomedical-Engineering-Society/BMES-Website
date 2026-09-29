"use client";

import { usePathname } from "next/navigation";

/**
 * Public site chrome: the navbar, footer, chat widget and page transition.
 * The admin tool has its own header, so none of this shows under /admin.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
