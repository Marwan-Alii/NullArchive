from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Comment, ResearchEntry, User
from app.routers.deps import get_current_user
from app.schemas.schemas import CommentCreate, CommentOut

router = APIRouter(prefix="/api/research/{slug}/comments", tags=["comments"])


@router.get("", response_model=list[CommentOut])
def list_comments(slug: str, db: Session = Depends(get_db)):
    entry = db.query(ResearchEntry).filter(ResearchEntry.slug == slug).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Research entry not found.")
    return entry.comments


@router.post("", response_model=CommentOut, status_code=201)
def create_comment(
    slug: str,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(ResearchEntry).filter(ResearchEntry.slug == slug).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    comment = Comment(research_entry_id=entry.id, author_id=current_user.id, body=payload.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
