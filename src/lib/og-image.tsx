import { ImageResponse } from "next/og";
import { OG_SIZE } from "@/lib/site";

export { OG_SIZE };

// next/og can't decode WebP; Cloudinary converts on the fly via f_png.
export function cloudinaryPng(url: string): string {
  return url.replace("/image/upload/", "/image/upload/f_png/");
}

const SITE_LOGO = cloudinaryPng(
  "https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp",
);

type OgCardProps = {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  kicker?: string;
  title: string;
  subtitle?: string;
};

// Shared layout for all link previews: cream card, image on top, text below.
export function renderOgCard({ imageSrc, imageWidth, imageHeight, kicker, title, subtitle }: OgCardProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #e8f6df 0%, #fff8e7 55%, #d9f0ff 100%)",
          padding: 60,
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
        <img src={imageSrc} width={imageWidth} height={imageHeight} alt="" />
        {kicker ? (
          <div style={{ marginTop: 28, fontSize: 34, color: "#c88912", fontWeight: 700 }}>{kicker}</div>
        ) : null}
        <div
          style={{
            marginTop: kicker ? 8 : 32,
            fontSize: 60,
            fontWeight: 700,
            color: "#1f5a34",
            lineHeight: 1.15,
            maxWidth: 1050,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: 18, fontSize: 32, color: "#4d6354" }}>{subtitle}</div>
        ) : null}
      </div>
    ),
    OG_SIZE,
  );
}

export function renderSiteOgImage({
  title = "Online-Einladung & Gästeliste kostenlos erstellen",
  subtitle = "Schluss mit Zusagen-Chaos im Gruppenchat.",
}: { title?: string; subtitle?: string } = {}) {
  return renderOgCard({
    imageSrc: SITE_LOGO,
    imageWidth: 420,
    imageHeight: 149,
    title,
    subtitle,
  });
}
