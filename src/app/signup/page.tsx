import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joining Detasawy",
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-mist bg-white/70 p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Detasawy is invite-only for now
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          We are building the collection carefully with a small group of
          speakers. The team creates accounts one at a time — ask them for
          yours, and they will hand you a password to start with.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-azure px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          I already have an account
        </Link>
      </div>
    </main>
  );
}
