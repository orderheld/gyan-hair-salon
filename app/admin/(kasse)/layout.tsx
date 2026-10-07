import { AdminShell } from "@/components/admin/AdminShell";
import { requireKasse } from "@/lib/auth";

export default async function KasseLayout({ children }: { children: React.ReactNode }) {
  const role = await requireKasse();
  return <AdminShell role={role}>{children}</AdminShell>;
}
