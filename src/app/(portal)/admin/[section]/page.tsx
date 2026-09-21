import { notFound } from "next/navigation";
import AdminPanel from "@/components/admin/AdminPanel";
import { adminSections } from "@/components/admin/sections";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: adminSections.find((s) => s.slug === section)?.title ?? "Admin",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!adminSections.some((s) => s.slug === section)) notFound();
  return <AdminPanel section={section} />;
}
