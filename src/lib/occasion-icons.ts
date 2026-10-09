// Occasion icons on Cloudinary (folder "icons", public_id = occasion id,
// 256x256 WebP with transparent background). The version is part of the
// URL so a replaced icon is never served from a stale CDN cache - after
// uploading a new icon, update its version here.
const CLOUDINARY_BASE = "https://res.cloudinary.com/d6sufegz/image/upload";

export const OCCASION_ICON_VERSIONS: Record<string, number> = {
  "advent-party": 1791550053,
  "baby-shower": 1791550054,
  "bachelor-party": 1791550053,
  barbecue: 1791550054,
  birthday: 1791550054,
  "carnival-party": 1791550054,
  christening: 1791550054,
  "company-party": 1791550056,
  "culture-outing": 1791550057,
  "date-poll": 1791550057,
  "family-celebration": 1791550057,
  funeral: 1791550057,
  "gaming-night": 1791550059,
  "going-out": 1791550059,
  graduation: 1791550060,
  "group-travel": 1791550060,
  "halloween-party": 1791550060,
  "kids-birthday": 1791550060,
  "kids-playdate": 1791550061,
  "new-years-eve": 1791550062,
  oktoberfest: 1791550063,
  rehearsal: 1791550063,
  "school-events": 1791550063,
  "school-start": 1791550064,
  "sports-together": 1791550065,
  "tabletop-night": 1791550066,
  "theme-party": 1791550066,
  wedding: 1791550067,
};

export function occasionIconUrl(id: string): string {
  return `${CLOUDINARY_BASE}/v${OCCASION_ICON_VERSIONS[id]}/${id}.webp`;
}
