import os
import sys
import tempfile

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app  # noqa: E402


@pytest.fixture
def app():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    application = create_app(
        {
            "TESTING": True,
            "DATABASE": path,
            "SECRET_KEY": "test",
            "ADMIN_PASSWORD": "test-pass",
            "SITE_TITLE": "Test News",
            "SITE_DESCRIPTION": "Test description",
            "SITE_URL": "http://localhost",
            "SITE_AUTHOR": "Tester",
        }
    )
    yield application
    os.unlink(path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_client(client):
    client.post("/admin/login", data={"password": "test-pass"})
    return client
