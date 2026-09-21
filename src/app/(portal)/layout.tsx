import type { Metadata } from "next";
import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import PortalFrame from "@/components/portal/PortalFrame";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ice" />}>
      <RequireAuth>
        <PortalFrame>{children}</PortalFrame>
      </RequireAuth>
    </Suspense>
  );
}
