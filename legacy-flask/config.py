"""Application configuration, read from environment variables.

All settings have sensible development defaults so the app runs out of the box.
Override them via environment variables in any real deployment (see README).
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    # Flask session signing key. CHANGE THIS in production.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # The single admin password used to log in to the writing area.
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin")

    # Path to the SQLite database file.
    DATABASE = os.environ.get("DATABASE", os.path.join(BASE_DIR, "news.db"))

    # Feed / site metadata.
    SITE_TITLE = os.environ.get("SITE_TITLE", "Newsroom")
    SITE_DESCRIPTION = os.environ.get("SITE_DESCRIPTION", "Latest news and updates")
    SITE_URL = os.environ.get("SITE_URL", "http://localhost:5000")
    SITE_AUTHOR = os.environ.get("SITE_AUTHOR", "Editor")
