"""ORM models for NullArchive.

Entities: User, ResearchEntry, ResearchCategory, Attachment, Comment,
Review, ViewHistory.

Relationships:
- User 1--N ResearchEntry (a researcher can author many entries)
- ResearchEntry 1--N Comment
- ResearchEntry 1--N Attachment
- ResearchEntry N--1 ResearchCategory
- ResearchEntry 1--N Review (reviewer feedback before publication)
- ResearchEntry 1--N ViewHistory (for view-count / analytics)
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    researcher = "researcher"
    reviewer = "reviewer"
    administrator = "administrator"


class ResearchType(str, enum.Enum):
    failed_experiment = "Failed Experiment"
    negative_result = "Negative Result"
    null_result = "Null Result"
    failed_replication = "Failed Replication"
    unexpected_outcome = "Unexpected Outcome"


class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    changes_requested = "changes_requested"
    rejected = "rejected"


class AttachmentKind(str, enum.Enum):
    paper = "paper"
    image = "image"
    code = "code"
    data = "data"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.researcher)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    reputation: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    research_entries: Mapped[list["ResearchEntry"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    reviews: Mapped[list["Review"]] = relationship(back_populates="reviewer")


class ResearchCategory(Base):
    __tablename__ = "research_categories"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    entries: Mapped[list["ResearchEntry"]] = relationship(back_populates="category")


class ResearchEntry(Base):
    __tablename__ = "research_entries"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    research_type: Mapped[ResearchType] = mapped_column(Enum(ResearchType), nullable=False)

    abstract: Mapped[str] = mapped_column(Text, nullable=False)
    research_question: Mapped[str] = mapped_column(Text, nullable=False)
    hypothesis: Mapped[str] = mapped_column(Text, nullable=False)
    methodology: Mapped[str] = mapped_column(Text, nullable=False)
    expected_outcome: Mapped[str] = mapped_column(Text, nullable=False)
    actual_outcome: Mapped[str] = mapped_column(Text, nullable=False)
    why_it_failed: Mapped[str] = mapped_column(Text, nullable=False)
    lessons_learned: Mapped[str] = mapped_column(Text, nullable=False)
    references: Mapped[str | None] = mapped_column(Text, nullable=True)  # newline-separated

    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    category_id: Mapped[str] = mapped_column(ForeignKey("research_categories.id"), nullable=False)

    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    author: Mapped["User"] = relationship(back_populates="research_entries")
    category: Mapped["ResearchCategory"] = relationship(back_populates="entries")
    attachments: Mapped[list["Attachment"]] = relationship(
        back_populates="research_entry", cascade="all, delete-orphan"
    )
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="research_entry", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="research_entry", cascade="all, delete-orphan"
    )
    views: Mapped[list["ViewHistory"]] = relationship(
        back_populates="research_entry", cascade="all, delete-orphan"
    )


class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    research_entry_id: Mapped[str] = mapped_column(ForeignKey("research_entries.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[AttachmentKind] = mapped_column(Enum(AttachmentKind), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    research_entry: Mapped["ResearchEntry"] = relationship(back_populates="attachments")


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    research_entry_id: Mapped[str] = mapped_column(ForeignKey("research_entries.id"), nullable=False)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    research_entry: Mapped["ResearchEntry"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")


class Review(Base):
    """A reviewer's assessment of a submitted entry prior to publication."""

    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    research_entry_id: Mapped[str] = mapped_column(ForeignKey("research_entries.id"), nullable=False)
    reviewer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[ReviewStatus] = mapped_column(Enum(ReviewStatus), default=ReviewStatus.pending)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    research_entry: Mapped["ResearchEntry"] = relationship(back_populates="reviews")
    reviewer: Mapped["User"] = relationship(back_populates="reviews")


class ViewHistory(Base):
    """One row per view event, used to compute view counts and detect trending entries."""

    __tablename__ = "view_history"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    research_entry_id: Mapped[str] = mapped_column(ForeignKey("research_entries.id"), nullable=False)
    viewer_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    viewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    research_entry: Mapped["ResearchEntry"] = relationship(back_populates="views")
