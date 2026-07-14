from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, comments, research, users

settings = get_settings()

app = FastAPI(
    title="NullArchive API",
    description="Open repository for negative scientific results and failed experiments.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(research.router)
app.include_router(comments.router)
app.include_router(users.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
