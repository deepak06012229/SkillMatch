from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User
from ..services.opportunity_service import (
    list_opportunities_advanced, get_opportunity_detail,
    ingest_opportunity, run_multi_source_ingestion
)
from .deps import get_current_user

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("")
def list_opportunities(
    category: Optional[str] = Query(None, description="internships, hackathons, scholarships, courses, projects, jobs, skill_opportunities"),
    search: Optional[str] = Query(None, description="Multi-field search across title, org, description, location"),
    workplace: Optional[str] = Query(None, description="Remote, Hybrid, On-site"),
    verified_only: Optional[bool] = Query(False),
    min_stipend: Optional[int] = Query(None),
    status: Optional[str] = Query(None, description="ACTIVE, EXPIRING_SOON, EXPIRED, all"),
    location: Optional[str] = Query(None),
    skills: Optional[str] = Query(None, description="Comma-separated skill names"),
    sort_by: Optional[str] = Query("recent", description="recent, trust_desc, deadline_asc, stipend_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    paginated: bool = Query(False, description="Set True for envelope {items, total, page, total_pages}"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List opportunities with advanced multi-factor filtering, search, sorting, and pagination.
    Supports all 7 problem statement categories:
    1. Internships
    2. Hackathons
    3. Scholarships
    4. Courses
    5. Projects
    6. Jobs
    7. Skill Opportunities
    """
    res = list_opportunities_advanced(
        db=db,
        user=current_user,
        category=category,
        search=search,
        workplace=workplace,
        verified_only=verified_only,
        min_stipend=min_stipend,
        status_filter=status,
        location=location,
        skills_filter=skills,
        sort_by=sort_by,
        page=page,
        page_size=page_size
    )

    if paginated:
        return res
    return res["items"]

@router.get("/categories/{category}")
def list_opportunities_by_category(
    category: str,
    limit: int = Query(20, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve opportunities restricted to a specific category.
    """
    res = list_opportunities_advanced(
        db=db,
        user=current_user,
        category=category,
        page=1,
        page_size=limit
    )
    return {
        "category": category,
        "count": res["total"],
        "items": res["items"]
    }

@router.get("/{opp_id}")
def get_opportunity(
    opp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full opportunity details including trust breakdown, eligibility rules, and duplicate clusters.
    """
    return get_opportunity_detail(db, opp_id)

@router.post("")
def create_opportunity(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest a new opportunity through the normalization, deduplication, and trust scoring pipeline.
    """
    return ingest_opportunity(db, payload)

@router.post("/refresh")
def refresh_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refreshes opportunity freshness statuses and executes ingestion across all registered source adapters.
    """
    return run_multi_source_ingestion(db)
