"""Storage abstraction for research attachments.

The rest of the app only ever talks to `get_storage()`, never to a specific
provider. This keeps the platform portable: start with local disk storage
for development, then switch STORAGE_BACKEND=supabase in .env once a
Supabase project (or any S3-compatible bucket) is ready — no application
code changes required.
"""

from __future__ import annotations

import os
import shutil
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

from app.core.config import get_settings

settings = get_settings()


class StorageBackend(ABC):
    @abstractmethod
    def save(self, file: BinaryIO, filename: str, content_type: str) -> str:
        """Persist a file and return a URL or path that can be stored on the Attachment record."""

    @abstractmethod
    def delete(self, stored_path: str) -> None:
        """Remove a previously stored file."""


class LocalStorageBackend(StorageBackend):
    """Writes files to a local directory. Suitable for development only."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save(self, file: BinaryIO, filename: str, content_type: str) -> str:
        ext = Path(filename).suffix
        stored_name = f"{uuid.uuid4().hex}{ext}"
        destination = self.base_path / stored_name
        with open(destination, "wb") as out:
            shutil.copyfileobj(file, out)
        return str(destination)

    def delete(self, stored_path: str) -> None:
        path = Path(stored_path)
        if path.exists():
            os.remove(path)


class SupabaseStorageBackend(StorageBackend):
    """Uploads files to a Supabase Storage bucket.

    Requires SUPABASE_URL and SUPABASE_SERVICE_KEY to be set. Install the
    `supabase` Python package (not included by default) to activate this
    backend: `pip install supabase`.
    """

    def __init__(self, url: str, service_key: str, bucket: str):
        from supabase import create_client  # imported lazily so it's an optional dependency

        self.client = create_client(url, service_key)
        self.bucket = bucket

    def save(self, file: BinaryIO, filename: str, content_type: str) -> str:
        ext = Path(filename).suffix
        stored_name = f"{uuid.uuid4().hex}{ext}"
        self.client.storage.from_(self.bucket).upload(
            stored_name, file.read(), {"content-type": content_type}
        )
        return self.client.storage.from_(self.bucket).get_public_url(stored_name)

    def delete(self, stored_path: str) -> None:
        stored_name = stored_path.rsplit("/", 1)[-1]
        self.client.storage.from_(self.bucket).remove([stored_name])


def get_storage() -> StorageBackend:
    if settings.storage_backend == "supabase":
        if not settings.supabase_url or not settings.supabase_service_key:
            raise RuntimeError(
                "STORAGE_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_KEY."
            )
        return SupabaseStorageBackend(
            settings.supabase_url, settings.supabase_service_key, settings.supabase_bucket
        )
    return LocalStorageBackend(settings.storage_local_path)
