import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPush } from "@/components/admin/AdminPush";
import { pushEnabled } from "@/lib/push";
import { ReturnHere } from "@/components/admin/ReturnHere";
import { Monogram } from "@/components/brand/Logo";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import type { Role } from "@/lib/auth";
import { logout, setAdminLanguage } from "@/app/admin/actions";

/** Kopf, Menü und Rahmen des Admins. Mit dem Kassen-Login nur die Kasse. */
export async function AdminShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { locale, t } = await getAdminText();
  const links = role === "admin"
    ? [
        { href: "/admin", label: t.nav.bookings, short: t.nav.short[0] },
        { href: "/admin/kalender", label: t.nav.calendar, short: t.nav.short[1] },
        { href: "/admin/kasse", label: t.nav.pos, short: t.nav.pos },
        { href: "/admin/kunden", label: t.nav.customers, short: t.nav.short[2] },
        { href: "/admin/leistungen", label: t.nav.services, short: t.nav.short[3] },
        { href: "/admin/zeiten", label: t.nav.hours, short: t.nav.short[4] },
        { href: "/admin/regeln", label: t.nav.rules, short: t.nav.short[5] },
        { href: "/admin/emails", label: t.nav.emails, short: t.nav.short[6] },
      ]
    : [];
  return (
    <div className={`admin${role === "kasse" ? " admin-kasse-only" : ""}`}>
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link href={role === "admin" ? "/admin" : "/admin/kasse"} className="admin-brand" aria-label="GYAN Admin">
            <Monogram className="admin-mono" />
            <span>{role === "admin" ? "Admin" : t.nav.pos}</span>
          </Link>
          {links.length > 0 && <AdminNav links={links} />}
          <div className="admin-header-actions">
            <form action={setAdminLanguage} className="admin-lang" aria-label={t.nav.language}>
              <ReturnHere />
              {LOCALES.map((l) => (
                <button key={l} name="lang" value={l} className={l === locale ? "active" : ""} type="submit">
                  {l.toUpperCase()}
                </button>
              ))}
            </form>
            {role === "admin" && <Link href={`/${locale}`} className="small muted" target="_blank">{t.nav.website} ↗</Link>}
            <form action={logout}>
              <button className="btn btn-light btn-sm" type="submit">{t.nav.logout}</button>
            </form>
          </div>
        </div>
      </header>
      <main className="container admin-main">
        {role === "admin" && <AdminPush t={t.push} enabled={pushEnabled} />}
        {children}
      </main>
    </div>
  );
}
