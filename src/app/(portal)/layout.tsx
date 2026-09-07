import ProfileHydrator from "@/components/portal/ProfileHydrator";
import Sidebar from "@/components/portal/Sidebar";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
