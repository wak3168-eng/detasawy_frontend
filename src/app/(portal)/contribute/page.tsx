import type { Metadata } from "next";
import DailySetPanel from "@/components/portal/DailySetPanel";

export const metadata: Metadata = {
  title: "Contribute — Detasawy",
};

export default function ContributePage() {
  return <DailySetPanel />;
}
