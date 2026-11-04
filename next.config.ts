import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers has no built-in Next image optimizer. Product photos already come sized and
    // compressed from Cloudinary (f_auto,q_auto,w_…), and files in public/ are pre-shrunk PNGs.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// Lets `next dev` use the Cloudflare bindings from wrangler.jsonc.
initOpenNextCloudflareForDev();
