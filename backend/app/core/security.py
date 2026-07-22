from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a signed JWT for the given user id (subject)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_password_reset_token(user_id: str) -> str:
    """Create a short-lived, single-purpose token for password reset links.

    Kept deliberately separate from create_access_token: it carries a
    "purpose" claim so a reset link can never be replayed as a normal login
    token, and it expires quickly (30 minutes) regardless of the app's
    normal access-token lifetime.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {"sub": user_id, "exp": expire, "purpose": "password_reset"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_password_reset_token(token: str) -> str:
    """Decode a password reset token and return the user id, or raise if invalid/expired/wrong purpose."""
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    if payload.get("purpose") != "password_reset":
        raise JWTError("Not a password reset token")
    return payload["sub"]


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
