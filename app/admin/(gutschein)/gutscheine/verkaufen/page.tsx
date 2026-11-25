import { redirect } from "next/navigation";
import { isKasseUnlocked, requireAdmin } from "@/lib/auth";
import { KASSE_ON } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Gutscheine im Salon verkauft man in der Kasse (Beleg und Kassenbuch). Gesperrt: zuerst PIN. */
export default async function VoucherSell() {
  await requireAdmin();
  if (!KASSE_ON) redirect("/admin/gutscheine");
  const target = "/admin/kasse?gutschein=neu";
  redirect((await isKasseUnlocked()) ? target : `/admin/pin?next=${encodeURIComponent(target)}`);
}
