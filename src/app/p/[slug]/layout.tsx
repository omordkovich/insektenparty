import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";

type PartyLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug));

  if (!party) {
    return { title: "Party nicht gefunden" };
  }

  return {
    title: `${party.title} - Einladung`,
    description: `Digitale Einladung: Infos ansehen und Gästeliste verwalten.`,
  };
}

export default async function PartyLayout({ children, params }: PartyLayoutProps) {
  const { slug } = await params;
  const db = getDb();
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug));

  if (!party) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[party.theme as ThemeKey];

  return <div className={themeClassName}>{children}</div>;
}
