import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReturnHere } from "@/components/admin/ReturnHere";
import { Monogram } from "@/components/brand/Logo";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { logout, setAdminLanguage } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { locale, t } = await getAdminText();
  return (
    <div className="admin">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link href="/admin" className="admin-brand" aria-label="GYAN Admin">
            <Monogram className="admin-mono" />
            <span>Admin</span>
          </Link>
          <AdminNav
            links={[
              { href: "/admin", label: t.nav.bookings, short: t.nav.short[0] },
              { href: "/admin/kunden", label: t.nav.customers, short: t.nav.short[1] },
              { href: "/admin/leistungen", label: t.nav.services, short: t.nav.short[2] },
              { href: "/admin/zeiten", label: t.nav.hours, short: t.nav.short[3] },
              { href: "/admin/regeln", label: t.nav.rules, short: t.nav.short[4] },
              { href: "/admin/emails", label: t.nav.emails, short: t.nav.short[5] },
            ]}
          />
          <div className="admin-header-actions">
            <form action={setAdminLanguage} className="admin-lang" aria-label={t.nav.language}>
              <ReturnHere />
              {LOCALES.map((l) => (
                <button key={l} name="lang" value={l} className={l === locale ? "active" : ""} type="submit">
                  {l.toUpperCase()}
                </button>
              ))}
            </form>
            <Link href={`/${locale}`} className="small muted" target="_blank">{t.nav.website} ↗</Link>
            <form action={logout}>
              <button className="btn btn-light btn-sm" type="submit">{t.nav.logout}</button>
            </form>
          </div>
        </div>
      </header>
      <main className="container admin-main">{children}</main>
    </div>
  );
}
