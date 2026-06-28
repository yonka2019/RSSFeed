"""Admin authentication: login/logout and the login_required decorator."""
import functools

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash

bp = Blueprint("auth", __name__, url_prefix="/admin")


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("auth.login", next=request.full_path))
        return view(*args, **kwargs)

    return wrapped


@bp.route("/login", methods=["GET", "POST"])
def login():
    if session.get("logged_in"):
        return redirect(url_for("admin.dashboard"))
    if request.method == "POST":
        password = request.form.get("password", "")
        if check_password_hash(current_app.config["ADMIN_PASSWORD_HASH"], password):
            session["logged_in"] = True
            nxt = request.args.get("next")
            # Only allow same-site relative paths; reject protocol-relative
            # ("//host") and backslash tricks to prevent open redirects.
            if nxt and nxt.startswith("/") and not nxt.startswith(("//", "/\\")):
                return redirect(nxt)
            return redirect(url_for("admin.dashboard"))
        flash("Incorrect password.")
    return render_template("admin/login.html")


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("Logged out.")
    return redirect(url_for("public.index"))
