import type { NextConfig } from "next";

// Situs sepenuhnya statis: `next build` menulis HTML ke `out/` untuk GitHub Pages
// (obengku.nekomade.com). trailingSlash → /tools/x/index.html, cocok dengan Pages.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
