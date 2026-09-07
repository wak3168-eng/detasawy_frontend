"use client";

import { useState } from "react";
import { Field, LaunchNotice, SelectField } from "@/components/auth/Field";

export default function SignupForm() {
  const [notice, setNotice] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(true);
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
      <SelectField label="Country" name="country" defaultValue="" required>
        <option value="" disabled>
          Select
        </option>
        <option value="pk">Pakistan</option>
        <option value="af">Afghanistan</option>
        <option value="overseas">Overseas</option>
      </SelectField>
      <Field label="Province / State" type="text" name="province" required />
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
      {notice && <LaunchNotice />}
    </form>
  );
}
