import { notFound } from "next/navigation";

import Editor from "@/components/Editor";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { requireAuth } from "@/lib/auth";
import { getItem } from "@/lib/repository";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditPostPage({ params, searchParams }: Props) {
  await requireAuth();
  const { id } = await params;
  const item = getItem(Number(id));
  if (!item) notFound();
  const { error } = await searchParams;
  const notice = error === "title" ? "A title is required." : undefined;

  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <span className="label muted">Editing</span>
          <h1 className="headline" style={{ margin: "0.25rem 0 1.5rem" }}>
            Edit post
          </h1>
          <Editor
            id={item.id}
            initialTitle={item.title}
            initialBody={item.body_markdown}
            initialAuthor={item.author}
            notice={notice}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
