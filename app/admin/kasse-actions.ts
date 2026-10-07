"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminText } from "@/lib/admin";
import { checkPassword, requireAdmin, requireKasse, setKassePassword } from "@/lib/auth";
import { createSale, deleteProduct, getStaff, PAYMENTS, PosError, saveProduct, saveStaff, stornoSale, type CartLine, type Payment } from "@/lib/pos";
import { saveSettings } from "@/lib/settings";

const str = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const num = (fd: FormData, key: string) => Number(String(fd.get(key) ?? "").replace(",", "."));
const back = (path: string, msg: string, type: "ok" | "error" = "ok"): never => {
  const [base, hash] = path.split("#");
  redirect(`${base}${base.includes("?") ? "&" : "?"}${type}=${encodeURIComponent(msg)}${hash ? `#${hash}` : ""}`);
};

export type CheckoutInput = { staffId: string; payment: Payment; lines: CartLine[]; givenChf: number | null; bookingId: string | null; note: string };

/** Kassieren (Admin und Kassen-Login). Gibt die Belegnummer oder einen Fehlertext zurück. */
export async function posCheckout(input: CheckoutInput): Promise<{ no?: number; error?: string }> {
  await requireKasse();
  const { t } = await getAdminText();
  const e = t.kasse.errors;
  if (!input || !Array.isArray(input.lines) || !input.lines.length) return { error: e.empty };
  if (!PAYMENTS.includes(input.payment)) return { error: e.payment };
  try {
    const sale = await createSale({
      staffId: String(input.staffId ?? ""),
      payment: input.payment,
      lines: input.lines.slice(0, 40),
      givenChf: input.givenChf === null || input.givenChf === undefined ? null : Number(input.givenChf),
      bookingId: input.bookingId ? String(input.bookingId) : null,
      note: String(input.note ?? ""),
    });
    revalidatePath("/admin/kasse", "layout");
    return { no: sale.no };
  } catch (error) {
    if (error instanceof PosError) {
      const key = error.message as keyof typeof e;
      return { error: typeof e[key] === "string" ? e[key] : e.generic };
    }
    console.error("Kasse:", error);
    return { error: e.generic };
  }
}

export async function posStorno(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const no = Number(fd.get("no"));
  const reason = str(fd, "reason");
  const path = `/admin/kasse/beleg/${no}`;
  if (reason.length < 2) back(path, t.common.checkInput, "error");
  let stornoNo = 0;
  try {
    stornoNo = (await stornoSale(no, reason)).no;
  } catch (error) {
    back(path, error instanceof PosError && error.message === "storno" ? t.kasse.errors.storno : t.kasse.errors.generic, "error");
  }
  revalidatePath("/admin/kasse", "layout");
  back(`/admin/kasse/beleg/${stornoNo}`, t.kasse.stornoDone);
}

export async function posSaveStaff(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const staff = await getStaff({ includeInactive: true });
  await saveStaff(
    staff.map((s) => ({ id: s.id, name: str(fd, `name_${s.id}`, 40) || s.name, active: fd.get(`active_${s.id}`) === "on" })),
  );
  revalidatePath("/admin/kasse", "layout");
  back("/admin/kasse/einstellungen", t.common.saved);
}

export async function posSaveProduct(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = Number(fd.get("id")) || undefined;
  const name = str(fd, "name", 80);
  const price = num(fd, "price");
  if (name.length < 2 || !Number.isFinite(price) || price < 0 || price > 5000) back("/admin/kasse/einstellungen#produkte", t.common.checkInput, "error");
  await saveProduct({ id, name, priceChf: Math.round(price * 100) / 100, active: id ? fd.get("active") === "on" : true, sort: Number(fd.get("sort")) || 0 });
  revalidatePath("/admin/kasse", "layout");
  back("/admin/kasse/einstellungen#produkte", t.common.saved);
}

export async function posDeleteProduct(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  await deleteProduct(Number(fd.get("id")));
  revalidatePath("/admin/kasse", "layout");
  back("/admin/kasse/einstellungen#produkte", t.common.saved);
}

export async function posSaveVat(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const rate = num(fd, "vatRate");
  if (!Number.isFinite(rate) || rate < 0 || rate > 30) back("/admin/kasse/einstellungen#mwst", t.common.checkInput, "error");
  await saveSettings({ vatNumber: str(fd, "vatNumber", 40), vatRate: Math.round(rate * 100) / 100 });
  back("/admin/kasse/einstellungen#mwst", t.common.saved);
}

export async function posSaveKassePassword(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const path = "/admin/kasse/einstellungen#login";
  if (fd.get("off") === "1") {
    await setKassePassword("");
    back(path, t.common.saved);
  }
  const password = String(fd.get("password") ?? "");
  if (password.length < 6 || password.length > 100 || checkPassword(password)) back(path, t.kasse.kassePasswordShort, "error");
  await setKassePassword(password);
  back(path, t.common.saved);
}
