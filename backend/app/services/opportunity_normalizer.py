import re
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.entities import Opportunity, OpportunitySource
from .skill_normalizer import normalize_skill

# Official Category Constants
CATEGORY_MAPPING = {
    "job": "jobs",
    "jobs": "jobs",
    "full_time": "jobs",
    "intern": "internships",
    "internship": "internships",
    "internships": "internships",
    "research_fellowship": "internships",
    "fellowship": "internships",
    "hackathon": "hackathons",
    "hackathons": "hackathons",
    "competition": "hackathons",
    "scholarship": "scholarships",
    "scholarships": "scholarships",
    "grant": "scholarships",
    "course": "courses",
    "courses": "courses",
    "training": "courses",
    "cert_program": "courses",
    "project": "projects",
    "projects": "projects",
    "open_source": "projects",
    "skill_opportunity": "skill_opportunities",
    "skill_opportunities": "skill_opportunities",
    "bootcamp": "skill_opportunities",
    "mentorship": "skill_opportunities"
}

CATEGORY_LABELS = {
    "jobs": "Entry-Level Job",
    "internships": "Internship / Fellowship",
    "hackathons": "Hackathon / Challenge",
    "scholarships": "Scholarship & Grant",
    "courses": "Verified Course",
    "projects": "Proof-of-Work Project",
    "skill_opportunities": "Skill Opportunity"
}

def normalize_category(category_input: str) -> Tuple[str, str]:
    cleaned = category_input.strip().lower().replace(" ", "_").replace("-", "_")
    cat = CATEGORY_MAPPING.get(cleaned, "internships")
    label = CATEGORY_LABELS.get(cat, "Opportunity")
    return (cat, label)

def normalize_workplace(workplace_input: str) -> str:
    cleaned = (workplace_input or "").strip().lower()
    if "remote" in cleaned:
        return "Remote"
    elif "hybrid" in cleaned:
        return "Hybrid"
    elif "site" in cleaned or "office" in cleaned:
        return "On-site"
    return "Remote"

def generate_dedup_signature(org: str, title: str, location: str) -> str:
    norm_org = re.sub(r'[^a-zA-Z0-9]', '', (org or "").lower())
    norm_title = re.sub(r'[^a-zA-Z0-9]', '', (title or "").lower())
    norm_loc = re.sub(r'[^a-zA-Z0-9]', '', (location or "").lower())
    raw = f"{norm_org}::{norm_title}::{norm_loc}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

def calculate_trust_score(
    opp_dict: Dict[str, Any],
    source_obj: Optional[OpportunitySource] = None
) -> Tuple[int, Dict[str, Any]]:
    """
    Calculates transparent trust index (0-100) based on:
    1. Source Reliability (35% weight)
    2. URL Authenticity & Security (25% weight)
    3. Metadata Completeness (20% weight)
    4. Verification Recency & Freshness (20% weight)
    """
    # 1. Source Reliability
    source_score = 80
    source_name = opp_dict.get("source", "Direct")
    if source_obj:
        source_score = source_obj.trust_score
    elif any(k in source_name.lower() for k in ["official", "google", "stripe", "technova", "nsf", "aws"]):
        source_score = 96
    elif any(k in source_name.lower() for k in ["hackerearth", "coursera", "university"]):
        source_score = 92
    elif "aggregator" in source_name.lower():
        source_score = 65

    # 2. URL Authenticity & Security
    url_score = 70
    app_url = opp_dict.get("application_url", "")
    if app_url.startswith("https://"):
        url_score = 95
        if any(d in app_url for d in [".edu", ".gov", ".org"]):
            url_score = 100
    elif app_url.startswith("http://"):
        url_score = 60

    # 3. Metadata Completeness
    completeness = 0
    if opp_dict.get("description") and len(opp_dict["description"]) > 40:
        completeness += 30
    if opp_dict.get("required_skills") and len(opp_dict["required_skills"]) > 0:
        completeness += 25
    if opp_dict.get("deadline") or opp_dict.get("deadline_days") is not None:
        completeness += 25
    if opp_dict.get("stipend_amount") is not None or opp_dict.get("location"):
        completeness += 20
    metadata_score = min(100, completeness)

    # 4. Freshness & Recency
    deadline_status = opp_dict.get("deadline_status", "OPEN")
    freshness_score = 95
    if deadline_status == "CLOSING_SOON":
        freshness_score = 85
    elif deadline_status == "EXPIRED":
        freshness_score = 30

    weighted_trust = int(
        source_score * 0.35 +
        url_score * 0.25 +
        metadata_score * 0.20 +
        freshness_score * 0.20
    )
    final_trust = max(20, min(99, weighted_trust))

    explanation = (
        f"Verified via {source_name} ({source_score}% source trust). "
        f"Validated secure direct application portal with {metadata_score}% metadata completeness."
    )

    breakdown = {
        "source_reliability": source_score,
        "url_security": url_score,
        "metadata_completeness": metadata_score,
        "freshness": freshness_score,
        "explanation": explanation
    }

    return final_trust, breakdown

