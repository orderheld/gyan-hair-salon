import { SubmitButton } from "@/components/admin/ConfirmButton";
import { loyaltySetPublic } from "@/app/admin/loyalty-actions";

type Texts = { liveOn: string; liveOff: string; liveOnHint: string; liveOffHint: string; turnOn: string; turnOff: string };

/** Ein Schalter: Stempelkarte für Kunden ein- oder ausblenden */
export function LoyaltyLiveSwitch({ on, back, t, pending }: { on: boolean; back: string; t: Texts; pending: string }) {
  return (
    <form action={loyaltySetPublic} className={`panel lc-live${on ? " is-on" : ""}`}>
      <input type="hidden" name="on" value={on ? "0" : "1"} />
      <input type="hidden" name="back" value={back} />
      <div className="lc-live-text">
        <strong><i aria-hidden />{on ? t.liveOn : t.liveOff}</strong>
        <p className="muted small">{on ? t.liveOnHint : t.liveOffHint}</p>
      </div>
      <SubmitButton pendingLabel={pending} className={on ? "btn btn-light" : "btn btn-dark"}>{on ? t.turnOff : t.turnOn}</SubmitButton>
    </form>
  );
}
