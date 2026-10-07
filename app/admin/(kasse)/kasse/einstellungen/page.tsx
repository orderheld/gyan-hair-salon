import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { KasseNav } from "@/components/admin/KasseNav";
import { getAdminText } from "@/lib/admin";
import { hasKassePassword, requireAdmin } from "@/lib/auth";
import { getProducts, getStaff } from "@/lib/pos";
import { getSettings } from "@/lib/settings";
import { posDeleteProduct, posSaveKassePassword, posSaveProduct, posSaveStaff, posSaveVat } from "@/app/admin/kasse-actions";

export const dynamic = "force-dynamic";

export default async function KasseSettings({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const { t } = await getAdminText();
  const k = t.kasse;
  const [staff, products, settings, hasPw] = await Promise.all([getStaff({ includeInactive: true }), getProducts({ includeInactive: true }), getSettings(), hasKassePassword()]);

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.nav.pos}</h1>
      </div>
      <KasseNav role="admin" active="settings" t={k} />
      <Flash ok={ok} error={error} />

      <section className="panel" id="team">
        <h2 className="pos-h">{k.team}</h2>
        <p className="muted small">{k.teamHint}</p>
        <form action={posSaveStaff} className="stack">
          {staff.map((s) => (
            <div key={s.id} className="kset-row">
              <input className="input" name={`name_${s.id}`} defaultValue={s.name} maxLength={40} required aria-label={s.id} />
              <label className="check-row"><input type="checkbox" name={`active_${s.id}`} defaultChecked={s.active} /> {k.active}</label>
            </div>
          ))}
          <div><SubmitButton>{t.common.save}</SubmitButton></div>
        </form>
      </section>

      <section className="panel" id="produkte">
        <h2 className="pos-h">{k.products}</h2>
        <p className="muted small">{k.productsHint}</p>
        <div className="stack">
          {products.map((p) => (
            <div key={p.id} className="kset-prod">
              <form action={posSaveProduct} className="kset-row">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="sort" value={p.sort} />
                <input className="input" name="name" defaultValue={p.name} maxLength={80} required aria-label={k.productName} />
                <input className="input kset-price" name="price" defaultValue={p.priceChf.toFixed(2)} inputMode="decimal" required aria-label={k.price} />
                <label className="check-row"><input type="checkbox" name="active" defaultChecked={p.active} /> {k.active}</label>
                <SubmitButton className="btn btn-light btn-sm">{t.common.save}</SubmitButton>
              </form>
              <form action={posDeleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton className="link-danger" message={`${p.name}: ${t.common.delete}?`}>{t.common.delete}</ConfirmButton>
              </form>
            </div>
          ))}
          <form action={posSaveProduct} className="kset-row kset-new">
            <input type="hidden" name="sort" value={products.length + 1} />
            <input className="input" name="name" placeholder={k.productName} maxLength={80} required />
            <input className="input kset-price" name="price" placeholder={k.price} inputMode="decimal" required />
            <SubmitButton>{t.common.add}</SubmitButton>
          </form>
        </div>
      </section>

      <section className="panel" id="mwst">
        <h2 className="pos-h">{k.vat}</h2>
        <p className="muted small">{k.vatHint}</p>
        <form action={posSaveVat} className="kset-row">
          <input className="input" name="vatNumber" defaultValue={settings.vatNumber} placeholder="CHE-123.456.789 MWST" maxLength={40} aria-label={k.vatNo} />
          <div className="unit"><input className="input kset-price" name="vatRate" defaultValue={settings.vatRate} inputMode="decimal" aria-label={k.vatRate} /><span>%</span></div>
          <SubmitButton>{t.common.save}</SubmitButton>
        </form>
      </section>

      <section className="panel" id="login">
        <h2 className="pos-h">{k.kasseLogin}</h2>
        <p className="muted small">{k.kasseLoginHint}</p>
        <p className="small"><strong>{hasPw ? k.kassePasswordSet : k.kassePasswordNone}</strong></p>
        <form action={posSaveKassePassword} className="kset-row">
          <input className="input" type="password" name="password" placeholder={k.kassePassword} minLength={6} maxLength={100} autoComplete="new-password" required />
          <SubmitButton>{t.common.save}</SubmitButton>
        </form>
        {hasPw && (
          <form action={posSaveKassePassword}>
            <input type="hidden" name="off" value="1" />
            <ConfirmButton className="link-danger" message={`${k.kassePasswordOff}?`}>{k.kassePasswordOff}</ConfirmButton>
          </form>
        )}
      </section>
    </>
  );
}
