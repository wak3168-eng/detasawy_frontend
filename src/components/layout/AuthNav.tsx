"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasToken } from "@/lib/auth";

export default function AuthNav() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(hasToken());
  }, []);

  if (authed) {
    return (
      <Link
        href="/contribute"
        className="rounded-full bg-azure px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
      >
        Contribute
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-full px-4 py-2 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-azure px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
      >
        Sign up
      </Link>
    </div>
  );
}
