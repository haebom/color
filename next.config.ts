import type { NextConfig } from "next";

// Configure for static export suitable for GitHub Pages.
// - output: "export" to generate static site into ./out
// - images.unoptimized: true because GitHub Pages won't run the Next image optimizer
// - trailingSlash: true to avoid directory index mismatches on static hosts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
