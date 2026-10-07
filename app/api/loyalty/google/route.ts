import { googleSaveUrl, googleWalletEnabled } from "@/lib/wallet";
import { customerCard } from "../card";

export const dynamic = "force-dynamic";

/** Google Wallet: weiter zum «Speichern»-Link mit signiertem JWT (nur wenn eingerichtet) */
export async function GET(request: Request) {
  if (!googleWalletEnabled()) return new Response("Not found", { status: 404 });
  const result = await customerCard(request);
  if (result instanceof Response) return result;
  const url = googleSaveUrl(result.state, result.locale);
  if (!url) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
}
