import { type Occasion, occasionIconPath } from "@/lib/occasions";

// The occasion's icon, used as a mask so it takes the theme colour (see
// .occasion-icon) instead of the green baked into the PNG. Decorative only.
export function OccasionIcon({ occasion, className = "" }: { occasion: Occasion; className?: string }) {
  const url = `url(${occasionIconPath(occasion)})`;
  return (
    <span
      aria-hidden="true"
      className={`occasion-icon block ${className}`}
      style={{ maskImage: url, WebkitMaskImage: url }}
    />
  );
}
