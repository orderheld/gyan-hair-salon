import { AdminShell } from "@/components/admin/AdminShell";
import { requireKasse } from "@/lib/auth";

export default async function KasseLayout({ children }: { children: React.ReactNode }) {
  await requireKasse();
  return <AdminShell mode="kasse">{children}</AdminShell>;
}
