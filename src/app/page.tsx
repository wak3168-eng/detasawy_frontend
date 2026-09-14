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

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://detasawy.com/#organization",
        name: "Detasawy",
        url: "https://detasawy.com",
        description:
          "A community-built data portal for the Pashto language, creating " +
          "community-owned open datasets from the words and voices of its speakers.",
      },
      {
        "@type": "WebSite",
        "@id": "https://detasawy.com/#website",
        url: "https://detasawy.com",
        name: "Detasawy",
        publisher: { "@id": "https://detasawy.com/#organization" },
        inLanguage: ["en", "ps"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
