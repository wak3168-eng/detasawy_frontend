import Hero from "@/components/hero/Hero";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import HowItWorks from "@/components/sections/HowItWorks";
import Mission from "@/components/sections/Mission";
import StatsStrip from "@/components/stats/StatsStrip";
import { getLandingStats, TICKER_ITEMS } from "@/lib/stats";

export default async function Home() {
  const stats = await getLandingStats();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsStrip stats={stats} ticker={TICKER_ITEMS} />
        <HowItWorks />
        <LeaderboardSection />
        <Mission />
      </main>
      <Footer />
    </>
  );
}
