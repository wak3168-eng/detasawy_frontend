import type { Metadata } from "next";
import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import Wizard from "@/components/onboarding/Wizard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Set up your profile",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ice" />}>
      <RequireAuth>
        <Wizard />
      </RequireAuth>
    </Suspense>
  );
}
