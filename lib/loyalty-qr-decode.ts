// Ersatz-Decoder für Browser ohne BarcodeDetector (z. B. Safari auf dem iPhone).
// Wird im Scanner erst bei Bedarf geladen.
import jsQR from "jsqr";

/** QR-Code in einem RGBA-Bild suchen, gibt den Text oder null zurück */
export function decodeQrImage(data: Uint8ClampedArray, width: number, height: number): string | null {
  const result = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
  return result?.data ?? null;
}
