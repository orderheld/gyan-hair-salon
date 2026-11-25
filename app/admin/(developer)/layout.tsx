import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell mode="developer">{children}</AdminShell>;
}
