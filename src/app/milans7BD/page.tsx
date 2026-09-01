import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import { eventConfig } from "@/lib/event";

export default function PartyPage() {
  return (
    <div className="relative flex min-h-full flex-col" style={{ isolation: "isolate" }}>
      <Header config={eventConfig} />
      <main className="flex-1">
        <Hero config={eventConfig} />
        <GuestSection defaultArrivalTime={eventConfig.defaultArrivalTime} />
      </main>
      <Footer config={eventConfig} />

      <ParallaxSideGraphics
        leftSrc={eventConfig.assets.plantsLeft}
        rightSrc={eventConfig.assets.plantsRight}
      />
    </div>
  );
}
