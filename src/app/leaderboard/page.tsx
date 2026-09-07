import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import LeaderboardBoard from "@/components/leaderboard/LeaderboardBoard";
import { getDistrictLeaderboard } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard — Detasawy",
};

export default async function LeaderboardPage() {
  const rows = await getDistrictLeaderboard();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
        <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          District leaderboard
        </h1>
        <p className="mt-3 text-center text-sm text-ink-soft">
          Every accepted word scores for your district.
        </p>
        <div className="mt-10">
          <LeaderboardBoard rows={rows} />
        </div>
      </main>
      <Footer />
    </>
  );
}
