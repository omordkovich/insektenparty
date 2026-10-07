import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Event pages used to live under /p/ - links already shared in chats
  // must keep working.
  async redirects() {
    return [{ source: "/p/:path*", destination: "/event/:path*", permanent: true }];
  },
  images: {
    // All images live on Cloudinary, which resizes/re-encodes them on the
    // fly - so next/image just asks it for the right size (see the loader)
    // instead of running Next's own optimizer and on-disk cache.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
};

export default nextConfig;
