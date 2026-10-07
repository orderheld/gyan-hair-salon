import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export default async function StempelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell mode="stempel">{children}</AdminShell>;
}
