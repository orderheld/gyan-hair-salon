import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { getAdminText } from "@/lib/admin";
import { getRole } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = (await searchParams).next ?? "";
  const next = /^\/(de|fr|en)(\/[\w-]*)*$/.test(raw) ? raw : undefined;
  const role = await getRole();
  if (role === "admin") redirect(next ?? "/admin");
  if (role === "kasse") redirect("/admin/kasse");
  const { t } = await getAdminText();
  return (
    <main className="admin-login">
      <div className="login-card">
        <Wordmark className="login-mark" />
        <p className="muted small login-sub">{t.login.title}</p>
        <LoginForm labels={t.login} next={next} />
      </div>
    </main>
  );
}
