// next/image loader (see next.config.ts): instead of Next's own optimizer,
// Cloudinary resizes on the fly, so every <Image> fetches roughly the size
// it is displayed at - a 40px event-list logo no longer downloads the
// 512px original. c_limit never upscales beyond the original, f_auto
// picks AVIF/WebP per browser.
const UPLOAD_SEGMENT = "/image/upload/";

type LoaderParams = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderParams): string {
  if (!src.startsWith("https://res.cloudinary.com/") || !src.includes(UPLOAD_SEGMENT)) {
    // Not a Cloudinary asset: serve as-is (the width hint keeps next/image
    // from warning that the loader ignores the requested width).
    return `${src}?w=${width}`;
  }

  const transformation = `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`;
  return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transformation}/`);
}
