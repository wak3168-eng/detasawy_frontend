import type { Metadata } from "next";
import ContributeGate from "@/components/contribute/ContributeGate";

export const metadata: Metadata = {
  title: "Contribute — Detasawy",
};

export default function ContributePage() {
  return <ContributeGate />;
}
