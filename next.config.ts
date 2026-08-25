import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads the knowledge base from data/source-docs at request
  // time. Nothing imports that file, so the build would not otherwise ship it
  // and the fallback would come back empty on Vercel.
  outputFileTracingIncludes: {
    "/api/chat": ["./data/source-docs/*.md"],
  },
};

export default nextConfig;
