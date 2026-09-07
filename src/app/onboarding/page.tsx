import type { Metadata } from "next";
import Wizard from "@/components/onboarding/Wizard";

export const metadata: Metadata = {
  title: "Set up your profile — Detasawy",
};

export default function OnboardingPage() {
  return <Wizard />;
}
