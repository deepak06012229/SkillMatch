from typing import Dict, Any, List, Set, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.entities import Opportunity, Profile, StudentSkill, Project, MatchResult, User
from .eligibility_engine import evaluate_eligibility
from .skill_normalizer import normalize_skill
from .semantic_matcher import semantic_matcher

FIT_SCORE_DISCLAIMER = (
    "SkillMatch Fit Score is a multi-dimensional alignment metric calculated from your confirmed "
    "profile skills, education, and career preferences. It does not represent an employer hiring "
    "guarantee or probability of selection."
)

def calculate_match_score(
    opportunity: Opportunity,
    profile: Profile,
    student_skills: List[StudentSkill],
    student_projects: List[Project],
    student_experiences: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """
    HYBRID MATCHING ENGINE:
    RULES DECIDE ELIGIBILITY. ML/SEMANTIC MODELS RANK. LLM EXPLAINS.
    
    Fit Score Weights:
    - Skill Fit: 35%
    - Semantic Relevance: 20%
    - Project Relevance: 15%
    - Education Match: 10%
    - Career Goal Match: 10%
    - Preference Match: 10%
    """
    # 1. Deterministic Eligibility Gate
    eligibility = evaluate_eligibility(opportunity, profile)
    is_eligible = eligibility["eligible"]

    # Cold start check
    is_cold_start = len(student_skills) == 0

    # Index student skills: canonical_name_lower -> StudentSkill
    student_skill_map: Dict[str, StudentSkill] = {}
    for sk in student_skills:
        canonical, _ = normalize_skill(sk.skill_name)
        student_skill_map[canonical.lower()] = sk

    # Index project technologies
    project_skills_set: Set[str] = set()
    project_titles: List[str] = []
    for p in student_projects:
        project_titles.append(p.title)
        for s in (p.skills or []):
            canonical, _ = normalize_skill(s)
            project_skills_set.add(canonical.lower())

    # 2. Skill Matching (35% Weight)
    required_skills = opportunity.required_skills or []
    preferred_skills = opportunity.preferred_skills or []

    matched_required = []
    missing_required = []
    for s in required_skills:
        canonical, _ = normalize_skill(s)
        if canonical.lower() in student_skill_map:
            matched_required.append(canonical)
        else:
            missing_required.append(canonical)

    matched_preferred = []
    missing_preferred = []
    for s in preferred_skills:
        canonical, _ = normalize_skill(s)
        if canonical.lower() in student_skill_map:
            matched_preferred.append(canonical)
        else:
            missing_preferred.append(canonical)

    if not required_skills:
        # If opportunity has no hard required skills (e.g. general scholarship or hackathon)
        skill_score = 90
    else:
        req_ratio = len(matched_required) / len(required_skills)
        pref_ratio = (len(matched_preferred) / len(preferred_skills)) if preferred_skills else 1.0
        skill_score = int(round((req_ratio * 0.80 + pref_ratio * 0.20) * 100))

    # 3. Semantic Similarity (20% Weight)
    # Construct student profile corpus
    student_corpus = (
        f"{profile.title or ''} {profile.bio or ''} {profile.target_role or ''} "
        f"{' '.join(profile.career_goals or [])} {' '.join(project_titles)} "
        f"{' '.join(student_skill_map.keys())}"
    )
    # Construct opportunity corpus
    opp_corpus = (
        f"{opportunity.title} {opportunity.organization} {opportunity.category_label} "
        f"{opportunity.description} {opportunity.overview or ''} "
        f"{' '.join(required_skills)} {' '.join(preferred_skills)}"
    )
    semantic_sim = semantic_matcher.compute_similarity(student_corpus, opp_corpus)
    semantic_score = int(round(semantic_sim * 100))

    # 4. Project & Demonstrated Evidence Match (15% Weight)
    if not required_skills:
        project_score = 85
    else:
        demonstrated_overlap = sum(
            1 for s in required_skills
            if normalize_skill(s)[0].lower() in project_skills_set
        )
        proj_ratio = demonstrated_overlap / len(required_skills)
        project_score = min(100, int(round(proj_ratio * 85 + (15 if student_projects else 0))))

    # 5. Education & Academic Match (10% Weight)
    if not is_eligible and any("CGPA" in f["requirement"] or "Year" in f["requirement"] for f in eligibility["failed_requirements"]):
        education_score = 40
    elif profile.cgpa >= 8.5:
        education_score = 98
    elif profile.cgpa >= 7.5:
        education_score = 88
    else:
        education_score = 75

    # 6. Career Goal Alignment (10% Weight)
    career_goals = profile.career_goals or []
    target_role = (profile.target_role or "").lower()
    opp_title = (opportunity.title or "").lower()
    opp_desc = (opportunity.description or "").lower()
    opp_type = (opportunity.type or "").lower()

    career_score = 70
    if any(g.lower() in opp_title or g.lower() in opp_desc for g in career_goals):
        career_score = 96
    elif target_role and (target_role in opp_title or any(t in opp_title for t in target_role.split())):
        career_score = 94
    elif "ai" in opp_title or "machine learning" in opp_title:
        career_score = 90

    # 7. Preference Match (10% Weight)
    pref_score = 75
    student_work_pref = (profile.workplace_preference or "Remote").lower()
    opp_work_type = (opportunity.workplace_type or "Remote").lower()

    if student_work_pref == opp_work_type:
        pref_score = 95
    elif opp_work_type == "remote":
        pref_score = 90
    elif student_work_pref == "hybrid" and opp_work_type == "on-site":
        pref_score = 65
    elif student_work_pref == "remote" and opp_work_type == "on-site":
        pref_score = 45
    else:
        pref_score = 60

    preferred_types = profile.preferred_opportunity_types or []
    if preferred_types:
        if opportunity.type in preferred_types:
            pref_score = min(100, pref_score + 5)
        else:
            pref_score = max(30, pref_score - 10)

    # 8. Deterministic Composite Fit Score
    raw_fit = (
        skill_score * 0.35 +
        semantic_score * 0.20 +
        project_score * 0.15 +
        education_score * 0.10 +
        career_score * 0.10 +
        pref_score * 0.10
    )

    # Hard eligibility penalty: ineligible listings are strictly capped at 48%
    if not is_eligible:
        raw_fit = min(raw_fit * 0.50, 48.0)

    fit_score = max(25, min(99, int(round(raw_fit))))

    # 9. Readiness Score Calculation (Separate from Fit Score)
    # Measures student preparation: evidence strength + proficiency + gap penalty
    evidence_points = 0
    proficiency_sum = 0
    matched_count = len(matched_required) + len(matched_preferred)

    for s_name in (matched_required + matched_preferred):
        sk_obj = student_skill_map.get(s_name.lower())
        if sk_obj:
            if sk_obj.evidence_type in ["demonstrated", "verified"] or s_name.lower() in project_skills_set:
                evidence_points += 1
            if sk_obj.proficiency == "Advanced":
                proficiency_sum += 100
            elif sk_obj.proficiency == "Intermediate":
                proficiency_sum += 80
            else:
                proficiency_sum += 60

    evidence_ratio = (evidence_points / matched_count) if matched_count > 0 else 0.5
    avg_proficiency = (proficiency_sum / matched_count) if matched_count > 0 else 75
    base_readiness = profile.readiness_score or 80

    critical_gaps = len(missing_required)
    readiness_calc = int(
        base_readiness * 0.35 +
        avg_proficiency * 0.35 +
        (evidence_ratio * 100) * 0.30 -
        (critical_gaps * 4)
    )
    readiness_score = max(35, min(98, readiness_calc))

    # 10. Explainable "Why You Match"
    why_you_match: List[str] = []
    for s in matched_required[:3]:
        sk_obj = student_skill_map.get(s.lower())
        if s.lower() in project_skills_set:
            why_you_match.append(f"{s} verified in your profile (demonstrated in active project)")
        elif sk_obj:
            why_you_match.append(f"{s} verified in your profile ({sk_obj.proficiency} level)")

    if len(matched_required) == len(required_skills) and len(required_skills) > 0:
        why_you_match.append(f"100% of required technical skills matched ({len(required_skills)}/{len(required_skills)})")
    elif len(matched_required) > 0:
        why_you_match.append(f"Matched {len(matched_required)} of {len(required_skills)} core technical requirements")

    if is_eligible:
        why_you_match.append(f"Academic criteria verified (CGPA {profile.cgpa:.1f} meets requirement for {profile.degree})")

    if student_work_pref == opp_work_type or opp_work_type == "remote":
        why_you_match.append(f"Workplace mode aligns with your preference ({opportunity.workplace_type})")

    if career_score >= 90:
        why_you_match.append(f"Directly matches your stated career goal '{profile.target_role}'")

    # 11. Categorized "What's Missing"
    what_missing = {
        "critical": missing_required[:3],
        "important": missing_preferred[:2],
        "optional": ["Cloud deployment", "CI/CD basics"] if not missing_preferred else missing_preferred[2:4]
    }

    # 12. Controlled Diversity & Exploration Tag
    if fit_score >= 88:
        exploration_tag = "Strong Match"
    elif semantic_score >= 75 and len(missing_required) <= 1:
        exploration_tag = "Adjacent Domain"
    elif fit_score >= 70:
        exploration_tag = "Skill Expansion"
    else:
        exploration_tag = "Emerging Opportunity"

    return {
        "fit_score": fit_score,
        "is_eligible": is_eligible,
        "eligibility_status": eligibility["status"],
        "eligibility_reasons": eligibility["reasons"],
        "failed_requirements": eligibility["failed_requirements"],
        "readiness_score": readiness_score,
        "trust_score": opportunity.trust_score,
        "is_cold_start": is_cold_start,
        "exploration_tag": exploration_tag,
        "breakdown": {
            "skills": skill_score,
            "semantic_relevance": semantic_score,
            "projects": project_score,
            "education": education_score,
            "career_goal": career_score,
            "preferences": pref_score
        },
        "why_you_match": why_you_match,
        "what_you_are_missing": what_missing,
        "matched_skills": matched_required + matched_preferred,
        "missing_skills": missing_required + missing_preferred,
        "score_semantics": "Opportunity alignment with available student profile information",
        "disclaimer": FIT_SCORE_DISCLAIMER
    }

def get_cached_or_compute_match(
    db: Session,
    opportunity: Opportunity,
    current_user: User,
    profile: Profile,
    student_skills: List[StudentSkill],
    student_projects: List[Project],
    force_recalculate: bool = False
) -> Dict[str, Any]:
    """
    Retrieves cached MatchResult or executes deterministic calculation and writes to cache.
    """
    if not force_recalculate:
        cached = db.query(MatchResult).filter(
            MatchResult.user_id == current_user.id,
            MatchResult.opportunity_id == opportunity.id
        ).first()

        if cached and cached.breakdown:
            return {
                "fit_score": cached.fit_score,
                "is_eligible": cached.is_eligible,
                "eligibility_status": "ELIGIBLE" if cached.is_eligible else "INELIGIBLE",
                "eligibility_reasons": cached.eligibility_reasons or [],
                "failed_requirements": cached.failed_requirements or [],
                "readiness_score": cached.readiness_score,
                "trust_score": opportunity.trust_score,
                "is_cold_start": len(student_skills) == 0,
                "exploration_tag": "Strong Match" if cached.fit_score >= 88 else "Skill Expansion",
                "breakdown": cached.breakdown,
                "why_you_match": cached.why_you_match or [],
                "what_you_are_missing": cached.what_you_are_missing or {},
                "matched_skills": [],
                "missing_skills": [],
                "score_semantics": "Opportunity alignment with available student profile information",
                "disclaimer": FIT_SCORE_DISCLAIMER
            }

    # Compute fresh match
    computed = calculate_match_score(opportunity, profile, student_skills, student_projects)

    # Cache result in database
    existing_record = db.query(MatchResult).filter(
        MatchResult.user_id == current_user.id,
        MatchResult.opportunity_id == opportunity.id
    ).first()

    if existing_record:
        existing_record.fit_score = computed["fit_score"]
        existing_record.is_eligible = computed["is_eligible"]
        existing_record.readiness_score = computed["readiness_score"]
        existing_record.breakdown = computed["breakdown"]
        existing_record.eligibility_reasons = computed["eligibility_reasons"]
        existing_record.failed_requirements = computed["failed_requirements"]
        existing_record.why_you_match = computed["why_you_match"]
        existing_record.what_you_are_missing = computed["what_you_are_missing"]
        existing_record.updated_at = datetime.utcnow()
    else:
        new_result = MatchResult(
            user_id=current_user.id,
            opportunity_id=opportunity.id,
            fit_score=computed["fit_score"],
            is_eligible=computed["is_eligible"],
            readiness_score=computed["readiness_score"],
            breakdown=computed["breakdown"],
            eligibility_reasons=computed["eligibility_reasons"],
            failed_requirements=computed["failed_requirements"],
            why_you_match=computed["why_you_match"],
            what_you_are_missing=computed["what_you_are_missing"]
        )
        db.add(new_result)

    db.commit()
    return computed
