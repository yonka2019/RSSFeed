"""Build RSS 2.0, Atom 1.0, and JSON Feed documents from news items.

Pure functions: each takes a list of item rows and a ``site`` dict and returns a
serialized feed. No Flask dependency, so they are easy to unit-test.

``site`` keys: title, description, url, author, rss_url, atom_url, json_url.
"""
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import format_datetime

ATOM_NS = "http://www.w3.org/2005/Atom"


def _parse(value):
    """Parse a stored ISO-8601 string into an aware datetime (UTC)."""
    if not value:
        return None
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _rfc3339(dt):
    return dt.astimezone(timezone.utc).isoformat()


def _permalink(site, item):
    return f"{site['url']}/news/{item['id']}"


def _item_date(item):
    return _parse(item["published_at"] or item["created_at"])


def build_rss(items, site):
    rss = ET.Element(
        "rss",
        {"version": "2.0", "xmlns:atom": ATOM_NS},
    )
    channel = ET.SubElement(rss, "channel")
    ET.SubElement(channel, "title").text = site["title"]
    ET.SubElement(channel, "link").text = site["url"]
    ET.SubElement(channel, "description").text = site["description"]
    ET.SubElement(
        channel,
        "atom:link",
        {"href": site["rss_url"], "rel": "self", "type": "application/rss+xml"},
    )

    dates = [d for d in (_item_date(i) for i in items) if d]
    if dates:
        ET.SubElement(channel, "lastBuildDate").text = format_datetime(max(dates))

    for item in items:
        entry = ET.SubElement(channel, "item")
        ET.SubElement(entry, "title").text = item["title"]
        link = _permalink(site, item)
        ET.SubElement(entry, "link").text = link
        guid = ET.SubElement(entry, "guid", {"isPermaLink": "true"})
        guid.text = link
        dt = _item_date(item)
        if dt:
            ET.SubElement(entry, "pubDate").text = format_datetime(dt)
        # ElementTree escapes the HTML; readers unescape and render it.
        ET.SubElement(entry, "description").text = item["body_html"]

    return ET.tostring(rss, encoding="utf-8", xml_declaration=True)


def build_atom(items, site):
    ET.register_namespace("", ATOM_NS)
    feed = ET.Element(f"{{{ATOM_NS}}}feed")
    ET.SubElement(feed, f"{{{ATOM_NS}}}title").text = site["title"]
    ET.SubElement(feed, f"{{{ATOM_NS}}}subtitle").text = site["description"]
    ET.SubElement(feed, f"{{{ATOM_NS}}}id").text = site["url"] + "/"
    ET.SubElement(
        feed,
        f"{{{ATOM_NS}}}link",
        {"href": site["atom_url"], "rel": "self", "type": "application/atom+xml"},
    )
    ET.SubElement(
        feed,
        f"{{{ATOM_NS}}}link",
        {"href": site["url"], "rel": "alternate", "type": "text/html"},
    )
    author = ET.SubElement(feed, f"{{{ATOM_NS}}}author")
    ET.SubElement(author, f"{{{ATOM_NS}}}name").text = site["author"]

    dates = [d for d in (_item_date(i) for i in items) if d]
    updated = max(dates) if dates else datetime.now(timezone.utc)
    ET.SubElement(feed, f"{{{ATOM_NS}}}updated").text = _rfc3339(updated)

    for item in items:
        entry = ET.SubElement(feed, f"{{{ATOM_NS}}}entry")
        ET.SubElement(entry, f"{{{ATOM_NS}}}title").text = item["title"]
        link = _permalink(site, item)
        ET.SubElement(entry, f"{{{ATOM_NS}}}id").text = link
        ET.SubElement(
            entry,
            f"{{{ATOM_NS}}}link",
            {"href": link, "rel": "alternate", "type": "text/html"},
        )
        published = _item_date(item)
        updated_dt = _parse(item["updated_at"]) or published
        if published:
            ET.SubElement(entry, f"{{{ATOM_NS}}}published").text = _rfc3339(published)
        if updated_dt:
            ET.SubElement(entry, f"{{{ATOM_NS}}}updated").text = _rfc3339(updated_dt)
        content = ET.SubElement(entry, f"{{{ATOM_NS}}}content", {"type": "html"})
        content.text = item["body_html"]

    return ET.tostring(feed, encoding="utf-8", xml_declaration=True)


def build_json(items, site):
    return {
        "version": "https://jsonfeed.org/version/1.1",
        "title": site["title"],
        "home_page_url": site["url"],
        "feed_url": site["json_url"],
        "description": site["description"],
        "authors": [{"name": site["author"]}],
        "items": [
            {
                "id": _permalink(site, item),
                "url": _permalink(site, item),
                "title": item["title"],
                "content_html": item["body_html"],
                "date_published": _rfc3339(_item_date(item)),
                "date_modified": _rfc3339(
                    _parse(item["updated_at"]) or _item_date(item)
                ),
            }
            for item in items
        ],
    }
