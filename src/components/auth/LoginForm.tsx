"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { Field } from "@/components/auth/Field";
import { loadDraft, saveDraft } from "@/lib/profileDraft";
import { profileToDraft } from "@/lib/profileSync";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setError(null);
        try {
          const session = await login(
            String(data.get("email") ?? "").trim(),
            String(data.get("password") ?? ""),
          );
          const local = loadDraft();
          saveDraft(
            profileToDraft(
              session.profile,
              session.user.name || local.name,
              local.photo,
            ),
          );
          const next = search.get("next");
          const safe = next && next.startsWith("/") && !next.startsWith("//");
          router.push(
            safe
              ? next
              : session.user.role === "superadmin"
                ? "/admin"
                : "/contribute",
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setBusy(false);
        }
      }}
    >
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <Field
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        required
      />
      <button
        disabled={busy}
        className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
      >
        {busy ? "Logging in…" : "Log in"}
      </button>
      {error && (
        <p className="text-center text-xs font-semibold text-[#b4552d]">
          {error}
        </p>
      )}
    </form>
  );
}
