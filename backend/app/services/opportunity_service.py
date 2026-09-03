import math
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from ..models.entities import Opportunity, OpportunitySkill, OpportunityEligibility, OpportunitySource, User
from .opportunity_normalizer import normalize_opportunity, check_duplicate, calculate_trust_score
from .opportunity_adapters import ADAPTER_REGISTRY
from ..common.exceptions import NotFoundException, AppException

def refresh_opportunity_freshness(db: Session):
    """
    Evaluates and automatically updates freshness status for all opportunities.
    """
    opps = db.query(Opportunity).all()
    for opp in opps:
        if opp.deadline_days <= 0 or opp.deadline_status == "EXPIRED":
            opp.deadline_status = "EXPIRED"
            opp.status = "EXPIRED"
        elif opp.deadline_days <= 5 or opp.deadline_status == "CLOSING_SOON":
            opp.deadline_status = "CLOSING_SOON"
            opp.status = "EXPIRING_SOON"
        else:
            opp.deadline_status = "OPEN"
            opp.status = "ACTIVE"
    db.commit()

def list_opportunities_advanced(
    db: Session,
    user: Optional[User] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    workplace: Optional[str] = None,
    verified_only: Optional[bool] = False,
    min_stipend: Optional[int] = None,
    status_filter: Optional[str] = None,
    location: Optional[str] = None,
    skills_filter: Optional[str] = None,
    sort_by: Optional[str] = "recent",
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """
    Advanced filtered, sorted, and paginated opportunity listing across all 7 categories.
    """
    query = db.query(Opportunity)

    # 1. Category Filter
    if category and category.lower() != "all":
        cat_lower = category.lower().replace("-", "_")
        query = query.filter(or_(Opportunity.type == cat_lower, Opportunity.category_label.ilike(f"%{category}%")))

    # 2. Freshness & Status Filter
    if status_filter and status_filter != "all":
        query = query.filter(Opportunity.status == status_filter.upper())
    elif not status_filter or status_filter != "all":
        # By default exclude expired unless specifically asked
        query = query.filter(Opportunity.status != "EXPIRED")

    # Exclude non-canonical duplicates from main listing
    query = query.filter(Opportunity.is_duplicate == False)

    # 3. Multi-Field Search (title, org, description, location)
    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(q),
                Opportunity.organization.ilike(q),
                Opportunity.description.ilike(q),
                Opportunity.location.ilike(q)
            )
        )

    # 4. Workplace Mode Filter
    if workplace and workplace.lower() != "all":
        query = query.filter(Opportunity.workplace_type == workplace)

    # 5. Verified Only Filter
    if verified_only:
        query = query.filter(Opportunity.verified == True)

    # 6. Min Stipend Filter
    if min_stipend and min_stipend > 0:
        query = query.filter(Opportunity.stipend_amount >= min_stipend)

    # 7. Location Substring Filter
    if location and location.strip():
        query = query.filter(Opportunity.location.ilike(f"%{location.strip()}%"))

    # 8. Sorting
    if sort_by == "trust_desc":
        query = query.order_by(Opportunity.trust_score.desc())
    elif sort_by == "deadline_asc":
        query = query.order_by(Opportunity.deadline_days.asc())
    elif sort_by == "stipend_desc":
        query = query.order_by(Opportunity.stipend_amount.desc())
    else:  # recent
        query = query.order_by(Opportunity.created_at.desc())

    total_count = query.count()
    total_pages = max(1, math.ceil(total_count / page_size))
    offset = (page - 1) * page_size
    opportunities = query.offset(offset).limit(page_size).all()

    # Filter by specific skills if requested
    items = []
    for opp in opportunities:
        req_skills = opp.required_skills or []
        if skills_filter:
            target_skills = [s.strip().lower() for s in skills_filter.split(",") if s.strip()]
            if not any(ts in [rs.lower() for rs in req_skills] for ts in target_skills):
                continue

        # Format item
        items.append(serialize_opportunity_card(opp))

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }

def get_opportunity_detail(db: Session, opp_id: str) -> Dict[str, Any]:
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise NotFoundException("Opportunity", f"Opportunity with ID '{opp_id}' was not found.")

    # Find duplicates clustered to this canonical opportunity
    duplicates = db.query(Opportunity).filter(Opportunity.canonical_id == opp.id).all()

    data = serialize_opportunity_card(opp)
    data["overview"] = opp.overview or opp.description
    data["trustBreakdown"] = opp.trust_breakdown or {
        "source_reliability": opp.trust_score,
        "url_security": 95,
        "metadata_completeness": 90,
        "freshness": 95,
        "explanation": f"Verified opportunity with {opp.trust_score}% platform trust index."
    }
    data["duplicates_found"] = [
        {"id": d.id, "title": d.title, "source": d.source, "url": d.application_url}
        for d in duplicates
    ]
    return data

