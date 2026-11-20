import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The persistent dev cache kept serving stale globals.css (even across
    // restarts). Off = slightly slower cold start, but edits always land.
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.datocms-assets.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
