"""Seed the database with research categories and a demo account.

Run with: python -m app.db.seed
"""

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.models import ResearchCategory, User, UserRole

CATEGORIES = [
    "Artificial Intelligence",
    "Computer Science",
    "Electronics",
    "Physics",
    "Biology",
    "Chemistry",
    "Mathematics",
    "Engineering",
]


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for name in CATEGORIES:
            slug = slugify(name)
            if not db.query(ResearchCategory).filter_by(slug=slug).first():
                db.add(ResearchCategory(name=name, slug=slug))

        demo_email = "demo@nullarchive.org"
        if not db.query(User).filter_by(email=demo_email).first():
            db.add(
                User(
                    name="Demo Researcher",
                    email=demo_email,
                    hashed_password=hash_password("changeme123"),
                    institution="NullArchive Demo Lab",
                    role=UserRole.researcher,
                    verified=True,
                )
            )

        db.commit()
        print("Seed complete: categories created, demo account: "
              f"{demo_email} / changeme123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
