import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPush } from "@/components/admin/AdminPush";
import { pushEnabled } from "@/lib/push";
import { ReturnHere } from "@/components/admin/ReturnHere";
import { FreshOnSave } from "@/components/admin/FreshOnSave";
import { Toaster } from "@/components/ui/Toast";
import { Suspense } from "react";
import { Monogram } from "@/components/brand/Logo";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { leaveArea, logout, setAdminLanguage } from "@/app/admin/actions";

/**
 * Rahmen des Admins. Drei Bereiche:
 * «start» = Auswahl Termine oder Kasse, «pin» = Sperrbildschirm der Kasse, «termine» = Termine mit allen Einstellungen, «kasse» = Kasse (mit PIN).
 * In Termine und Kasse führt «Verlassen» zurück zur Auswahl.
 */
export async function AdminShell({ mode, children }: { mode: "start" | "pin" | "termine" | "kasse" | "stempel"; children: React.ReactNode }) {
  const { locale, t } = await getAdminText();
  const links = [
    { href: "/admin", label: t.nav.bookings, short: t.nav.short[0] },
    { href: "/admin/kalender", label: t.nav.calendar, short: t.nav.short[1] },
    { href: "/admin/kunden", label: t.nav.customers, short: t.nav.short[2] },
    { href: "/admin/leistungen", label: t.nav.services, short: t.nav.short[3] },
    { href: "/admin/zeiten", label: t.nav.hours, short: t.nav.short[4] },
    { href: "/admin/regeln", label: t.nav.rules, short: t.nav.short[5] },
    { href: "/admin/emails", label: t.nav.emails, short: t.nav.short[6] },
  ];
  return (
    <div className={`admin admin-mode-${mode}`}>
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link href="/admin/start" className="admin-brand" aria-label="GYAN Admin">
            <Monogram className="admin-mono" />
            <span>{mode === "kasse" ? t.nav.pos : mode === "termine" ? t.nav.bookings : mode === "stempel" ? t.loyalty.title : "Admin"}</span>
          </Link>
          {mode === "termine" && <AdminNav links={links} />}
          <div className="admin-header-actions">
            <form action={setAdminLanguage} className="admin-lang" aria-label={t.nav.language}>
              <ReturnHere />
              {LOCALES.map((l) => (
                <button key={l} name="lang" value={l} className={l === locale ? "active" : ""} type="submit">
                  {l.toUpperCase()}
                </button>
              ))}
            </form>
            {(mode === "start" || mode === "termine") && <Link href={`/${locale}`} className="small muted admin-site-link" target="_blank">{t.nav.website} ↗</Link>}
            {mode === "start" ? (
              <form action={logout}>
                <button className="btn btn-light btn-sm" type="submit">{t.nav.logout}</button>
              </form>
            ) : (
              <form action={leaveArea}>
                <button className="btn btn-dark btn-sm admin-leave" type="submit">{t.nav.leave}</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <Toaster closeLabel={t.common.close} />
      <main className="container admin-main">
        {(mode === "start" || mode === "termine") && <AdminPush t={t.push} enabled={pushEnabled} />}
        <Suspense fallback={children}><FreshOnSave>{children}</FreshOnSave></Suspense>
      </main>
    </div>
  );
}
