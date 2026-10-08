import type { NextConfig } from "next";

// STATIC_EXPORT=1 → file statis di `out/` untuk GitHub Pages (obengku.nekomade.com).
// Tanpa variabel itu → build biasa untuk @opennextjs/cloudflare (Worker); jangan set
// `output: "export"` di jalur Worker karena OpenNext yang mengurus keluarannya.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? { output: "export", trailingSlash: true }
  : {};

export default nextConfig;
