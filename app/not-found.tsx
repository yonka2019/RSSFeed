import Icon from "@/components/Icon";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <div className="empty">
            <div className="empty-icon">
              <Icon name="inbox" />
            </div>
            <div className="empty-title">Page not found</div>
            <p className="empty-note">
              This page doesn&rsquo;t exist or the post isn&rsquo;t published.
            </p>
            <p style={{ marginTop: "1.5rem" }}>
              <a className="btn btn-tonal" href="/">
                <Icon name="back" /> Back to home
              </a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
