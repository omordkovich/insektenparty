import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insektenparty – Einladung",
  description:
    "Digitale Einladung zur Insektenparty: Infos ansehen und Gästeliste verwalten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
