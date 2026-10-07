import { appleWalletEnabled, applePass } from "@/lib/wallet";
import { customerCard } from "../card";

export const dynamic = "force-dynamic";

/** Apple Wallet: .pkpass der eigenen Stempelkarte (nur wenn eingerichtet) */
export async function GET(request: Request) {
  if (!appleWalletEnabled()) return new Response("Not found", { status: 404 });
  const result = await customerCard(request);
  if (result instanceof Response) return result;
  try {
    const pass = await applePass(result.state, result.locale, new URL(request.url).origin);
    return new Response(new Uint8Array(pass), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="gyan-stempelkarte.pkpass"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[GYAN] Apple Wallet:", e instanceof Error ? e.message : e);
    return new Response("Wallet error", { status: 500 });
  }
}
