"use client";

import { useRouter } from "next/navigation";
import { Field } from "@/components/auth/Field";
import { loadDraft, saveDraft } from "@/lib/profileDraft";

export default function SignupForm() {
  const router = useRouter();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        saveDraft({ ...loadDraft(), name: name || undefined });
        router.push("/onboarding");
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
      <button className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep">
        Create account
      </button>
      <p className="text-center text-xs text-ink-soft">
        Accounts open at launch &mdash; set up your profile now, it stays on
        this device.
      </p>
    </form>
  );
}
