import { AdminShell } from "@/components/admin/AdminShell";
import { PinPad } from "@/components/admin/PinPad";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Sperrbildschirm der Kasse */
export default async function Pin() {
  await requireAdmin();
  const { t } = await getAdminText();
  return (
    <AdminShell mode="start">
      <PinPad t={{ title: t.kasse.pinTitle, hint: t.kasse.pinHint, wrong: t.kasse.pinWrong, back: t.nav.leave, del: t.kasse.pinDelete }} />
    </AdminShell>
  );
}
