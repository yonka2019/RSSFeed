"use client";

import { useState } from "react";

import { saveDispatch } from "@/app/admin/actions";

import Icon from "./Icon";

export default function Editor({
  id,
  initialTitle = "",
  initialBody = "",
  initialAuthor = "",
  notice,
}: {
  id?: number;
  initialTitle?: string;
  initialBody?: string;
  initialAuthor?: string;
  notice?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [author, setAuthor] = useState(initialAuthor);

  return (
    <form className="editor" action={saveDispatch}>
      {id ? <input type="hidden" name="id" value={id} /> : null}

      {notice ? (
        <div className="form-error">
          <Icon name="unpublish" />
          {notice}
        </div>
      ) : null}

      <label className="field">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder=" "
          dir="auto"
          autoFocus
          required
        />
        <span className="field-label">Title</span>
      </label>

      <label className="field">
        <input
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder=" "
          dir="auto"
        />
        <span className="field-label">Author</span>
      </label>

      <label className="field">
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder=" "
          dir="auto"
        />
        <span className="field-label">Body — plain text</span>
      </label>

      <div className="editor-actions">
        <a className="btn btn-text" href="/admin">
          Cancel
        </a>
        <span className="spacer" />
        <button className="btn btn-tonal" name="intent" value="draft" type="submit">
          Save draft
        </button>
        <button
          className="btn btn-filled"
          name="intent"
          value="publish"
          type="submit"
        >
          <Icon name="send" />
          Publish
        </button>
      </div>
    </form>
  );
}
