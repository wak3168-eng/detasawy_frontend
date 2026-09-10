import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Detasawy",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      alt={<>Accounts are given out by the team while Detasawy is in pilot.</>}
    >
      <Suspense fallback={<div className="h-52" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
