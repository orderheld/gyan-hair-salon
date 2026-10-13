"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { posCheckout, posFindVoucher } from "@/app/admin/kasse-actions";
import { fill } from "@/lib/i18n/fill";
import type { AdminDict } from "@/lib/i18n/admin/de";
import type { CartLine, Payment } from "@/lib/pos";

type Svc = { id: number; name: string; priceChf: number; walkinChf: number | null };
type Prod = { id: number; name: string; priceChf: number };
type Bk = { id: string; time: string; serviceId: number | null; label: string; billed: boolean; staffId: string };
type Line = CartLine & { key: string; name: string; unit: number; balance?: number };
type FoundVoucher = { code: string; state: string; amountChf: number; balanceChf: number; recipient: string; buyer: string };

const chf = (n: number) => (Number.isInteger(n) ? `${n}.–` : n.toFixed(2));

/** Kasse wie eine App: antippen, wer bedient hat, Zahlungsart, kassieren. */
export function PosTerminal({ t, staff, services, products, bookings, initialVoucher, focusVoucher }: { t: AdminDict["kasse"]; staff: { id: string; name: string }[]; services: Svc[]; products: Prod[]; bookings: Bk[]; initialVoucher?: FoundVoucher | null; focusVoucher?: boolean }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState(staff.length === 1 ? staff[0].id : "");
  const [walkin, setWalkin] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);
  const [payment, setPayment] = useState<Payment | "">("");
  const [given, setGiven] = useState("");
  const [note, setNote] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [vAmount, setVAmount] = useState("");
  const [vRecipient, setVRecipient] = useState("");
  const [vCode, setVCode] = useState(initialVoucher?.code ?? "");
  const [found, setFound] = useState<FoundVoucher | null>(initialVoucher ?? null);
  const [checking, startCheck] = useTransition();

  // Einlösen zieht höchstens den Restwert und höchstens das noch Offene ab (wie die Kasse auf dem Server)
  const priced = useMemo(() => {
    let open = Math.round(lines.filter((l) => l.kind !== "voucherRedeem").reduce((s, l) => s + l.unit * l.qty, 0) * 100) / 100;
    return lines.map((l) => {
      if (l.kind !== "voucherRedeem") return l;
      const take = Math.round(Math.min(l.balance ?? 0, Math.max(0, open)) * 100) / 100;
      open = Math.round((open - take) * 100) / 100;
      return { ...l, unit: -take };
    });
  }, [lines]);
  const total = useMemo(() => Math.round(priced.reduce((s, l) => s + l.unit * l.qty, 0) * 100) / 100, [priced]);
  const hasRedeem = lines.some((l) => l.kind === "voucherRedeem");
  const coveredByVoucher = hasRedeem && total === 0;
  const givenNum = Number(given.replace(",", "."));
  const change = payment === "cash" && given && Number.isFinite(givenNum) ? Math.round((givenNum - total) * 100) / 100 : null;

  function add(line: Omit<Line, "qty">) {
    setError("");
    setLines((ls) => {
      const found = ls.find((l) => l.key === line.key);
      return found ? ls.map((l) => (l.key === line.key ? { ...l, qty: Math.min(99, l.qty + 1) } : l)) : [...ls, { ...line, qty: 1 } as Line];
    });
  }
  const addService = (s: Svc, asWalkin = walkin) => {
    const w = asWalkin && s.walkinChf !== null;
    add({ kind: "service", id: s.id, walkin: w, key: `s${s.id}${w ? "w" : "a"}`, name: s.name + (w ? ` · ${t.walkin}` : ""), unit: w ? s.walkinChf! : s.priceChf } as Omit<Line, "qty">);
  };
  const setQty = (key: string, d: number) =>
    setLines((ls) => ls.flatMap((l) => (l.key !== key ? [l] : l.qty + d < 1 ? [] : [{ ...l, qty: Math.min(99, l.qty + d) }])));

  // Pro Termin höchstens ein Eintrag: nochmals tippen wählt ab, ein anderer Termin ersetzt den vorherigen
  function pickBooking(b: Bk) {
    if (b.billed) return;
    const prev = bookings.find((x) => x.id === bookingId);
    const prevKey = prev ? `s${prev.serviceId}a` : null;
    if (prevKey) setQty(prevKey, -1);
    if (bookingId === b.id) { setBookingId(null); return; }
    setBookingId(b.id);
    if (staff.some((s) => s.id === b.staffId)) setStaffId(b.staffId);
    const s = services.find((x) => x.id === b.serviceId);
    if (s) addService(s, false);
  }

  function addCustom() {
    const price = Math.round(Number(customPrice.replace(",", ".")) * 100) / 100;
    if (!customName.trim() || !Number.isFinite(price) || price === 0) { setError(t.errors.custom); return; }
    add({ kind: "custom", name: customName.trim(), priceChf: price, key: `c${Date.now()}`, unit: price } as Omit<Line, "qty">);
    setCustomName("");
    setCustomPrice("");
  }

  function addVoucher() {
    const amount = Math.round(Number(vAmount.replace(",", ".")) * 100) / 100;
    if (!Number.isFinite(amount) || amount < 1 || amount > 2000) { setError(t.errors.voucherAmount); return; }
    if (hasRedeem) { setError(t.errors.voucherMix); return; }
    const recipient = vRecipient.trim().slice(0, 60);
    add({ kind: "voucher", amountChf: amount, recipient, key: `v${Date.now()}`, name: `${t.voucherNew}${recipient ? ` · ${fill(t.voucherFor, { name: recipient })}` : ""}`, unit: amount } as Omit<Line, "qty">);
    setVAmount("");
    setVRecipient("");
  }

  function checkVoucher() {
    setError("");
    setFound(null);
    if (!vCode.trim()) return;
    startCheck(async () => {
      const res = await posFindVoucher(vCode);
      if (res.error || !res.voucher) { setError(res.error ?? t.errors.voucher); return; }
      setFound(res.voucher);
      setVCode(res.voucher.code);
    });
  }

  function useVoucher(v: FoundVoucher) {
    if (lines.some((l) => (l.kind === "voucherPickup" || l.kind === "voucherRedeem") && l.code === v.code)) { setError(t.errors.voucherTwice); return; }
    if (v.state === "ordered") {
      if (hasRedeem) { setError(t.errors.voucherMix); return; }
      add({ kind: "voucherPickup", code: v.code, key: `vp${v.code}`, name: fill(t.voucherPickupLine, { code: v.code }), unit: v.amountChf } as Omit<Line, "qty">);
    } else {
      if (lines.some((l) => l.kind === "voucher" || l.kind === "voucherPickup")) { setError(t.errors.voucherMix); return; }
      add({ kind: "voucherRedeem", code: v.code, key: `vr${v.code}`, name: fill(t.voucherRedeemLine, { code: v.code }), unit: 0, balance: v.balanceChf } as Omit<Line, "qty">);
    }
    setFound(null);
    setVCode("");
  }

  function clear() {
    setLines([]); setPayment(""); setGiven(""); setNote(""); setBookingId(null); setError(""); setFound(null);
  }

  function checkout() {
    if (!lines.length) return setError(t.errors.empty);
    if (!staffId) return setError(t.errors.staff);
    if (!payment && !coveredByVoucher) return setError(t.errors.payment);
    if (change !== null && change < 0) return setError(t.errors.given);
    setError("");
    start(async () => {
      const res = await posCheckout({
        staffId,
        payment: coveredByVoucher ? "voucher" : (payment as Payment),
        givenChf: !coveredByVoucher && payment === "cash" && given ? givenNum : null,
        bookingId,
        note,
        lines: lines.map((l): CartLine => {
          if (l.kind === "service") return { kind: "service", id: l.id, walkin: l.walkin, qty: l.qty };
          if (l.kind === "product") return { kind: "product", id: l.id, qty: l.qty };
          if (l.kind === "voucher") return { kind: "voucher", amountChf: l.amountChf, recipient: l.recipient, qty: l.qty };
          if (l.kind === "voucherPickup" || l.kind === "voucherRedeem") return { kind: l.kind, code: l.code, qty: 1 };
          return { kind: "custom", name: l.name, priceChf: l.unit, qty: l.qty };
        }),
      });
      if (res.error || !res.no) { setError(res.error ?? t.errors.generic); return; }
      router.push(`/admin/kasse/beleg/${res.no}?neu=1`);
    });
  }

  return (
    <div className="pos">
      <div className="pos-pick">
        <section className="panel pos-sec">
          <h2 className="pos-h">{t.staff}</h2>
          <div className="pos-staff">
            {staff.map((s) => (
              <button key={s.id} type="button" className={`pos-chip${staffId === s.id ? " on" : ""}`} aria-pressed={staffId === s.id} onClick={() => setStaffId(s.id)}>{s.name}</button>
            ))}
          </div>
        </section>

        {bookings.length > 0 && (
          <section className="panel pos-sec">
            <h2 className="pos-h">{t.todayBookings}</h2>
            <div className="pos-bookings">
              {bookings.map((b) => (
                <button key={b.id} type="button" className={`pos-bk${bookingId === b.id ? " on" : ""}`} disabled={b.billed || pending} aria-pressed={bookingId === b.id} onClick={() => pickBooking(b)}>
                  <strong>{b.time}</strong>
                  <span>{b.label}</span>
                  {b.billed && <em>✓ {t.billed}</em>}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="panel pos-sec">
          <div className="pos-h-row">
            <h2 className="pos-h">{t.services}</h2>
            <div className="pos-seg" role="group">
              <button type="button" className={walkin ? "on" : ""} aria-pressed={walkin} onClick={() => setWalkin(true)}>{t.walkin}</button>
              <button type="button" className={!walkin ? "on" : ""} aria-pressed={!walkin} onClick={() => setWalkin(false)}>{t.appt}</button>
            </div>
          </div>
          <div className="pos-grid">
            {services.map((s) => {
              const price = walkin && s.walkinChf !== null ? s.walkinChf : s.priceChf;
              return (
                <button key={s.id} type="button" className="pos-item" onClick={() => addService(s)}>
                  <span>{s.name}</span>
                  <strong>{chf(price)}</strong>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel pos-sec">
          <h2 className="pos-h">{t.products}</h2>
          {products.length ? (
            <div className="pos-grid">
              {products.map((p) => (
                <button key={p.id} type="button" className="pos-item" onClick={() => add({ kind: "product", id: p.id, key: `p${p.id}`, name: p.name, unit: p.priceChf } as Omit<Line, "qty">)}>
                  <span>{p.name}</span>
                  <strong>{chf(p.priceChf)}</strong>
                </button>
              ))}
            </div>
          ) : <p className="muted small">{t.noProducts}</p>}
          <details className="pos-custom">
            <summary>{t.custom}</summary>
            <div className="pos-custom-row">
              <input className="input" placeholder={t.customName} value={customName} maxLength={80} onChange={(e) => setCustomName(e.target.value)} />
              <input className="input" placeholder={t.customPrice} inputMode="decimal" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
              <button type="button" className="btn btn-light" onClick={addCustom}>{t.addCustom}</button>
            </div>
          </details>
        </section>

        <section className="panel pos-sec" id="pos-gutschein">
          <h2 className="pos-h">{t.vouchers}</h2>
          <div className="pos-vc">
            <div className="pos-vc-part">
              <h3 className="pos-sub">{t.voucherSell}</h3>
              <div className="pos-custom-row">
                <input className="input" placeholder={t.voucherAmount} inputMode="decimal" value={vAmount} autoFocus={focusVoucher} onChange={(e) => setVAmount(e.target.value)} aria-label={t.voucherAmount} />
                <input className="input" placeholder={t.voucherRecipient} value={vRecipient} maxLength={60} onChange={(e) => setVRecipient(e.target.value)} aria-label={t.voucherRecipient} />
                <button type="button" className="btn btn-light" onClick={addVoucher}>{t.voucherAdd}</button>
              </div>
              <p className="muted small">{t.voucherHint}</p>
            </div>
            <div className="pos-vc-part">
              <h3 className="pos-sub">{t.voucherUse}</h3>
              <form className="pos-custom-row pos-vc-find" onSubmit={(e) => { e.preventDefault(); checkVoucher(); }}>
                <input className="input pos-vc-code" placeholder="GYAN-XXXX-XXXX" value={vCode} autoCapitalize="characters" autoComplete="off" onChange={(e) => setVCode(e.target.value)} aria-label={t.voucherCode} />
                <button type="submit" className="btn btn-light" disabled={checking}>{checking ? "…" : t.voucherCheck}</button>
              </form>
              {found && (
                <div className="pos-vc-found">
                  <div>
                    <strong className="pos-vc-code">{found.code}</strong>
                    <span className="muted small">
                      {found.state === "ordered" ? t.voucherOrdered : `${t.voucherValid} · ${t.voucherBalance} CHF ${chf(found.balanceChf)}`}
                      {found.recipient ? ` · ${fill(t.voucherFor, { name: found.recipient })}` : found.buyer ? ` · ${found.buyer}` : ""}
                    </span>
                  </div>
                  <button type="button" className="btn btn-dark btn-sm" onClick={() => useVoucher(found)}>
                    {found.state === "ordered" ? `${t.voucherPickup} · CHF ${chf(found.amountChf)}` : t.voucherRedeem}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {lines.length > 0 && (
        <button type="button" className="pos-float" onClick={() => document.getElementById("pos-cart")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <span>{t.cart} · {lines.reduce((n, l) => n + l.qty, 0)}</span>
          <strong>CHF {chf(total)} ↓</strong>
        </button>
      )}
      <aside className="panel pos-cart" id="pos-cart" aria-live="polite">
        <div className="pos-h-row">
          <h2 className="pos-h">{t.cart}</h2>
          {lines.length > 0 && <button type="button" className="link-danger" onClick={clear}>{t.clear}</button>}
        </div>
        {lines.length === 0 ? <p className="muted small">{t.empty}</p> : (
          <ul className="pos-lines">
            {priced.map((l) => (
              <li key={l.key}>
                <span className="pos-line-name">{l.name}</span>
                {l.kind === "voucherPickup" || l.kind === "voucherRedeem" ? (
                  <span className="pos-qty">
                    <button type="button" aria-label="−" onClick={() => setQty(l.key, -1)}>×</button>
                  </span>
                ) : (
                  <span className="pos-qty">
                    <button type="button" aria-label="−" onClick={() => setQty(l.key, -1)}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" aria-label="+" onClick={() => setQty(l.key, 1)}>+</button>
                  </span>
                )}
                <strong>{chf(Math.round(l.unit * l.qty * 100) / 100)}</strong>
              </li>
            ))}
          </ul>
        )}
        <div className="pos-total"><span>{t.total}</span><strong>CHF {chf(total)}</strong></div>

        {coveredByVoucher ? <p className="pos-covered">{t.paidByVoucher}</p> : <>
        <h3 className="pos-h">{t.payment}</h3>
        <div className="pos-pay">
          {(["cash", "card", "twint"] as const).map((p) => (
            <button key={p} type="button" className={`pos-chip${payment === p ? " on" : ""}`} aria-pressed={payment === p} onClick={() => setPayment(p)}>{t.pay[p]}</button>
          ))}
        </div>
        {payment === "cash" && (
          <div className="pos-cash">
            <label className="field">
              <span>{t.given}</span>
              <input className="input" inputMode="decimal" value={given} onChange={(e) => setGiven(e.target.value)} placeholder={chf(total)} />
            </label>
            {change !== null && <p className={`pos-change${change < 0 ? " bad" : ""}`}>{t.change}: <strong>CHF {chf(Math.max(0, change))}</strong></p>}
          </div>
        )}
        </>}
        <input className="input pos-note" placeholder={t.note} value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button type="button" className="btn btn-dark pos-go" disabled={pending} onClick={checkout}>
          {pending ? t.checkingOut : `${t.checkout} · CHF ${chf(total)}`}
        </button>
      </aside>
    </div>
  );
}
