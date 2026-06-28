import { redirect } from "next/navigation";

import { loginAction } from "@/app/admin/actions";
import Icon from "@/components/Icon";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { isAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (await isAuthed()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <div className="login">
            <div className="login-icon">
              <Icon name="lock" />
            </div>
            <h1>Sign in</h1>
            <p>Enter the editor password to manage posts.</p>
            {error ? (
              <div className="form-error">
                <Icon name="unpublish" />
                That password didn&rsquo;t match. Try again.
              </div>
            ) : null}
            <form action={loginAction}>
              <label className="field" style={{ marginBottom: "1.5rem" }}>
                <input
                  type="password"
                  name="password"
                  placeholder=" "
                  autoFocus
                  required
                />
                <span className="field-label">Password</span>
              </label>
              <button
                className="btn btn-filled"
                type="submit"
                style={{ width: "100%" }}
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
