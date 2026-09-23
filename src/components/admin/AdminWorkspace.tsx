"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ApiError, getMe, logout } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { clearDraft } from "@/lib/profileDraft";
import { Mark } from "@/components/brand/Logo";
import { adminSections, allowed } from "./sections";
import { ErrorNotice, Loading } from "./AdminUI";
const AdminUserContext = createContext<AuthUser | undefined>(undefined);
export const useAdminUser = () => useContext(AdminUserContext);

function Icon({ index }: { index: number }) {
  const paths = [
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    "M3 4h18v16H3zM3 16l5-5 4 4 4-6 5 7M8 8h.01",
    "M4 4h16v13H9l-5 4zM8 8h8M8 12h5",
    "M3 4h18v16H3zM3 9h18M9 9v11M3 14h18",
    "M4 12l5 5L20 5M3 3h7M3 21h18",
    "M3 9v6h4l12 5V4L7 9zM7 15l2 6",
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-4",
  ];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index]} />
    </svg>
  );
}
export default function AdminWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>();
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState(false);
  const slug = pathname.split("/")[2] ?? "";
  const section = adminSections.find((s) => s.slug === slug);
  useEffect(() => {
    let alive = true;
    getMe().then(
      ({ user }) => {
        if (alive) {
          setUser(user);
          setError(undefined);
        }
      },
      (e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login?next=/admin");
        } else setError(e.message);
      },
    );
    return () => {
      alive = false;
    };
  }, [retry, router]);
  const role = user?.role ?? "contributor";
  const signOut = async () => {
    try {
      await logout();
      clearDraft();
      router.push("/login");
    } catch {
      setError("Could not log out. Please try again to close your session.");
    }
  };
  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <Link href="/admin" prefetch={false} className="admin-brand">
          <Mark size={28} />
          <span>
            Detasawy<small>DATA WORKSPACE</small>
          </span>
        </Link>
        <button
          className="admin-menu admin-button"
          aria-expanded={open}
          aria-controls="admin-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close menu" : "Menu"}
        </button>
        <nav
          id="admin-navigation"
          className={open ? "is-open" : ""}
          aria-label="Administration"
        >
          <p className="admin-nav-label">WORKSPACE</p>
          {adminSections
            .filter((s) => s.roles.some((r) => r === role))
            .map((s) => (
              <Link
                key={s.slug}
                href={`/admin${s.slug ? `/${s.slug}` : ""}`}
                prefetch={false}
                onClick={() => setOpen(false)}
                aria-current={s.slug === slug ? "page" : undefined}
              >
                <Icon index={adminSections.indexOf(s)} />
                {s.title}
              </Link>
            ))}
          <p className="admin-nav-label">COMMUNITY</p>
          <Link href="/contribute" onClick={() => setOpen(false)}>
            Contributor portal ↗
          </Link>
          <Link href="/">Public website ↗</Link>
          <button
            className="admin-mobile-logout admin-button"
            onClick={signOut}
          >
            Log out
          </button>
        </nav>
        <div className="admin-account">
          <span className="admin-avatar">
            {(user?.name || user?.email || "D")[0].toUpperCase()}
          </span>
          <div>
            <strong>{user?.name || "Team account"}</strong>
            <small>{role === "campaign" ? "Campaign manager" : role}</small>
          </div>
          <button onClick={signOut} aria-label="Log out" title="Log out">
            ↪
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            Workspace <span aria-hidden="true">/</span>{" "}
            {section?.title ?? "Not found"}
          </span>
          <span className="admin-badge">
            {process.env.NODE_ENV === "development" ? "Local preview" : "Pilot"}
          </span>
        </header>
        <main className="admin-content">
          {!user && !error && <Loading />}
          <ErrorNotice message={error} retry={() => setRetry((v) => v + 1)} />
          {user &&
            !error &&
            (allowed(slug, role) ? (
              <AdminUserContext.Provider value={user}>
                <div className="admin-page-heading">
                  <p className="admin-eyebrow">DETASAWY / ADMINISTRATION</p>
                  <h1>{section?.title}</h1>
                  <p>{section?.description}</p>
                </div>
                {children}
              </AdminUserContext.Provider>
            ) : (
              <div className="admin-empty">
                <h1>This workspace is not available to your role.</h1>
                <Link href="/contribute">Return to contributing</Link>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
