import { Inter, Inter_Tight, Instrument_Serif } from "next/font/google";

// Eine gemeinsame Quelle für alle Layouts: sonst landen doppelte @font-face-Regeln und
// zusätzliche Preloads (Instrument Serif) im gemeinsamen CSS jeder öffentlichen Seite.
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const display = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tight", display: "swap" });
// Nur für kursive Akzente, nie für den grössten Text: nicht vorladen
export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif-i", display: "swap", preload: false });
