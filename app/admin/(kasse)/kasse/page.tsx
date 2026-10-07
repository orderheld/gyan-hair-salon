import { KasseNav } from "@/components/admin/KasseNav";
import { PosTerminal } from "@/components/admin/PosTerminal";
import { getAdminText } from "@/lib/admin";
import { requireKasse } from "@/lib/auth";
import { getBookingsBetween, getServices } from "@/lib/data";
import { billedBookingIds, getProducts, getStaff } from "@/lib/pos";
import { addDays, toDateKey, toTimeKey, zurichToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Kasse() {
  await requireKasse();
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
