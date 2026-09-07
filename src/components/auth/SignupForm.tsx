"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signup, saveProfile } from "@/lib/api";
import { Field } from "@/components/auth/Field";
import { loadDraft, saveDraft } from "@/lib/profileDraft";

export default function SignupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const password = String(data.get("password") ?? "");
        setBusy(true);
        setError(null);
        try {
          await signup({ name, email, password });
          const local = loadDraft();
          saveDraft({ ...local, name });
          if (local.completedAt) {
            saveProfile(loadDraft()).catch(() => {});
          }
          router.push("/contribute");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setBusy(false);
        }
      }}
    >
      <Field label="Name" type="text" name="name" autoComplete="name" required />
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <Field
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <label className="flex items-start gap-2.5 text-xs text-ink-soft">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 accent-[--azure]"
        />
        <span>
          My contributions help build open, community-owned Pashto datasets.
        </span>
      </label>
      <button
        disabled={busy}
        className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create account"}
      </button>
      {error && (
        <p className="text-center text-xs font-semibold text-[#b4552d]">
          {error}
        </p>
      )}
    </form>
  );
}
