"use client";

import { useState } from "react";

type Props = { svg: string; label: string; fileName: string; title: string; name: string; hint: string; address: string };

const load = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** QR-Code als schöne Karte (Bild) speichern, damit er auch ohne Internet in den Fotos griffbereit ist */
export function SaveQr({ svg, label, fileName, title, name, hint, address }: Props) {
  const [busy, setBusy] = useState(false);

  async function toPng(): Promise<Blob | null> {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const [qr, logo] = await Promise.all([load(url), load("/brand/logo-email.png").catch(() => null)]);
      const W = 1080, H = 1500;
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const g = c.getContext("2d");
      if (!g) return null;
      const font = (w: number, px: number) => `${w} ${px}px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`;
      // Hintergrund und Karte
      g.fillStyle = "#f3ece1"; g.fillRect(0, 0, W, H);
      g.save();
      g.shadowColor = "rgba(20,18,16,0.10)"; g.shadowBlur = 50; g.shadowOffsetY = 18;
      roundRect(g, 70, 70, W - 140, H - 140, 56); g.fillStyle = "#fffdf9"; g.fill();
      g.restore();
      g.save(); roundRect(g, 70, 70, W - 140, H - 140, 56); g.clip(); g.fillStyle = "#6b5b4b"; g.fillRect(70, 70, W - 140, 10); g.restore();
      g.textAlign = "center";
      // Logo
      if (logo) { const lw = 320, lh = (logo.height / logo.width) * lw; g.drawImage(logo, (W - lw) / 2, 170, lw, lh); }
      else { g.fillStyle = "#141210"; g.font = font(600, 84); g.fillText("GYAN", W / 2, 250); }
      g.fillStyle = "#8a8176"; g.font = font(500, 24);
      g.fillText("H A I R   S A L O N   ·   B I E L / B I E N N E", W / 2, 320);
      // Titel und Name
      g.fillStyle = "#141210"; g.font = font(600, 68); g.fillText(title, W / 2, 440);
      if (name) { g.fillStyle = "#5d554c"; g.font = font(400, 38); g.fillText(name, W / 2, 500); }
      // QR in weissem Feld
      const box = 600, bx = (W - box) / 2, by = 560;
      roundRect(g, bx, by, box, box, 40); g.fillStyle = "#ffffff"; g.fill();
      g.lineWidth = 3; g.strokeStyle = "#e7dfd2"; g.stroke();
      g.drawImage(qr, bx + 50, by + 50, box - 100, box - 100);
      // Hinweis und Adresse
      g.fillStyle = "#5d554c"; g.font = font(400, 34); g.fillText(hint, W / 2, by + box + 90);
      g.fillStyle = "#e7dfd2"; g.fillRect(W / 2 - 60, by + box + 140, 120, 3);
      g.fillStyle = "#8a8176"; g.font = font(400, 28); g.fillText(address, W / 2, by + box + 200);
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
