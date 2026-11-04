import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Event pages used to live under /p/ - links already shared in chats
  // must keep working.
  async redirects() {
    return [{ source: "/p/:path*", destination: "/event/:path*", permanent: true }];
  },
  // Low-risk security headers for every response. Deliberately no
  // Content-Security-Policy: it has to list reCAPTCHA, Cloudinary, Supabase
  // and Next's inline scripts, and a wrong one breaks pages - add it only
  // with thorough testing. (HSTS is already set by Vercel.)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nobody else may embed the site in a frame (clickjacking).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
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