def ingest_opportunity(db: Session, raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Single opportunity ingestion with normalization, deduplication & trust scoring.
    """
    normalized = normalize_opportunity(raw_data)
    opp_id = normalized.get("id") or f"opp-{int(datetime.utcnow().timestamp()*1000)}"

    # Check for duplicate
    existing = check_duplicate(db, normalized["dedup_signature"], normalized["application_url"])
    is_dup = False
    canonical_id = None

    if existing:
        is_dup = True
        canonical_id = existing.id

    opp = Opportunity(
        id=opp_id,
        title=normalized["title"],
        organization=normalized["organization"],
        logo_text=normalized["logo_text"],
        logo_bg=normalized["logo_bg"],
        type=normalized["type"],
        category_label=normalized["category_label"],
        description=normalized["description"],
        overview=normalized["overview"],
        required_skills=normalized["required_skills"],
        preferred_skills=normalized["preferred_skills"],
        min_cgpa=normalized["min_cgpa"],
        allowed_degrees=normalized["allowed_degrees"],
        allowed_branches=normalized["allowed_branches"],
        allowed_years=normalized["allowed_years"],
        min_experience_months=normalized["min_experience_months"],
        location=normalized["location"],
        workplace_type=normalized["workplace_type"],
        stipend_type=normalized["stipend_type"],
        stipend_amount=normalized["stipend_amount"],
        duration=normalized["duration"],
        deadline=normalized["deadline"],
        deadline_days=normalized["deadline_days"],
        deadline_status=normalized["deadline_status"],
        status=normalized["status"],
        application_url=normalized["application_url"],
        source=normalized["source"],
        source_url=normalized["source_url"],
        verified=normalized["verified"],
        last_verified=normalized["last_verified"],
        trust_score=normalized["trust_score"],
        trust_breakdown=normalized["trust_breakdown"],
        dedup_signature=normalized["dedup_signature"],
        is_duplicate=is_dup,
        canonical_id=canonical_id
    )

    db.add(opp)
    db.flush()

    # Relational skills
    for rs in normalized["required_skills"]:
        db.add(OpportunitySkill(opportunity_id=opp.id, skill_name=rs, is_required=True, weight=1.0))
    for ps in normalized["preferred_skills"]:
        db.add(OpportunitySkill(opportunity_id=opp.id, skill_name=ps, is_required=False, weight=0.5))

    db.commit()
    db.refresh(opp)

    return {
        "status": "ingested",
        "opportunity_id": opp.id,
        "is_duplicate": is_dup,
        "canonical_id": canonical_id,
        "trust_score": opp.trust_score,
        "category": opp.type
    }

def run_multi_source_ingestion(db: Session) -> Dict[str, Any]:
    """
    Executes ingestion pipeline across all registered source adapters,
    performing normalization, deduplication, and trust scoring.
    """
    refresh_opportunity_freshness(db)
    ingested_count = 0
    duplicate_count = 0

    for adapter in ADAPTER_REGISTRY:
        raw_batch = adapter.fetch_opportunities()
        for raw in raw_batch:
            # Check if exists by ID or signature
            existing_by_id = db.query(Opportunity).filter(Opportunity.id == raw.get("id")).first()
            if existing_by_id:
                continue

            res = ingest_opportunity(db, raw)
            if res["is_duplicate"]:
                duplicate_count += 1
            else:
                ingested_count += 1

    return {
        "status": "success",
        "adapters_run": len(ADAPTER_REGISTRY),
        "ingested_count": ingested_count,
        "duplicate_count": duplicate_count,
        "timestamp": datetime.utcnow().isoformat()
    }

def serialize_opportunity_card(opp: Opportunity) -> Dict[str, Any]:
    stipend_display = "Free"
    if opp.stipend_amount > 0:
        if opp.stipend_type == "Prize Pool":
            stipend_display = f"${opp.stipend_amount:,} Prize"
        elif opp.stipend_type == "Scholarship Grant":
            stipend_display = f"${opp.stipend_amount:,} Grant"
        else:
            stipend_display = f"${opp.stipend_amount:,}/mo"

    return {
        "id": opp.id,
        "title": opp.title,
        "organization": opp.organization,
        "logoText": opp.logo_text or "SM",
        "logoBg": opp.logo_bg or "bg-primary text-on-primary",
        "category": opp.type,
        "type": opp.type,
        "categoryLabel": opp.category_label,
        "description": opp.description,
        "requiredSkills": opp.required_skills or [],
        "preferredSkills": opp.preferred_skills or [],
        "academicEligibility": opp.allowed_years or [],
        "minCgpa": opp.min_cgpa,
        "location": opp.location,
        "workplaceType": opp.workplace_type,
        "stipend": stipend_display,
        "stipendAmount": opp.stipend_amount,
        "duration": opp.duration,
        "deadline": opp.deadline,
        "deadlineDays": opp.deadline_days,
        "deadlineStatus": opp.deadline_status,
        "status": opp.status,
        "verified": opp.verified,
        "lastVerified": opp.last_verified,
        "applicationUrl": opp.application_url,
        "source": opp.source,
        "trustScore": opp.trust_score,
        "isDuplicate": opp.is_duplicate,
        "canonicalId": opp.canonical_id
    }
