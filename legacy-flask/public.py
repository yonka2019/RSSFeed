"""Public-facing pages: homepage list and per-item permalink."""
from flask import Blueprint, abort, render_template

import repository

bp = Blueprint("public", __name__)


@bp.route("/")
def index():
    items = repository.list_published()
    return render_template("index.html", items=items)


@bp.route("/news/<int:item_id>")
def item(item_id):
    news = repository.get_published_item(item_id)
    if news is None:
        abort(404)
    return render_template("item.html", item=news)
