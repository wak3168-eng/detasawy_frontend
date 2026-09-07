import type { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Review — Detasawy",
};

export default function AdminPage() {
  return <AdminPanel />;
}
