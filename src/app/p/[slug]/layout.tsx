import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";
import React from "react";

type EventLayoutProps = {
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
  const [event] = await db.select().from(events).where(eq(events.slug, slug));

  if (!event) {
    return { title: "Event nicht gefunden" };
  }

  return {
    title: `${event.title} - Einladung`,
    description: `Digitale Einladung: Infos ansehen und Gästeliste verwalten.`,
  };
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.slug, slug));

  if (!event) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[event.theme as ThemeKey];

  return <div className={themeClassName}>{children}</div>;
}
