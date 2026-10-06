import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { site } from "@/content/site";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { getServices, type Service } from "@/lib/data";
import { fill, type AdminDict } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { deleteService, saveService } from "../../actions";

const IMAGES = Array.from(
  new Set([...site.images.serviceFallback.map(([, src]) => src), site.images.hero, site.images.lounge, site.images.wash, site.images.reception, site.images.signature, ...site.images.work]),
);

function ServiceForm({ s, t, nextSort }: { s?: Service; t: AdminDict; nextSort?: number }) {
  return (
    <form action={saveService} className="svc-form">
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="svc-langs">
        {LOCALES.map((l) => (
          <details key={l} className="svc-lang" open={l === "de"}>
            <summary>
              {LOCALE_NAMES[l]}
              {s && <span className="muted small"> · {s.name[l] || "–"}</span>}
            </summary>
            <div className="svc-lang-body">
              <div className="field"><label>{t.services.name}</label><input name={`name_${l}`} defaultValue={s?.name[l]} className="input" required={l === "de"} /></div>
              <div className="field"><label>{t.services.short}</label><input name={`short_${l}`} defaultValue={s?.short[l]} className="input" /></div>
              <div className="field"><label>{t.services.long}</label><textarea name={`long_${l}`} defaultValue={s?.long[l]} className="textarea" rows={6} /></div>
              <div className="field">
                <label>{t.services.slug}</label>
                <input name={`slug_${l}`} defaultValue={s?.slug[l]} className="input" placeholder={t.services.slugHint} />
              </div>
            </div>
          </details>
        ))}
      </div>
      <div className="svc-nums">
        <div className="field"><label>{t.services.duration}</label><input name="duration" type="number" min={5} max={480} step={5} defaultValue={s?.durationMin ?? 30} className="input" required /></div>
        <div className="field"><label>{t.services.price}</label><input name="price" inputMode="decimal" defaultValue={s?.priceChf} className="input" required /></div>
        <div className="field"><label>{t.services.sort}</label><input name="sort" type="number" defaultValue={s?.sort ?? nextSort} className="input" /></div>
        <div className="field">
          <label>{t.services.image}</label>
          <select name="image" defaultValue={s?.image ?? ""} className="select">
            <option value="">{t.services.imageAuto}</option>
            {[...IMAGES, ...(s?.image && !IMAGES.includes(s.image) ? [s.image] : [])].map((src) => (
              <option key={src} value={src}>{src.replace("/images/", "")}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="svc-foot">
        <label className="check-row"><input type="checkbox" name="priceFrom" defaultChecked={s?.priceFrom} /> {t.services.priceFrom}</label>
        {s && <label className="check-row"><input type="checkbox" name="active" defaultChecked={s.active} /> {t.services.active}</label>}
        <span className="spacer" />
        <SubmitButton pendingLabel={t.common.saving}>{s ? t.common.save : t.common.add}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminServices({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { t } = await getAdminText();
  const services = await getServices({ includeInactive: true });
  const nextSort = (services.at(-1)?.sort ?? 0) + 10;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.services.title}</h1>
        <p className="muted">{t.services.hint}</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="svc-list">
        {services.map((s) => (
          <details key={s.id} id={`s${s.id}`} className={`panel svc ${s.active ? "" : "inactive"}`}>
            <summary className="svc-sum">
              <span className="svc-sum-name">
                <strong>{s.name.de}</strong>
                <span className="muted small">
                  {s.durationMin} min · {s.priceFrom ? `${t.services.priceFromShort} ` : ""}CHF {s.priceChf}
                  {!s.active && ` · ${t.services.inactive}`}
                </span>
              </span>
              <span className="svc-sum-edit">{t.common.edit}</span>
            </summary>
            <ServiceForm s={s} t={t} />
            <form action={deleteService} className="svc-del">
              <input type="hidden" name="id" value={s.id} />
              <ConfirmButton message={fill(t.services.deleteConfirm, { name: s.name.de })} className="link-danger">
                {t.common.delete}
              </ConfirmButton>
            </form>
          </details>
        ))}
      </div>

      <section className="panel" id="neu" style={{ marginTop: 24 }}>
        <h2 className="h3" style={{ marginBottom: 16 }}>{t.services.newTitle}</h2>
        <ServiceForm t={t} nextSort={nextSort} />
      </section>
    </>
  );
}
