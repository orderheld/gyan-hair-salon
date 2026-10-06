import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { DirtyWatch, Stepper } from "@/components/admin/Stepper";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { site } from "@/content/site";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { getServices, SERVICE_CATEGORIES, type Service } from "@/lib/data";
import { fill, type AdminDict } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { deleteService, saveService } from "../../actions";

const IMAGES = Array.from(
  new Set([...site.images.serviceFallback.map(([, src]) => src), site.images.hero, site.images.lounge, site.images.wash, site.images.reception, site.images.signature, ...site.images.work]),
);

const formatPrice = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

const Chevron = () => (
  <span className="svc-sum-chev" aria-hidden>
    <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
  </span>
);

function ServiceForm({ s, t, nextSort }: { s?: Service; t: AdminDict; nextSort?: number }) {
  const uid = s ? `s${s.id}` : "new";
  const steps = { less: t.services.less, more: t.services.plus };
  return (
    <form action={saveService} className="svc-form">
      <DirtyWatch />
      {s && <input type="hidden" name="id" value={s.id} />}

      {!s && (
        <div className="field">
          <label htmlFor={`${uid}-name`}>{t.services.name} · {LOCALE_NAMES.de}</label>
          <input id={`${uid}-name`} name="name_de" className="input" required />
        </div>
      )}

      {/* Das Wichtigste zuerst: Preis und Dauer, gross und mit − / + */}
      <div className="svc-quick">
        <div className="qcard">
          <label className="qcard-label" htmlFor={`${uid}-price`}>{t.services.price}</label>
          <Stepper id={`${uid}-price`} name="price" defaultValue={s?.priceChf} step={5} min={0} max={1000} prefix="CHF" decimal labels={steps} />
          <label className="switch-row">
            <span>{t.services.priceFrom}</span>
            <input type="checkbox" name="priceFrom" defaultChecked={s?.priceFrom} className="tgl" />
          </label>
        </div>
        <div className="qcard">
          <label className="qcard-label" htmlFor={`${uid}-dur`}>{t.services.duration}</label>
          <Stepper id={`${uid}-dur`} name="duration" defaultValue={s?.durationMin ?? 30} step={5} min={5} max={480} suffix="min" labels={steps} />
          {s && (
            <label className="switch-row">
              <span>{t.services.active}</span>
              <input type="checkbox" name="active" defaultChecked={s.active} className="tgl" />
            </label>
          )}
        </div>
        <div className="qcard qcard-wide">
          <label className="qcard-label" htmlFor={`${uid}-walkin`}>{t.services.walkin}</label>
          <Stepper id={`${uid}-walkin`} name="walkin" defaultValue={s?.walkinPriceChf ?? undefined} step={5} min={0} max={1000} prefix="CHF" decimal optional labels={steps} />
          <p className="muted small">{t.services.walkinHint}</p>
        </div>
      </div>

      <details className="svc-more">
        <summary>{t.services.texts}</summary>
        <div className="svc-langs">
          {LOCALES.map((l) => (
            <details key={l} className="svc-lang" open={l === "de" && !!s}>
              <summary>
                {LOCALE_NAMES[l]}
                {s && <span className="muted small"> · {s.name[l] || "–"}</span>}
              </summary>
              <div className="svc-lang-body">
                {(s || l !== "de") && (
                  <div className="field"><label>{t.services.name}</label><input name={`name_${l}`} defaultValue={s?.name[l]} className="input" required={l === "de"} /></div>
                )}
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
      </details>

      <details className="svc-more">
        <summary>{t.services.more}</summary>
        <div className="svc-nums">
          <div className="field">
            <label htmlFor={`${uid}-cat`}>{t.services.category}</label>
            <select id={`${uid}-cat`} name="category" defaultValue={s?.category ?? "cut"} className="select">
              {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{t.services.categories[c]}</option>)}
            </select>
          </div>
          <label className="switch-row">
            <span>{t.services.popular}</span>
            <input type="checkbox" name="popular" defaultChecked={s?.popular} className="tgl" />
          </label>
          <div className="field"><label>{t.services.sort}</label><input name="sort" type="number" inputMode="numeric" defaultValue={s?.sort ?? nextSort} className="input" /></div>
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
      </details>

      <div className="svc-savebar">
        <span className="svc-unsaved">{t.services.unsaved}</span>
        <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark">{s ? t.common.save : t.common.add}</SubmitButton>
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
              <span className="svc-sum-ico" aria-hidden><ServiceIcon name={s.icon} /></span>
              <span className="svc-sum-name">
                <strong>{s.name.de}</strong>
                <span className="svc-sum-meta">
                  <span>{s.durationMin} min</span>
                  {s.walkinPriceChf != null && <span>{t.services.walkinShort} {formatPrice(s.walkinPriceChf)}</span>}
                  <span className={`svc-state${s.active ? " on" : ""}`}>{s.active ? t.services.online : t.services.inactive}</span>
                </span>
              </span>
              <span className="svc-sum-price">
                {s.priceFrom && <small>{t.services.priceFromShort}</small>}
                <span className="svc-sum-cur">CHF</span>
                <b>{formatPrice(s.priceChf)}</b>
              </span>
              <Chevron />
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

        <details className="panel svc svc-new" id="neu" open={services.length === 0}>
          <summary className="svc-sum">
            <span className="svc-sum-ico svc-sum-plus" aria-hidden><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" /></svg></span>
            <span className="svc-sum-name"><strong>{t.services.newTitle}</strong></span>
            <Chevron />
          </summary>
          <ServiceForm t={t} nextSort={nextSort} />
        </details>
      </div>
    </>
  );
}
