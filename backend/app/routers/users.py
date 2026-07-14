from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ResearchCategory, User
from app.schemas.schemas import ResearchCategoryOut, UserOut

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.get("/categories", response_model=list[ResearchCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ResearchCategory).order_by(ResearchCategory.name).all()
