"""Data access for news items. The only module that issues SQL."""
from datetime import datetime, timezone

from content import render_markdown
from db import get_db


def _now():
    return datetime.now(timezone.utc).isoformat()


def create_item(title, body_markdown, status="draft"):
    now = _now()
    html = render_markdown(body_markdown)
    published_at = now if status == "published" else None
    db = get_db()
    cur = db.execute(
        "INSERT INTO news_item "
        "(title, body_markdown, body_html, status, created_at, updated_at, published_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (title, body_markdown, html, status, now, now, published_at),
    )
    db.commit()
    return cur.lastrowid


def update_item(item_id, title, body_markdown, status):
    existing = get_item(item_id)
    if existing is None:
        return False
    now = _now()
    html = render_markdown(body_markdown)
    published_at = existing["published_at"]
    if status == "published" and not published_at:
        published_at = now
    db = get_db()
    db.execute(
        "UPDATE news_item SET title = ?, body_markdown = ?, body_html = ?, "
        "status = ?, updated_at = ?, published_at = ? WHERE id = ?",
        (title, body_markdown, html, status, now, published_at, item_id),
    )
    db.commit()
    return True


def set_status(item_id, status):
    existing = get_item(item_id)
    if existing is None:
        return False
    now = _now()
    published_at = existing["published_at"]
    if status == "published" and not published_at:
        published_at = now
    db = get_db()
    db.execute(
        "UPDATE news_item SET status = ?, updated_at = ?, published_at = ? WHERE id = ?",
        (status, now, published_at, item_id),
    )
    db.commit()
    return True


def delete_item(item_id):
    db = get_db()
    db.execute("DELETE FROM news_item WHERE id = ?", (item_id,))
    db.commit()


def get_item(item_id):
    return get_db().execute(
        "SELECT * FROM news_item WHERE id = ?", (item_id,)
    ).fetchone()


def get_published_item(item_id):
    return get_db().execute(
        "SELECT * FROM news_item WHERE id = ? AND status = 'published'", (item_id,)
    ).fetchone()


def list_published(limit=None):
    query = (
        "SELECT * FROM news_item WHERE status = 'published' "
        "ORDER BY published_at DESC"
    )
    if limit:
        query += f" LIMIT {int(limit)}"
    return get_db().execute(query).fetchall()


def list_all():
    return get_db().execute(
        "SELECT * FROM news_item ORDER BY created_at DESC, id DESC"
    ).fetchall()
