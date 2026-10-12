import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export default async function GutscheinLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell mode="gutschein">{children}</AdminShell>;
}
