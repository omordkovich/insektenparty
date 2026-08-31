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
        <GuestSection
          apiBasePath="/api/jugendidolen-guests"
          defaultArrivalTime={jugendidolenEventConfig.defaultArrivalTime}
        />
      </main>
      <Footer config={jugendidolenEventConfig} />

      <Image
        src={jugendidolenEventConfig.assets.plantsRight}
        alt=""
        width={283}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-auto w-[min(283px,45.4vw)]"
      />
      <Image
        src={jugendidolenEventConfig.assets.plantsLeft}
        alt=""
        width={434}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-auto w-[min(434px,69.6vw)]"
      />
    </div>
  );
}
