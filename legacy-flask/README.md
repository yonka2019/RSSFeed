# Newsroom — News + RSS

A small Flask app for writing news and serving it as feeds. A single admin logs
in, writes items in Markdown (draft → publish, edit, delete). Published items
appear on a plain public site and are served as **RSS 2.0**, **Atom 1.0**, and
**JSON Feed** for other services to fetch (e.g. Grafana's News panel and
Confluence's RSS macro).

## Requirements
- Python 3.10+ (developed/tested on 3.14)

## Setup

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Then open <http://localhost:5000>. The admin area is at
<http://localhost:5000/admin/login>.

Default dev admin password is `admin` — **change it** before any real use (see
configuration below).

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `admin` | Password for the admin login |
| `SECRET_KEY` | `dev-secret-change-me` | Flask session signing key |
| `DATABASE` | `news.db` | SQLite file path |
| `SITE_TITLE` | `Newsroom` | Feed/site title |
| `SITE_DESCRIPTION` | `Latest news and updates` | Feed/site description |
| `SITE_URL` | `http://localhost:5000` | Public base URL (used in feed/item links) |
| `SITE_AUTHOR` | `Editor` | Feed author name |

Set `SITE_URL` to the real public URL when deploying, so feed item links resolve
correctly for consumers.

Example (PowerShell):

```powershell
$env:ADMIN_PASSWORD = "a-strong-password"
$env:SECRET_KEY = "some-long-random-string"
$env:SITE_URL = "https://news.example.com"
python app.py
```

## Feed URLs

- RSS 2.0: `/feed/rss.xml`
- Atom 1.0: `/feed/atom.xml`
- JSON Feed: `/feed/feed.json`

Feeds include only **published** items and send `Access-Control-Allow-Origin: *`
so browser-side fetchers (like Grafana's News panel) can read them.

### Grafana
Add a **News** panel and set the URL to `https://<your-host>/feed/rss.xml`.

### Confluence
Use the **RSS Feed** macro and point it at the same RSS URL.

## Tests

```bash
pip install -r requirements.txt
pytest
```

## Project layout

```
app.py          # app factory, blueprint wiring, 404 handler
config.py       # configuration from environment variables
db.py           # SQLite connection + schema init
repository.py   # news_item CRUD (only module that touches SQL)
content.py      # Markdown -> sanitized HTML
feeds.py        # RSS / Atom / JSON feed builders (pure functions)
feed_views.py   # feed endpoints
public.py       # homepage + permalink
admin.py        # admin CRUD
auth.py         # login/logout + login_required
templates/      # Jinja2 templates
static/style.css
schema.sql
tests/
```

## Notes / limitations
- Single shared admin password (no multi-user accounts).
- Admin forms have no CSRF tokens — intended for a trusted single user. Add
  Flask-WTF CSRF protection if exposing the admin area more broadly.
