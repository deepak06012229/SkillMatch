from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import CORS_ORIGINS, UPLOAD_DIR
from .database import engine, Base, SessionLocal
from .services.seed_data import seed_database
from .common.exceptions import AppException

# Routers
from .api.auth import router as auth_router
from .api.profile import router as profile_router
from .api.resume import router as resume_router
from .api.skills import router as skills_router
from .api.opportunities import router as opp_router
from .api.matches import router as match_router
from .api.skill_gaps import router as skill_gap_router
from .api.roadmap import router as roadmap_router
from .api.applications import router as app_router
from .api.saved import router as saved_router
from .api.feedback import router as feedback_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SkillMatch Intelligence API",
    description="Backend services for SkillMatch — Education, Skills & Youth Opportunities matching platform.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# CONSISTENT API ERROR HANDLERS
# =============================================================================

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0]["msg"] if errors else "Invalid request body."
    field_loc = " -> ".join(str(loc) for loc in errors[0].get("loc", [])) if errors else "field"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Validation failed at '{field_loc}': {first_msg}"
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # If detail is already a dict with code and message
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.detail.get("code", "HTTP_ERROR"),
                    "message": exc.detail.get("message", "An error occurred.")
                }
            }
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail)
            }
        }
    )

# Mount uploaded media directory
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API routes
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(skills_router, prefix="/api")
app.include_router(opp_router, prefix="/api")
app.include_router(match_router, prefix="/api")
app.include_router(skill_gap_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(app_router, prefix="/api")
app.include_router(saved_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillMatch Backend",
        "version": "2.0.0",
        "timestamp": "2026-09-03"
    }

@app.get("/")
def root():
    return {"message": "SkillMatch API is running. Access interactive docs at /docs"}
