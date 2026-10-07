"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { parseCardPayload } from "@/lib/loyalty-qr";

type Texts = { startCamera: string; stopCamera: string; cameraDenied: string; cameraMissing: string; cameraInsecure: string; scanning: string; found: string; notCard: string };

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = (new (opts: { formats: string[] }) => Detector) & { getSupportedFormats?: () => Promise<string[]> };

/**
 * Kamera-Scanner für den QR-Code der Stempelkarte.
 * Nutzt den BarcodeDetector des Browsers (Android/Chrome); wo er fehlt (iPhone/Safari), wird jsQR nachgeladen.
 */
export function QrScanner({ t }: { t: Texts }) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const [state, setState] = useState<"idle" | "scanning" | "found">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function stop() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => stop, []);

  async function start() {
    setMessage(null);
    if (!window.isSecureContext) return setMessage(t.cameraInsecure);
    if (!navigator.mediaDevices?.getUserMedia) return setMessage(t.cameraMissing);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    } catch (e) {
      const name = (e as { name?: string }).name;
      return setMessage(name === "NotFoundError" || name === "OverconstrainedError" ? t.cameraMissing : t.cameraDenied);
    }
    const v = video.current!;
    v.srcObject = stream.current;
    await v.play().catch(() => {});
    setState("scanning");

    // Erkennung wählen: eingebaut, sonst jsQR
    const Ctor = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    let detector: Detector | null = null;
    if (Ctor) {
      const formats = (await Ctor.getSupportedFormats?.().catch(() => [])) ?? [];
      if (formats.includes("qr_code")) detector = new Ctor({ formats: ["qr_code"] });
    }
    const decode = detector ? null : (await import("@/lib/loyalty-qr-decode")).decodeQrImage;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let lastWrong = 0;
    const tick = async () => {
      if (!stream.current) return;
      let text: string | null = null;
      try {
        if (v.readyState >= 2 && v.videoWidth) {
          if (detector) {
            text = (await detector.detect(v))[0]?.rawValue ?? null;
          } else if (decode && ctx) {
            const scale = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
            canvas.width = Math.round(v.videoWidth * scale);
            canvas.height = Math.round(v.videoHeight * scale);
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            text = decode(img.data, img.width, img.height);
          }
        }
      } catch {
        // einzelnes Bild nicht lesbar: weiter
      }
      if (text) {
        const token = parseCardPayload(text);
        if (token) {
          navigator.vibrate?.(60);
          setState("found");
          stop();
          router.push(`/admin/stempel/karte/${encodeURIComponent(token)}`);
          return;
        }
        if (Date.now() - lastWrong > 2500) {
          lastWrong = Date.now();
          setMessage(t.notCard);
        }
      }
      timer.current = window.setTimeout(tick, detector ? 120 : 200);
    };
    tick();
  }

  return (
    <div className="lc-scanner">
      <div className={`lc-video${state === "scanning" ? " is-on" : ""}`}>
        <video ref={video} playsInline muted aria-hidden />
        {state === "scanning" && <span className="lc-frame" aria-hidden />}
      </div>
      <p className="muted small" role="status" aria-live="polite">
        {state === "found" ? t.found : message ?? (state === "scanning" ? t.scanning : "")}
      </p>
      {state === "scanning" ? (
        <button type="button" className="btn btn-light" onClick={() => { stop(); setState("idle"); }}>{t.stopCamera}</button>
      ) : (
        <button type="button" className="btn btn-dark lc-scan-btn" onClick={start} disabled={state === "found"}>
          <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16" /></svg>
          {t.startCamera}
        </button>
      )}
    </div>
  );
}