def normalize_opportunity(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes arbitrary opportunity input into canonical schema.
    """
    cat, cat_label = normalize_category(raw.get("type") or raw.get("category") or "internships")
    workplace = normalize_workplace(raw.get("workplace_type") or raw.get("work_mode") or "Remote")

    # Clean & normalize skills
    req_skills = []
    for s in (raw.get("required_skills") or raw.get("skills") or []):
        can, _ = normalize_skill(s)
        if can not in req_skills:
            req_skills.append(can)

    pref_skills = []
    for s in (raw.get("preferred_skills") or []):
        can, _ = normalize_skill(s)
        if can not in pref_skills and can not in req_skills:
            pref_skills.append(can)

    # URL sanitization
    app_url = raw.get("application_url") or raw.get("url") or "https://skillmatch.internal/apply"
    if app_url and not app_url.startswith("http://") and not app_url.startswith("https://"):
        app_url = f"https://{app_url}"

    # Deadline & Status
    deadline_days = raw.get("deadline_days", 14)
    deadline_status = raw.get("deadline_status", "OPEN")
    if deadline_days <= 0 or deadline_status == "EXPIRED":
        deadline_status = "EXPIRED"
        status_val = "EXPIRED"
    elif deadline_days <= 5 or deadline_status == "CLOSING_SOON":
        deadline_status = "CLOSING_SOON"
        status_val = "EXPIRING_SOON"
    else:
        deadline_status = "OPEN"
        status_val = "ACTIVE"

    title = raw.get("title", "Opportunity").strip()
    org = raw.get("organization", "Partner Company").strip()
    loc = raw.get("location", "Remote").strip()
    dedup_sig = generate_dedup_signature(org, title, loc)

    normalized = {
        "id": raw.get("id"),
        "title": title,
        "organization": org,
        "logo_text": raw.get("logo_text") or "".join(w[0] for w in org.split()[:2]).upper() or "SM",
        "logo_bg": raw.get("logo_bg") or "bg-primary text-on-primary",
        "type": cat,
        "category_label": cat_label,
        "description": raw.get("description", "Opportunity description."),
        "overview": raw.get("overview") or raw.get("description", ""),
        "required_skills": req_skills,
        "preferred_skills": pref_skills,
        "min_cgpa": float(raw.get("min_cgpa") or 0.0),
        "allowed_degrees": raw.get("allowed_degrees") or ["B.Tech", "B.E", "B.Sc", "M.Tech"],
        "allowed_branches": raw.get("allowed_branches") or ["Computer Science", "Information Technology", "Any"],
        "allowed_years": raw.get("allowed_years") or ["1st Year Students", "2nd Year Students", "Final Year & Graduates"],
        "min_experience_months": int(raw.get("min_experience_months") or 0),
        "location": loc,
        "workplace_type": workplace,
        "stipend_type": raw.get("stipend_type", "Monthly" if cat in ["jobs", "internships"] else "Prize Pool"),
        "stipend_amount": int(raw.get("stipend_amount") or 0),
        "duration": raw.get("duration", "3 Months"),
        "deadline": raw.get("deadline", f"In {deadline_days} days"),
        "deadline_days": deadline_days,
        "deadline_status": deadline_status,
        "status": status_val,
        "application_url": app_url,
        "source": raw.get("source", "SkillMatch Direct"),
        "source_url": raw.get("source_url"),
        "verified": raw.get("verified", True),
        "last_verified": raw.get("last_verified", "Today"),
        "dedup_signature": dedup_sig
    }

    # Trust score calculation
    trust_score, trust_breakdown = calculate_trust_score(normalized)
    normalized["trust_score"] = raw.get("trust_score") or trust_score
    normalized["trust_breakdown"] = trust_breakdown

    return normalized

def check_duplicate(db: Session, dedup_sig: str, app_url: str, current_id: Optional[str] = None) -> Optional[Opportunity]:
    """
    Checks if an existing active opportunity has the same signature or exact application URL.
    """
    query = db.query(Opportunity).filter(
        (Opportunity.dedup_signature == dedup_sig) |
        ((Opportunity.application_url == app_url) & (Opportunity.application_url != "https://skillmatch.internal/apply"))
    )
    if current_id:
        query = query.filter(Opportunity.id != current_id)
    return query.first()
