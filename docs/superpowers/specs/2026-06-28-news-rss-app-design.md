# News + RSS Publishing App — Design

Date: 2026-06-28

## Overview
A small, self-contained web app. A single admin logs in to write news items in
Markdown (draft → publish, edit, delete). Published items appear on a plain public
homepage, each with its own permalink page, and are served as RSS 2.0, Atom 1.0,
and JSON feeds for other services to fetch (notably Grafana's News panel and
Confluence's RSS macro, both of which read standard RSS/Atom).

## Tech stack
- **Flask** + Jinja2 server-rendered templates (no JS framework).
- **markdown** for Markdown → HTML; **bleach** to sanitize the rendered HTML.
- Feeds generated with the standard library `xml.etree.ElementTree` (RSS, Atom)
  and `json` (JSON Feed) — no compiled dependencies (works on Python 3.14).
- **SQLite** via stdlib `sqlite3`.
- **pytest** + **feedparser** for tests.

## UI approach ("non-AI generic UI")
Conventional, plain server-rendered pages with one small hand-written
`static/style.css`: system fonts, single max-width column, standard form
controls, no gradients/animations/hero sections. Looks like a normal internal tool.

## Data model — table `news_item`
| field | purpose |
|---|---|
| `id` | PK, used in permalink `/news/<id>` |
| `title` | item title |
| `body_markdown` | source of truth (for editing) |
| `body_html` | rendered + sanitized at save time (for display/feeds) |
| `status` | `draft` or `published` (only `published` reaches feeds/public) |
| `created_at`, `updated_at`, `published_at` | ISO-8601 UTC; `published_at` is the feed date |

## Routes
- Public: `/` (list published), `/news/<id>` (permalink; 404 if draft/missing).
- Feeds: `/feed/rss.xml`, `/feed/atom.xml`, `/feed/feed.json` — correct
  `Content-Type` + `Access-Control-Allow-Origin: *` (Grafana News panel). Homepage
  `<head>` includes feed autodiscovery `<link>` tags.
- Admin (login required): `/admin/login`, `/admin/logout`, `/admin` (dashboard),
  `/admin/new`, `/admin/<id>/edit`, and POST actions publish/unpublish/delete.

## Auth
Single admin. Password from `ADMIN_PASSWORD` env var, hashed with Werkzeug
(pbkdf2). Flask signed-cookie session + `@login_required` decorator. Feeds and
permalinks stay public.

## Config (env vars)
`SECRET_KEY`, `ADMIN_PASSWORD`, and feed metadata `SITE_TITLE`,
`SITE_DESCRIPTION`, `SITE_URL`, `SITE_AUTHOR` (dev defaults documented in README).

## Module structure
```
app.py          # app factory, wires blueprints + context processor + 404
config.py       # env-based config
db.py           # sqlite connection + schema init
repository.py   # news_item CRUD (only module that touches SQL)
content.py      # markdown render + sanitize
feeds.py        # pure RSS / Atom / JSON builders (unit-testable)
feed_views.py   # feed blueprint (calls feeds.py, sets headers)
public.py       # public blueprint (index, permalink)
admin.py        # admin blueprint (CRUD)
auth.py         # auth blueprint (login/logout) + login_required
templates/ , static/style.css , schema.sql , requirements.txt , README.md
```

## Error handling & edge cases
404 page for missing/draft permalinks; feeds stay valid when empty; empty-state
messages on homepage/dashboard; login-failure message; drafts never leak into
feeds or public pages.

## Testing
Repository CRUD; feeds contain only published items, parse cleanly via feedparser,
and carry correct content-type + CORS header; auth redirects when logged out and
works when logged in; Markdown renders (`**bold**` → `<strong>`) and `<script>` is
stripped; permalink 200 for published / 404 for draft.

## Known limitations (acceptable for a single-admin internal tool)
- No CSRF tokens on admin forms (trusted single user, local use).
- Single shared admin password (no multi-user accounts).
