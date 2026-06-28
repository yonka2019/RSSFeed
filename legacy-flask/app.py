"""Application factory and wiring."""
from flask import Flask, render_template, session
from werkzeug.security import generate_password_hash

import admin
import auth
import db
import feed_views
import public
from config import Config


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    # Hash the configured admin password once at startup.
    app.config["ADMIN_PASSWORD_HASH"] = generate_password_hash(
        app.config["ADMIN_PASSWORD"], method="pbkdf2"
    )

    db.init_app(app)
    with app.app_context():
        db.init_db()

    app.register_blueprint(public.bp)
    app.register_blueprint(feed_views.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(admin.bp)

    @app.context_processor
    def inject_globals():
        return {
            "site_title": app.config["SITE_TITLE"],
            "site_description": app.config["SITE_DESCRIPTION"],
            "logged_in": session.get("logged_in", False),
        }

    @app.errorhandler(404)
    def not_found(error):
        return render_template("404.html"), 404

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5000, debug=True)
