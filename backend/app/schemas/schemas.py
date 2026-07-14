from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.models import AttachmentKind, ResearchType, ReviewStatus, UserRole

# ---------- Users ----------


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8)
    institution: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    institution: str | None
    bio: str | None
    role: UserRole
    verified: bool
    reputation: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Research categories ----------


class ResearchCategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None

    class Config:
        from_attributes = True


# ---------- Attachments ----------


class AttachmentOut(BaseModel):
    id: str
    filename: str
    kind: AttachmentKind
    size_bytes: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ---------- Comments ----------


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class CommentOut(BaseModel):
    id: str
    body: str
    author: UserOut
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Research entries ----------


class ResearchEntryCreate(BaseModel):
    title: str = Field(min_length=5, max_length=300)
    category_id: str
    research_type: ResearchType
    abstract: str = Field(min_length=40)
    research_question: str
    hypothesis: str
    methodology: str
    expected_outcome: str
    actual_outcome: str
    why_it_failed: str
    lessons_learned: str
    references: str | None = None


class ResearchEntryListItem(BaseModel):
    id: str
    slug: str
    title: str
    research_type: ResearchType
    abstract: str
    view_count: int
    citation_count: int
    author: UserOut
    category: ResearchCategoryOut
    published_at: datetime | None

    class Config:
        from_attributes = True


class ResearchEntryDetail(ResearchEntryListItem):
    research_question: str
    hypothesis: str
    methodology: str
    expected_outcome: str
    actual_outcome: str
    why_it_failed: str
    lessons_learned: str
    references: str | None
    attachments: list[AttachmentOut] = []
    comments: list[CommentOut] = []

    class Config:
        from_attributes = True


# ---------- Reviews ----------


class ReviewCreate(BaseModel):
    status: ReviewStatus
    notes: str | None = None
