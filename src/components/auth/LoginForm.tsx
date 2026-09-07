"use client";

import { useState } from "react";
import { Field, LaunchNotice } from "@/components/auth/Field";

export default function LoginForm() {
  const [notice, setNotice] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(true);
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
      <button className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep">
        Log in
      </button>
      {notice && <LaunchNotice />}
    </form>
  );
}
