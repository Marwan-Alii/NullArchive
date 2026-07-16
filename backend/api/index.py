"""Vercel serverless entrypoint.

Vercel's Python runtime looks for an ASGI/WSGI `app` object under the api/
directory. Our actual FastAPI app lives in app/main.py (kept there so the
project works the same way locally and on any other host) — this file just
re-exports it for Vercel specifically.
"""

from app.main import app  # noqa: F401
