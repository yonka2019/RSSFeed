"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { saveDispatch } from "@/app/admin/actions";

import Icon from "./Icon";

export default function Editor({
  id,
  initialTitle = "",
  initialBody = "",
  initialAuthor = "",
  initialLabel = "",
  initialPriority = "normal",
  allLabels = [],
  notice,
}: {
  id?: string;
  initialTitle?: string;
  initialBody?: string;
  initialAuthor?: string;
  initialLabel?: string;
  initialPriority?: string;
  allLabels?: string[];
  notice?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [author, setAuthor] = useState(initialAuthor);
  const [label, setLabel] = useState(initialLabel);
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelActive, setLabelActive] = useState(-1);
  const labelRef = useRef<HTMLInputElement>(null);

  // Suggest already-used labels for the label currently being typed (the text
  // after the last comma), skipping ones already on this post.
  const labelParts = label.split(",");
  const labelToken = labelParts[labelParts.length - 1].trim().toLowerCase();
  const labelChosen = new Set(
    labelParts
      .slice(0, -1)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const labelSuggestions = allLabels
    .filter(
      (l) =>
        !labelChosen.has(l.toLowerCase()) &&
        l.toLowerCase() !== labelToken &&
        (labelToken === "" || l.toLowerCase().includes(labelToken)),
    )
    .slice(0, 8);

  function chooseLabel(value: string) {
    const head = labelParts
      .slice(0, -1)
      .map((s) => s.trim())
      .filter(Boolean);
    setLabel([...head, value].join(", ") + ", ");
    setLabelOpen(false);
    setLabelActive(-1);
    labelRef.current?.focus();
  }

  function onLabelKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!labelOpen || labelSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLabelActive((i) => (i + 1) % labelSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLabelActive((i) => (i <= 0 ? labelSuggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && labelActive >= 0) {
      e.preventDefault();
      chooseLabel(labelSuggestions[labelActive]);
    } else if (e.key === "Escape") {
      setLabelOpen(false);
      setLabelActive(-1);
    }
  }

  return (
    <form className="editor" action={saveDispatch}>
      {id ? <input type="hidden" name="id" value={id} /> : null}

      {notice ? (
        <div className="form-error">
          <Icon name="error" />
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

      <div className="field-combobox">
        <label className="field">
          <input
            ref={labelRef}
            name="label"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setLabelOpen(true);
              setLabelActive(-1);
            }}
            onFocus={() => setLabelOpen(true)}
            onBlur={() => window.setTimeout(() => setLabelOpen(false), 120)}
            onKeyDown={onLabelKeyDown}
            placeholder=" "
            dir="auto"
            role="combobox"
            aria-expanded={labelOpen && labelSuggestions.length > 0}
            aria-autocomplete="list"
            autoComplete="off"
          />
          <span className="field-label">Labels — comma-separated</span>
        </label>
        {labelOpen && labelSuggestions.length > 0 && (
          <ul className="suggestions" role="listbox">
            {labelSuggestions.map((l, i) => (
              <li
                key={l}
                role="option"
                aria-selected={i === labelActive}
                className={`suggestion${i === labelActive ? " is-active" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  chooseLabel(l);
                }}
              >
                {l}
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="checkbox checkbox-danger">
        <input
          type="checkbox"
          name="priority"
          value="high"
          defaultChecked={initialPriority === "high"}
        />
        <span>Important</span>
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
