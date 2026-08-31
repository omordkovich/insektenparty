import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Local decorative graphics get swapped by hand often; Next's image
    // optimizer caches processed variants on disk and (at least on this
    // Turbopack build) doesn't reliably notice when the source file changes,
    // requiring a full dev-server restart to see a replacement. Serving the
    // files directly avoids that cache layer entirely.
    unoptimized: true,
  },
};

export default nextConfig;
