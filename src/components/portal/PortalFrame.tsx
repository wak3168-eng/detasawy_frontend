"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/portal/Sidebar";
import ProfileHydrator from "@/components/portal/ProfileHydrator";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
export default function PortalFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/"))
    return <AdminWorkspace>{children}</AdminWorkspace>;
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <ProfileHydrator />
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
