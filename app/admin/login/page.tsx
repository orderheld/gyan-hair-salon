import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { getAdminText } from "@/lib/admin";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const { t } = await getAdminText();
  return (
    <main className="admin-login">
      <div className="login-card">
        <Wordmark className="login-mark" />
        <p className="muted small login-sub">{t.login.title}</p>
        <LoginForm labels={t.login} />
      </div>
    </main>
  );
}
