export function generateSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "party";

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
