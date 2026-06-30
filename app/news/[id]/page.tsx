import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Icon from "@/components/Icon";
import LocalTime from "@/components/LocalTime";
import NewsTicker from "@/components/NewsTicker";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { labelStyle, parseLabels } from "@/lib/format";
import {
  ensureLabelColors,
  getLabelColors,
  getPublishedItem,
} from "@/lib/repository";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublishedItem(id);
  return item ? { title: item.title } : {};
}

export default async function ArticlePage({ params }: Params) {
  const { id } = await params;
  const item = await getPublishedItem(id);
  if (!item) notFound();

  const tags = parseLabels(item.label);
  await ensureLabelColors(tags);
  const labelColors = await getLabelColors();

  return (
    <div className="shell">
      <SiteHeader />
      <NewsTicker />
      <main className="main">
        <div className="page">
          <article className="article">
            <a className="btn btn-text" href="/" style={{ paddingLeft: 0 }}>
              <Icon name="back" /> Back
            </a>
            <div className="article-meta" style={{ marginTop: "1rem" }}>
              {item.author ? (
                <>
                  <span dir="auto">{item.author}</span>
                  <span className="muted">·</span>
                </>
              ) : null}
              <span className="label muted">
                <LocalTime
                  iso={item.published_at ?? item.created_at}
                  mode="datetime"
                />
              </span>
              {item.priority === "high" && (
                <span className="prio prio-high">Important</span>
              )}
              {tags.length > 0 && (
                <span className="feed-tags">
                  {tags.map((l) => (
                    <span
                      key={l}
                      className="tag"
                      style={labelStyle(labelColors[l])}
                      dir="auto"
                    >
                      {l}
                    </span>
                  ))}
                </span>
              )}
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
