import Image from "next/image";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function PartyPage() {
  return (
    <div className="relative flex min-h-full flex-col" style={{ isolation: "isolate" }}>
      <Header />
      <main className="flex-1">
        <Hero />
        <GuestSection />
      </main>
      <Footer />

      <Image
        src="/plants-left.png"
        alt=""
        width={434}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden lg:block"
      />
      <Image
        src="/plants-right.png"
        alt=""
        width={283}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 hidden lg:block"
      />
    </div>
  );
}
