import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";
import { getEventBySlug } from "@/repositories/event-repository";
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
  const event = await getEventBySlug(slug);

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
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[event.theme as ThemeKey];

  // data-theme-root lets portalled dialogs (e.g. the privacy policy) mount
  // inside the themed wrapper so they pick up the event's CSS variables.
  return (
    <div className={themeClassName} data-theme-root>
      {children}
    </div>
  );
}
