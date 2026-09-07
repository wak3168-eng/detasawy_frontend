import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Detasawy",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      alt={
        <>
          No account?{" "}
          <Link className="font-bold text-azure-deep" href="/signup">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
