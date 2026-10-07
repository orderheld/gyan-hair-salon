import "server-only";
import { site } from "@/content/site";
import { cache } from "react";
import type { Locale } from "@/content/types";
import { getSql } from "./db";

export const EMAIL_TYPES = ["confirmation", "reminder", "followup", "cancellation", "cancellationBySalon", "adminNotify"] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];
export type EmailTemplate = { subject: string; heading: string; body: string };

export type Settings = {
  slotStepMin: number;
  minNoticeMin: number;
  horizonDays: number;
  bufferMin: number;
  cancelNoticeHours: number;
  reminderHoursBefore: number;
  followupHoursAfter: number;
  reviewUrl: string;
  instagramUrl: string;
  notifyEmail: string;
  emailEnabled: Record<EmailType, boolean>;
  /** Eigene Texte aus dem Admin. Fehlt ein Text, gilt der Standardtext aus lib/i18n/dict. */
  emailTemplates: Partial<Record<EmailType, Partial<Record<Locale, EmailTemplate>>>>;
};

export const DEFAULT_SETTINGS: Settings = {
  slotStepMin: 15,
  minNoticeMin: 60,
  horizonDays: 60,
  bufferMin: 0,
  cancelNoticeHours: 12,
  reminderHoursBefore: 3,
  followupHoursAfter: 5,
  reviewUrl: site.googleWriteReviewUrl,
  instagramUrl: "https://www.instagram.com/gyan_hair_salon/",
  notifyEmail: process.env.SALON_NOTIFY_EMAIL || site.email,
  emailEnabled: {
    confirmation: true,
    reminder: true,
    followup: true,
    cancellation: true,
    cancellationBySalon: true,
    adminNotify: true,
  },
  emailTemplates: {},
};

export const SLOT_STEPS = [5, 10, 15, 20, 30, 45, 60];

/** Alle Einstellungen (pro Anfrage einmal geladen). */
export const getSettings = cache(async (): Promise<Settings> => {
  const sql = await getSql();
  const rows = await sql`SELECT key, value FROM settings`;
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    notifyEmail: stored.notifyEmail || DEFAULT_SETTINGS.notifyEmail,
    // alter Platzhalter aus früheren Versionen → echter Link
    reviewUrl: !stored.reviewUrl || String(stored.reviewUrl).includes("PLATZHALTER") ? DEFAULT_SETTINGS.reviewUrl : stored.reviewUrl,
    emailEnabled: { ...DEFAULT_SETTINGS.emailEnabled, ...(stored.emailEnabled ?? {}) },
    emailTemplates: stored.emailTemplates ?? {},
  };
});

export async function saveSettings(values: Partial<Settings>) {
  const sql = await getSql();
  for (const [key, value] of Object.entries(values)) {
    await sql`
      INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  }
}
