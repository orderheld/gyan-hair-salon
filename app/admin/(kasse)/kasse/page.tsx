import { KasseNav } from "@/components/admin/KasseNav";
import { PosTerminal } from "@/components/admin/PosTerminal";
import { getAdminText } from "@/lib/admin";
import { requireKasse } from "@/lib/auth";
import { getBookingsBetween, getServices } from "@/lib/data";
import { billedBookingIds, getProducts, getStaff } from "@/lib/pos";
import { getVoucherByCode } from "@/lib/vouchers";
import { addDays, toDateKey, toTimeKey, zurichToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

/** ?gutschein=CODE legt den Gutschein bereit (aus dem Gutschein-Bereich), ?gutschein=neu springt zum Verkaufen */
export default async function Kasse({ searchParams }: { searchParams: Promise<{ gutschein?: string }> }) {
  const { gutschein = "" } = await searchParams;
  await requireKasse(gutschein ? `/admin/kasse?gutschein=${encodeURIComponent(gutschein.slice(0, 40))}` : "");
  const v = gutschein && gutschein !== "neu" ? await getVoucherByCode(gutschein.slice(0, 40)) : null;
  const initialVoucher = v && (v.state === "ordered" || v.state === "valid" || v.state === "partial")
    ? { code: v.code, state: v.state, amountChf: v.amountChf, balanceChf: v.balanceChf, recipient: v.recipientName, buyer: v.buyerName }
    : null;
  const { t } = await getAdminText();
  const today = toDateKey(new Date());
  const [staff, services, products, bookings] = await Promise.all([
    getStaff(),
    getServices(),
    getProducts(),
    getBookingsBetween(zurichToDate(today, "00:00"), zurichToDate(addDays(today, 1), "00:00")),
  ]);
  const billed = await billedBookingIds(bookings.map((b) => b.id));

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.nav.pos}</h1>
      </div>
      <KasseNav active="sell" t={t.kasse} />
      <PosTerminal
        t={t.kasse}
        initialVoucher={initialVoucher}
        focusVoucher={gutschein === "neu"}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
        services={services.map((s) => ({ id: s.id, name: s.name.de, priceChf: s.priceChf, walkinChf: s.walkinPriceChf }))}
        products={products.map((p) => ({ id: p.id, name: p.name, priceChf: p.priceChf }))}
        // Termine von heute
        bookings={bookings.map((b) => ({
          id: b.id,
          time: toTimeKey(b.startsAt),
          serviceId: b.serviceId,
          label: `${b.serviceName} · ${b.customerName}`,
          billed: billed.has(b.id),
          staffId: b.staffId,
        }))}
      />
    </>
  );
}
