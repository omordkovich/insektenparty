import Image from "next/image";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { jugendidolenEventConfig } from "@/lib/event";

export default function PartyPage() {
  return (
    <div className="relative flex min-h-full flex-col" style={{ isolation: "isolate" }}>
      <Header config={jugendidolenEventConfig} />
      <main className="flex-1">
        <Hero config={jugendidolenEventConfig} />
        <GuestSection apiBasePath="/api/jugendidolen-guests" />
      </main>
      <Footer config={jugendidolenEventConfig} />

      <Image
        src={jugendidolenEventConfig.assets.plantsLeft}
        alt=""
        width={434}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-auto w-[110px] sm:w-[170px] md:w-[245px] lg:w-[434px]"
      />
      <Image
        src={jugendidolenEventConfig.assets.plantsRight}
        alt=""
        width={283}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-auto w-[70px] sm:w-[110px] md:w-[160px] lg:w-[283px]"
      />
    </div>
  );
}
