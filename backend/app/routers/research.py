import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.storage import get_storage
from app.db.session import get_db
from app.models.models import (
    Attachment,
    AttachmentKind,
    ResearchCategory,
    ResearchEntry,
    ResearchType,
    User,
    ViewHistory,
)
from app.routers.deps import get_current_user, get_optional_user
from app.schemas.schemas import (
    AttachmentOut,
    ResearchEntryCreate,
    ResearchEntryDetail,
    ResearchEntryListItem,
)

router = APIRouter(prefix="/api/research", tags=["research"])


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{slug}-{uuid.uuid4().hex[:6]}"


@router.get("", response_model=list[ResearchEntryListItem])
def list_research(
    q: str | None = Query(None, description="Search title, abstract, or author name"),
    field: str | None = Query(None, description="Filter by category slug"),
    research_type: ResearchType | None = Query(None),
    author_id: str | None = Query(None, description="Filter by author id, e.g. for profile pages"),
    sort: str = Query("latest", pattern="^(latest|most_viewed|most_discussed)$"),
    db: Session = Depends(get_db),
):
    query = db.query(ResearchEntry).filter(ResearchEntry.is_published.is_(True))

    if author_id:
        query = query.filter(ResearchEntry.author_id == author_id)
    if q:
        like = f"%{q}%"
        query = query.join(User, ResearchEntry.author).filter(
            or_(ResearchEntry.title.ilike(like), ResearchEntry.abstract.ilike(like), User.name.ilike(like))
        )
    if field:
        query = query.join(ResearchCategory).filter(ResearchCategory.slug == field)
    if research_type:
        query = query.filter(ResearchEntry.research_type == research_type)

    if sort == "most_viewed":
        query = query.order_by(ResearchEntry.view_count.desc())
    elif sort == "most_discussed":
        # Discussion volume is derived from the comments relationship count.
        query = query.outerjoin(ResearchEntry.comments).group_by(ResearchEntry.id)
        query = query.order_by(ResearchEntry.published_at.desc())
    else:
        query = query.order_by(ResearchEntry.published_at.desc())

    return query.all()


@router.get("/{slug}", response_model=ResearchEntryDetail)
def get_research(slug: str, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    entry = db.query(ResearchEntry).filter(ResearchEntry.slug == slug).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    # Record a view event and bump the denormalized counter.
    db.add(ViewHistory(research_entry_id=entry.id, viewer_id=user.id if user else None))
    entry.view_count += 1
    db.commit()
    db.refresh(entry)
    return entry


@router.post("", response_model=ResearchEntryDetail, status_code=201)
def create_research(
    payload: ResearchEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.get(ResearchCategory, payload.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Unknown research category.")

    entry = ResearchEntry(
        slug=slugify(payload.title),
        title=payload.title,
        research_type=payload.research_type,
        abstract=payload.abstract,
        research_question=payload.research_question,
        hypothesis=payload.hypothesis,
        methodology=payload.methodology,
        expected_outcome=payload.expected_outcome,
        actual_outcome=payload.actual_outcome,
        why_it_failed=payload.why_it_failed,
        lessons_learned=payload.lessons_learned,
        references=payload.references,
        author_id=current_user.id,
        category_id=category.id,
        # NOTE: there's no reviewer UI yet to approve submissions, so entries
        # publish immediately for now. Once a review workflow exists, switch
        # this back to is_published=False and set published_at when a
        # Review with status=approved is created instead.
        is_published=True,
        published_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/{slug}/attachments", response_model=AttachmentOut, status_code=201)
def upload_attachment(
    slug: str,
    kind: AttachmentKind,
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(ResearchEntry).filter(ResearchEntry.slug == slug).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Research entry not found.")
    if entry.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the author can add attachments.")

    storage = get_storage()
    stored_path = storage.save(file.file, file.filename or "upload", file.content_type or "")

    attachment = Attachment(
        research_entry_id=entry.id,
        filename=file.filename or "upload",
        kind=kind,
        storage_path=stored_path,
        size_bytes=file.size or 0,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment
