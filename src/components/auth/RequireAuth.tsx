"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getMe } from "@/lib/api";

/**
 * Everything inside the portal belongs to someone with an account. A visitor
 * without one is sent to the login page rather than allowed to fill in a
 * profile they cannot use.
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    const query = search.toString();
    const back = `${pathname}${query ? `?${query}` : ""}`;
    getMe().then(() => {
      if (alive) { setAllowed(true); setError(undefined); }
    }).catch((err: unknown) => {
      if (!alive) return;
      setAllowed(false);
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(back)}`);
      } else {
        setError("Unable to verify your session. Please try again.");
      }
    });
    return () => { alive = false; };
  }, [pathname, router, search, retry]);

  // nothing is drawn until we know — no flash of a page they cannot keep
  if (error) return <div className="min-h-dvh bg-ice p-8" role="alert">{error} <button onClick={() => setRetry((v) => v + 1)}>Try again</button></div>;
  if (!allowed) return <div className="min-h-dvh bg-ice" />;
  return <>{children}</>;
}
