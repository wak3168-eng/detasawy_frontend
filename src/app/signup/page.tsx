import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — Detasawy",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Join Detasawy"
      sub="Help build the Pashto of tomorrow."
      alt={
        <>
          Have an account?{" "}
          <Link className="font-bold text-azure-deep" href="/login">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
