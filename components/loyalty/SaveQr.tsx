"use client";

import { useState } from "react";

/** QR-Code als Bild speichern (Fotos), damit er auch ohne Internet griffbereit ist */
export function SaveQr({ svg, label, fileName, title }: { svg: string; label: string; fileName: string; title: string }) {
  const [busy, setBusy] = useState(false);

  async function toPng(): Promise<Blob | null> {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = url; });
      const size = 900, pad = 90;
      const c = document.createElement("canvas");
      c.width = size; c.height = size + 110;
      const g = c.getContext("2d");
      if (!g) return null;
      g.fillStyle = "#fbf8f3"; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = "#ffffff"; g.fillRect(pad / 2, pad / 2, size - pad, size - pad);
      g.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
      g.fillStyle = "#141210"; g.font = "600 40px -apple-system, Segoe UI, Helvetica, Arial, sans-serif"; g.textAlign = "center";
      g.fillText(title, size / 2, size + 40);
      return await new Promise((r) => c.toBlob(r, "image/png"));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const blob = await toPng();
      if (!blob) return;
      const file = new File([blob], fileName, { type: "image/png" });
      // Handy: Teilen-Menü mit «Bild sichern»; sonst herunterladen
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title }).catch(() => {});
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-light btn-sm lc-save-qr" onClick={save} disabled={busy}>
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v10M8 10l4 4 4-4" /><path d="M5 17v2.5h14V17" /></svg>
      {label}
    </button>
  );
}
