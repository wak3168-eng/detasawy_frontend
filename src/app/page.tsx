import Hero from "@/components/hero/Hero";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import HowItWorks from "@/components/sections/HowItWorks";
import Mission from "@/components/sections/Mission";
import StatsStrip from "@/components/stats/StatsStrip";
import { getLiveStats, statsToStrip, statsToTicker } from "@/lib/stats";

export default async function Home() {
  const live = await getLiveStats();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsStrip stats={statsToStrip(live)} ticker={statsToTicker(live)} />
        <HowItWorks />
        <LeaderboardSection />
        <Mission />
      </main>
      <Footer />
    </>
  );
}
