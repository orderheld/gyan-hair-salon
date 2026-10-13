import { AdminShell } from "@/components/admin/AdminShell";
import { PinPad } from "@/components/admin/PinPad";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Sperrbildschirm der Kasse */
export default async function Pin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await requireAdmin();
  const { next = "" } = await searchParams;
  // Nur Ziele innerhalb der Kasse (z. B. ein Gutschein aus dem Gutschein-Bereich)
  const target = next.startsWith("/admin/kasse") && !next.startsWith("//") ? next.slice(0, 200) : "/admin/kasse";
  const { t } = await getAdminText();
  return (
    <AdminShell mode="pin">
      <PinPad next={target} t={{ title: t.kasse.pinTitle, hint: t.kasse.pinHint, wrong: t.kasse.pinWrong, back: t.nav.leave, del: t.kasse.pinDelete }} />
    </AdminShell>
  );
}
