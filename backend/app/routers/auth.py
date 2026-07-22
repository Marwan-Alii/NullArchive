from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.email import send_password_reset_email
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    verify_password,
    verify_password_reset_token,
)
from app.db.session import get_db
from app.models.models import User
from app.routers.deps import get_current_user
from app.schemas.schemas import ResetPasswordRequest, Token, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        institution=payload.institution,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses "username" for the identifier field; we treat it as email.
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    token = create_access_token(subject=user.id, extra_claims={"role": user.role.value})
    return Token(access_token=token)


@router.post("/logout")
def logout():
    # JWTs are stateless; logout is handled client-side by discarding the token.
    # For real revocation, back this with a token-blacklist store (e.g. Redis).
    return {"detail": "Logged out."}


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    # Always return the same response whether or not the account exists,
    # to avoid leaking which emails are registered.
    if user:
        token = create_password_reset_token(user.id)
        reset_link = f"{settings.frontend_origin}/reset-password?token={token}"
        try:
            send_password_reset_email(user.email, reset_link)
        except Exception:
            # Don't leak email-configuration errors to the client; the
            # generic response below is returned either way.
            pass
    return {"detail": "If an account exists for this email, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        user_id = verify_password_reset_token(payload.token)
    except JWTError:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated. You can now log in with your new password."}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
