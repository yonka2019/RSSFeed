import feedparser

from content import render_markdown


# --- content rendering / sanitization -------------------------------------

def test_markdown_renders_bold():
    html = render_markdown("This is **bold** text")
    assert "<strong>bold</strong>" in html


def test_markdown_strips_script():
    html = render_markdown("Hello <script>alert('x')</script> world")
    assert "<script>" not in html
    assert "alert" not in html or "<script>" not in html
    assert "Hello" in html


# --- public pages ----------------------------------------------------------

def test_empty_homepage(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"No news has been published yet." in resp.data


def test_missing_permalink_404(client):
    assert client.get("/news/999").status_code == 404


# --- auth ------------------------------------------------------------------

def test_admin_requires_login(client):
    resp = client.get("/admin/")
    assert resp.status_code == 302
    assert "/admin/login" in resp.headers["Location"]


def test_login_wrong_password(client):
    resp = client.post("/admin/login", data={"password": "nope"})
    assert b"Incorrect password." in resp.data


def test_login_success(auth_client):
    resp = auth_client.get("/admin/")
    assert resp.status_code == 200
    assert b"Manage news" in resp.data


# --- create / publish lifecycle -------------------------------------------

def test_draft_not_public_and_not_in_feed(auth_client):
    auth_client.post(
        "/admin/new", data={"title": "Draft item", "body": "hi", "action": "save_draft"}
    )
    # Not on homepage
    assert b"Draft item" not in auth_client.get("/").data
    # Not in RSS
    assert b"Draft item" not in auth_client.get("/feed/rss.xml").data
    # Permalink (id 1) should 404 while it is a draft
    assert auth_client.get("/news/1").status_code == 404


def test_publish_appears_everywhere(auth_client):
    auth_client.post(
        "/admin/new",
        data={"title": "Big News", "body": "**Hello** world", "action": "publish"},
    )
    # Homepage
    assert b"Big News" in auth_client.get("/").data
    # Permalink renders HTML
    item_page = auth_client.get("/news/1")
    assert item_page.status_code == 200
    assert b"<strong>Hello</strong>" in item_page.data
    # RSS contains it
    assert b"Big News" in auth_client.get("/feed/rss.xml").data


def test_edit_and_delete(auth_client):
    auth_client.post(
        "/admin/new", data={"title": "Orig", "body": "x", "action": "publish"}
    )
    auth_client.post(
        "/admin/1/edit", data={"title": "Edited", "body": "y", "action": "publish"}
    )
    assert b"Edited" in auth_client.get("/").data
    auth_client.post("/admin/1/delete")
    assert b"Edited" not in auth_client.get("/").data
    assert auth_client.get("/news/1").status_code == 404


# --- feeds -----------------------------------------------------------------

def test_feeds_empty_are_valid(client):
    rss = client.get("/feed/rss.xml")
    atom = client.get("/feed/atom.xml")
    assert rss.status_code == 200
    assert rss.mimetype == "application/rss+xml"
    assert atom.mimetype == "application/atom+xml"
    assert feedparser.parse(rss.data).bozo == 0
    assert feedparser.parse(atom.data).bozo == 0


def test_feeds_parse_with_item(auth_client):
    auth_client.post(
        "/admin/new",
        data={"title": "Feed Item", "body": "Some body", "action": "publish"},
    )
    rss = feedparser.parse(auth_client.get("/feed/rss.xml").data)
    assert rss.bozo == 0
    assert rss.entries[0].title == "Feed Item"
    assert rss.entries[0].link == "http://localhost/news/1"

    atom = feedparser.parse(auth_client.get("/feed/atom.xml").data)
    assert atom.bozo == 0
    assert atom.entries[0].title == "Feed Item"


def test_json_feed(auth_client):
    auth_client.post(
        "/admin/new",
        data={"title": "JSON Item", "body": "body", "action": "publish"},
    )
    resp = auth_client.get("/feed/feed.json")
    assert resp.mimetype == "application/feed+json"
    data = resp.get_json()
    assert data["version"].startswith("https://jsonfeed.org/version/1.1")
    assert data["items"][0]["title"] == "JSON Item"
    assert data["items"][0]["url"] == "http://localhost/news/1"


def test_feed_has_cors_header(client):
    resp = client.get("/feed/rss.xml")
    assert resp.headers.get("Access-Control-Allow-Origin") == "*"
