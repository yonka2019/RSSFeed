import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Icon from "@/components/Icon";
import LocalTime from "@/components/LocalTime";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getPublishedItem } from "@/lib/repository";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = getPublishedItem(Number(id));
  return item ? { title: item.title } : {};
}

export default async function ArticlePage({ params }: Params) {
  const { id } = await params;
  const item = getPublishedItem(Number(id));
  if (!item) notFound();

  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <article className="article">
            <a className="btn btn-text" href="/" style={{ paddingLeft: 0 }}>
              <Icon name="back" /> Back
            </a>
            <div className="article-meta" style={{ marginTop: "1rem" }}>
              {item.author ? (
                <>
                  <span dir="auto">By {item.author}</span>
                  <span className="muted">·</span>
                </>
              ) : null}
              <span className="label muted">
                <LocalTime
                  iso={item.published_at ?? item.created_at}
                  mode="datetime"
                />
              </span>
            </div>
            <h1 className="article-title" dir="auto">
              {item.title}
            </h1>
            <div
              className="article-body"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: item.body_html }}
            />
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
