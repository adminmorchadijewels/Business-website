import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Makes Cloudflare bindings available during `next dev` (Node runtime).
// No-op in production builds.
initOpenNextCloudflareForDev();
