import type { CustomerInfo } from "@/lib/customers";
import { REGULAR_FROM } from "@/lib/customers";
import { formatChf } from "@/lib/format";
import { fill, type AdminDict } from "@/lib/i18n";

/** Kleine Hinweise: Neukunde, Stammkunde, nicht gekommen, zu spät storniert, offen, gesperrt */
export function CustomerBadges({ c, t }: { c?: CustomerInfo; t: AdminDict }) {
  if (!c) return null;
  const b = t.bookings;
  return (
    <div className="cbadges">
      {c.visits === 0 ? (
        c.noShows === 0 && c.lateCancels === 0 && <span className="cb cb-new">{b.newCustomer}</span>
      ) : c.visits >= REGULAR_FROM ? (
        <span className="cb cb-regular">★ {b.regular} · {fill(b.visits, { n: c.visits })}</span>
      ) : (
        <span className="cb">{c.visits === 1 ? b.visitsOne : fill(b.visits, { n: c.visits })}</span>
      )}
      {c.noShows > 0 && <span className="cb cb-warn">{fill(b.noShows, { n: c.noShows })}</span>}
      {c.lateCancels > 0 && <span className="cb cb-warn">{fill(b.lateCancels, { n: c.lateCancels })}</span>}
      {c.openCount > 0 && <span className="cb cb-due">{fill(b.openFee, { amount: formatChf(c.openFees) })}</span>}
      {c.blocked && <span className="cb cb-block">{b.blocked}</span>}
      {c.consent && !c.noMarketing && <span className="cb cb-ok">{b.consent}</span>}
    </div>
  );
}

