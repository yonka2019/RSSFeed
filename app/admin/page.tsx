import {
  deleteAction,
  publishAction,
  unpublishAction,
} from "@/app/admin/actions";
import Icon from "@/components/Icon";
import LocalTime from "@/components/LocalTime";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { requireAuth } from "@/lib/auth";
import { listAll } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function DeskPage() {
  await requireAuth();
  const items = await listAll();

  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <div className="page-head">
            <div>
              <span className="label muted">Editor</span>
              <h1 className="headline">Manage posts</h1>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <Icon name="inbox" />
              </div>
              <div className="empty-title">No posts yet</div>
              <p className="empty-note">Create your first post to get started.</p>
            </div>
          ) : (
            <div className="list">
              {items.map((item) => (
                <div key={item.id} className="list-item">
                  <div className="list-main">
                    <div className="list-title" dir="auto">{item.title}</div>
                    <div className="list-sub">
                      {item.status === "published" ? (
                        <span className="chip chip-live">
                          <span className="chip-dot" />
                          Published
                        </span>
                      ) : (
                        <span className="chip">Draft</span>
                      )}
                      {item.author ? <span dir="auto">{item.author}</span> : null}
                      <LocalTime iso={item.updated_at} mode="datetime" />
                    </div>
                  </div>
                  <div className="list-actions">
                    <a
                      className="icon-btn"
                      href={`/admin/${item.id}/edit`}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Icon name="edit" />
                    </a>
                    {item.status === "published" ? (
                      <>
                        <a
                          className="icon-btn"
                          href={`/news/${item.id}`}
                          aria-label="View"
                          title="View"
                        >
                          <Icon name="open" />
                        </a>
                        <form
                          className="inline-form"
                          action={unpublishAction.bind(null, item.id)}
                        >
                          <button
                            className="icon-btn"
                            type="submit"
                            aria-label="Unpublish"
                            title="Unpublish"
                          >
                            <Icon name="eyeOff" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <form
                        className="inline-form"
                        action={publishAction.bind(null, item.id)}
                      >
                        <button
                          className="icon-btn"
                          type="submit"
                          aria-label="Publish"
                          title="Publish"
                        >
                          <Icon name="send" />
                        </button>
                      </form>
                    )}
                    <form
                      className="inline-form"
                      action={deleteAction.bind(null, item.id)}
                    >
                      <button
                        className="icon-btn danger"
                        type="submit"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Icon name="delete" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <a className="fab" href="/admin/new">
        <Icon name="add" /> New post
      </a>
      <SiteFooter />
    </div>
  );
}
