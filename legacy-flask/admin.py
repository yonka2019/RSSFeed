"""Admin area: create, edit, publish/unpublish and delete news items."""
from flask import (
    Blueprint,
    abort,
    flash,
    redirect,
    render_template,
    request,
    url_for,
)

import repository
from auth import login_required

bp = Blueprint("admin", __name__, url_prefix="/admin")


@bp.route("/")
@login_required
def dashboard():
    items = repository.list_all()
    return render_template("admin/dashboard.html", items=items)


@bp.route("/new", methods=["GET", "POST"])
@login_required
def new():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        body = request.form.get("body", "")
        action = request.form.get("action", "save_draft")
        if not title:
            flash("Title is required.")
            return render_template(
                "admin/form.html", item=None, form={"title": title, "body": body}
            )
        status = "published" if action == "publish" else "draft"
        repository.create_item(title, body, status)
        flash("News item created.")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/form.html", item=None, form=None)


@bp.route("/<int:item_id>/edit", methods=["GET", "POST"])
@login_required
def edit(item_id):
    item = repository.get_item(item_id)
    if item is None:
        abort(404)
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        body = request.form.get("body", "")
        action = request.form.get("action", "save_draft")
        if not title:
            flash("Title is required.")
            return render_template(
                "admin/form.html", item=item, form={"title": title, "body": body}
            )
        status = "published" if action == "publish" else "draft"
        repository.update_item(item_id, title, body, status)
        flash("Changes saved.")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/form.html", item=item, form=None)


@bp.route("/<int:item_id>/publish", methods=["POST"])
@login_required
def publish(item_id):
    if repository.set_status(item_id, "published"):
        flash("Published.")
    return redirect(url_for("admin.dashboard"))


@bp.route("/<int:item_id>/unpublish", methods=["POST"])
@login_required
def unpublish(item_id):
    if repository.set_status(item_id, "draft"):
        flash("Moved to draft.")
    return redirect(url_for("admin.dashboard"))


@bp.route("/<int:item_id>/delete", methods=["POST"])
@login_required
def delete(item_id):
    repository.delete_item(item_id)
    flash("Deleted.")
    return redirect(url_for("admin.dashboard"))
