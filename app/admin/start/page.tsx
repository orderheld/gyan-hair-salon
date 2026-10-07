import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Startbildschirm: Termine oder Kasse */
export default async function Start() {
  await requireAdmin();
  const { t } = await getAdminText();
  return (
    <AdminShell mode="start">
      <div className="start">
        <h1 className="h2 start-title">{t.start.title}</h1>
        <div className="start-grid">
          <Link href="/admin" className="start-tile">
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" /></svg>
            <strong>{t.start.bookings}</strong>
            <span>{t.start.bookingsHint}</span>
          </Link>
          <Link href="/admin/kasse" className="start-tile">
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2.5" /><path d="M7 10V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V10M9 7h6M8 14h2M14 14h2M8 17h8" /></svg>
            <strong>{t.start.pos}</strong>
            <span>{t.start.posHint}</span>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
