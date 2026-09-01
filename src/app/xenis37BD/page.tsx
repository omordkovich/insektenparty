import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
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

      <ParallaxSideGraphics
        leftSrc={jugendidolenEventConfig.assets.plantsLeft}
        rightSrc={jugendidolenEventConfig.assets.plantsRight}
      />
    </div>
  );
}
