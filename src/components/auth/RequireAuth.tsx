"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { hasToken } from "@/lib/auth";

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

  useEffect(() => {
    if (hasToken()) {
      setAllowed(true);
      return;
    }
    const query = search.toString();
    const back = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(back)}`);
  }, [pathname, router, search]);

  // nothing is drawn until we know — no flash of a page they cannot keep
  if (!allowed) return <div className="min-h-dvh bg-ice" />;
  return <>{children}</>;
}
