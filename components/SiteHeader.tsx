import { logoutAction } from "@/app/admin/actions";
import { isAuthed } from "@/lib/auth";
import { config } from "@/lib/config";

export default async function SiteHeader() {
  const authed = await isAuthed();

  return (
    <header className="appbar">
      <div className="appbar-inner">
        <a className="appbar-brand" href="/">
          <svg className="appbar-logo" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#4a56c0" />
            <circle cx="11" cy="21" r="2.6" fill="#fff" />
            <path
              d="M9 14.5a8.5 8.5 0 0 1 8.5 8.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M9 9a14 14 0 0 1 14 14"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="appbar-title">{config.siteTitle}</span>
        </a>

        <div className="appbar-actions">
          {authed ? (
            <>
              <a className="nav-link" href="/admin">Desk</a>
              <form className="inline-form" action={logoutAction}>
                <button className="nav-link" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <a className="nav-link" href="/admin/login">Desk</a>
          )}
        </div>
      </div>
    </header>
  );
}
