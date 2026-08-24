import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milans 7. Geburtstagsparty",
  description:
    "Digitale Einladung zur Insektenparty: Infos ansehen und Gästeliste verwalten.",
};

export default function PartyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="party-theme">{children}</div>;
}
