import { SITE_URL } from "@/lib/site";

// "Under construction" mode for the public domain, switched on with the env
// var MAINTENANCE_MODE=true (on Vercel; needs a redeploy). Only gastzilla.de
// and www are affected - Vercel deployment URLs and localhost keep showing
// the real app, so it can still be tested. Impressum and Datenschutz stay
// reachable (legally required), as do the crawler files.

const SITE_HOST = new URL(SITE_URL).host;
const MAINTENANCE_HOSTS = new Set([SITE_HOST, `www.${SITE_HOST}`]);
const ALWAYS_REACHABLE = new Set(["/impressum", "/datenschutz", "/robots.txt", "/favicon.ico"]);

export function shouldShowMaintenance({
  enabled,
  host,
  pathname,
}: {
  enabled: string | undefined;
  host: string;
  pathname: string;
}): boolean {
  if (enabled !== "true") return false;
  if (!MAINTENANCE_HOSTS.has(host.toLowerCase())) return false;
  return !ALWAYS_REACHABLE.has(pathname);
}

const LOGO_SRC = "https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp";

// A self-contained page (no React, no database) so it works even when the
// app itself is broken. Colors match the neutral start page.
export function maintenanceHtml(): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GASTZILLA – bald wieder da</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
         padding: 24px; box-sizing: border-box; background: #f4f4f5; color: #243528; text-align: center;
         font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  img { width: min(256px, 70vw); height: auto; }
  h1 { margin: 32px 0 8px; font-size: 1.6rem; color: #1f5a34; }
  p { margin: 0; max-width: 28rem; color: #4d6354; line-height: 1.5; }
  nav { margin-top: 48px; font-size: .875rem; }
  a { color: #4d6354; margin: 0 8px; }
</style>
</head>
<body>
  <img src="${LOGO_SRC}" alt="GASTZILLA" width="256" height="91">
  <h1>Hier wird gerade gebaut</h1>
  <p>GASTZILLA ist bald wieder für dich da – digitale Einladungen &amp; Gästelisten für jedes Event.</p>
  <nav><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></nav>
</body>
</html>`;
}
