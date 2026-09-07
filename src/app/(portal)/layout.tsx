import ProfileHydrator from "@/components/portal/ProfileHydrator";
import Sidebar from "@/components/portal/Sidebar";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-5 py-6 md:flex-row md:gap-8 md:py-10">
      <ProfileHydrator />
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
