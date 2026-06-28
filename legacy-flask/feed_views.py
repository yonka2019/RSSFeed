"""Feed endpoints: RSS 2.0, Atom 1.0, JSON Feed."""
import json

from flask import Blueprint, Response, current_app

import feeds
import repository

bp = Blueprint("feed", __name__, url_prefix="/feed")


def _site():
    cfg = current_app.config
    base = cfg["SITE_URL"].rstrip("/")
    return {
        "title": cfg["SITE_TITLE"],
        "description": cfg["SITE_DESCRIPTION"],
        "url": base,
        "author": cfg["SITE_AUTHOR"],
        "rss_url": base + "/feed/rss.xml",
        "atom_url": base + "/feed/atom.xml",
        "json_url": base + "/feed/feed.json",
    }


def _with_cors(response):
    # Allow browser-side fetchers (e.g. Grafana's News panel) to read the feed.
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@bp.route("/rss.xml")
def rss():
    xml = feeds.build_rss(repository.list_published(), _site())
    return _with_cors(Response(xml, mimetype="application/rss+xml"))


@bp.route("/atom.xml")
def atom():
    xml = feeds.build_atom(repository.list_published(), _site())
    return _with_cors(Response(xml, mimetype="application/atom+xml"))


@bp.route("/feed.json")
def json_feed():
    data = feeds.build_json(repository.list_published(), _site())
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return _with_cors(Response(body, mimetype="application/feed+json"))
