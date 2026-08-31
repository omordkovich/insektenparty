import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jugendidolen Geburtstagsparty",
  description:
    "Digitale Einladung zur Jugendidolen-Party: Infos ansehen und Gästeliste verwalten.",
};

export default function PartyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="party-theme-jugendidolen">{children}</div>;
}
