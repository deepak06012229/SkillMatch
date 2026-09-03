import math
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Opportunity, User, Profile, StudentSkill, Project, MatchResult
from ..services.matching_engine import calculate_match_score, get_cached_or_compute_match
from ..common.exceptions import NotFoundException
from .deps import get_current_user

router = APIRouter(prefix="/matches", tags=["Matching Engine"])

@router.get("")
def get_matches(
    min_fit: Optional[int] = Query(40, description="Minimum fit score threshold (0-100)"),
    eligible_only: Optional[bool] = Query(False, description="Filter only strictly eligible opportunities"),
    category: Optional[str] = Query(None, description="Category filter across all 7 opportunity types"),
    search: Optional[str] = Query(None, description="Search term for opportunity or organization"),
    sort_by: Optional[str] = Query("fit_desc", description="fit_desc, readiness_desc, deadline_asc, trust_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    paginated: bool = Query(False, description="Set True for pagination envelope"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    STUDENT-SPECIFIC HYBRID MATCHING API:
    Ranks active opportunities using deterministic eligibility rules and hybrid fit scoring.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, full_name=current_user.full_name)
        db.add(profile)
        db.commit()

    student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == current_user.id).all()
    student_projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    query = db.query(Opportunity).filter(
        Opportunity.deadline_status != "EXPIRED",
        Opportunity.status != "EXPIRED",
        Opportunity.is_duplicate == False
    )

    if category and category != "all":
        cat_clean = category.lower().replace("-", "_")
        query = query.filter(Opportunity.type == cat_clean)

    if search and search.strip():
        q_term = f"%{search.strip().lower()}%"
        query = query.filter(
            (Opportunity.title.ilike(q_term)) |
            (Opportunity.organization.ilike(q_term)) |
            (Opportunity.description.ilike(q_term))
        )

    opportunities = query.all()
    matches = []

    for opp in opportunities:
        match_info = get_cached_or_compute_match(
            db=db,
            opportunity=opp,
            current_user=current_user,
            profile=profile,
            student_skills=student_skills,
            student_projects=student_projects,
            force_recalculate=False
        )

        if match_info["fit_score"] < min_fit:
            continue
        if eligible_only and not match_info["is_eligible"]:
            continue

        stipend_str = (
            f"${opp.stipend_amount:,}/mo" if opp.stipend_amount > 0 and opp.stipend_type not in ["Prize Pool", "Scholarship Grant"]
            else (f"${opp.stipend_amount:,} {opp.stipend_type}" if opp.stipend_amount > 0 else "Free")
        )

        matches.append({
            "id": opp.id,
            "title": opp.title,
            "organization": opp.organization,
            "logoText": opp.logo_text,
            "logoBg": opp.logo_bg,
            "category": opp.type,
            "categoryLabel": opp.category_label,
            "description": opp.description,
            "overview": opp.overview,
            "requiredSkills": opp.required_skills or [],
            "preferredSkills": opp.preferred_skills or [],
            "academicEligibility": opp.allowed_years or [],
            "minCgpa": opp.min_cgpa,
            "location": opp.location,
            "workplaceType": opp.workplace_type,
            "stipend": stipend_str,
            "stipendAmount": opp.stipend_amount,
            "duration": opp.duration,
            "deadline": opp.deadline,
            "deadlineDays": opp.deadline_days,
            "deadlineStatus": opp.deadline_status,
            "verified": opp.verified,
            "lastVerified": opp.last_verified,
            "applicationUrl": opp.application_url,
            "source": opp.source,
            "trustScore": opp.trust_score,
            "fitScore": match_info["fit_score"],
            "isEligible": match_info["is_eligible"],
            "eligibilityStatus": match_info["eligibility_status"],
            "eligibilityReasons": match_info["eligibility_reasons"],
            "failedRequirements": match_info.get("failed_requirements", []),
            "readinessScore": match_info["readiness_score"],
            "explorationTag": match_info.get("exploration_tag", "Strong Match"),
            "isColdStart": match_info.get("is_cold_start", False),
            "matchBreakdown": match_info["breakdown"],
            "whyYouMatch": match_info["why_you_match"],
            "whatYouAreMissing": match_info["what_you_are_missing"],
            "scoreSemantics": match_info.get("score_semantics"),
            "disclaimer": match_info.get("disclaimer")
        })

    # Sort: Eligible first, then descending by requested sort criteria
    if sort_by == "readiness_desc":
        matches.sort(key=lambda x: (1 if x["isEligible"] else 0, x["readinessScore"]), reverse=True)
    elif sort_by == "deadline_asc":
        matches.sort(key=lambda x: (1 if x["isEligible"] else 0, -x["deadlineDays"]), reverse=True)
    elif sort_by == "trust_desc":
        matches.sort(key=lambda x: (1 if x["isEligible"] else 0, x["trustScore"]), reverse=True)
    else:  # fit_desc
        matches.sort(key=lambda x: (1 if x["isEligible"] else 0, x["fitScore"]), reverse=True)

    total_count = len(matches)
    total_pages = max(1, math.ceil(total_count / page_size))
    start_idx = (page - 1) * page_size
    paginated_items = matches[start_idx : start_idx + page_size]

    cold_start_notice = (
        "Your profile has limited verified skills. Add or confirm your skills from your resume to unlock higher-confidence match recommendations."
        if len(student_skills) == 0 else None
    )

    if paginated:
        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "cold_start_notice": cold_start_notice,
            "items": paginated_items
        }

    return matches

@router.get("/{opportunity_id}")
def get_match_detail(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed explainable fit score breakdown for a specific opportunity.
    """
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise NotFoundException("Opportunity", f"Opportunity ID '{opportunity_id}' not found.")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == current_user.id).all()
    student_projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    match_info = get_cached_or_compute_match(
        db=db,
        opportunity=opp,
        current_user=current_user,
        profile=profile,
        student_skills=student_skills,
        student_projects=student_projects,
        force_recalculate=False
    )

    return {
        "opportunity_id": opp.id,
        "title": opp.title,
        "organization": opp.organization,
        "fit_score": match_info["fit_score"],
        "is_eligible": match_info["is_eligible"],
        "eligibility_status": match_info["eligibility_status"],
        "eligibility_reasons": match_info["eligibility_reasons"],
        "failed_requirements": match_info.get("failed_requirements", []),
        "readiness_score": match_info["readiness_score"],
        "trust_score": opp.trust_score,
        "breakdown": match_info["breakdown"],
        "why_you_match": match_info["why_you_match"],
        "what_you_are_missing": match_info["what_you_are_missing"],
        "exploration_tag": match_info.get("exploration_tag", "Strong Match"),
        "score_semantics": match_info.get("score_semantics"),
        "disclaimer": match_info.get("disclaimer")
    }

@router.post("/recalculate")
def recalculate_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Invalidates match cache and recomputes fresh match rankings for the current student.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == current_user.id).all()
    student_projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    # Clear cached records
    db.query(MatchResult).filter(MatchResult.user_id == current_user.id).delete()
    db.commit()

    active_opps = db.query(Opportunity).filter(
        Opportunity.deadline_status != "EXPIRED",
        Opportunity.status != "EXPIRED"
    ).all()

    recalculated = 0
    for opp in active_opps:
        get_cached_or_compute_match(
            db=db,
            opportunity=opp,
            current_user=current_user,
            profile=profile,
            student_skills=student_skills,
            student_projects=student_projects,
            force_recalculate=True
        )
        recalculated += 1

    return {
        "status": "success",
        "recalculated_count": recalculated,
        "message": f"Successfully recomputed and cached {recalculated} opportunity matches."
    }
