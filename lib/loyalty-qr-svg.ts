import "server-only";
import QRCode from "qrcode";
import { cardQrPayload } from "./loyalty-qr";

/** QR-Code der Karte als SVG (auf dem Server erzeugt, kein JavaScript im Browser nötig) */
export function cardQrSvg(token: string): Promise<string> {
  return QRCode.toString(cardQrPayload(token), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#141210", light: "#ffffff" },
  });
}
