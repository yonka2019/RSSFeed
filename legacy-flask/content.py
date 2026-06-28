"""Render Markdown to safe HTML.

The admin is trusted, but we sanitize anyway (defense in depth) so a stray
script tag can never end up in a public page or a feed consumed by Grafana /
Confluence.
"""
import bleach
import markdown as _markdown

# A reasonable allowlist for news article bodies.
ALLOWED_TAGS = {
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "strong", "em", "b", "i", "u", "s", "sub", "sup",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "span", "div",
}

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "rel"],
    "img": ["src", "alt", "title"],
    "td": ["align"],
    "th": ["align"],
}

ALLOWED_PROTOCOLS = ["http", "https", "mailto"]


def render_markdown(text):
    """Convert Markdown ``text`` to sanitized HTML."""
    html = _markdown.markdown(
        text or "",
        extensions=["extra", "sane_lists"],
    )
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )
