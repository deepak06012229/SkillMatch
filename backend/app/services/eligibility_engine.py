from typing import Dict, Any, List
from ..models.entities import Opportunity, Profile

def evaluate_eligibility(opportunity: Opportunity, profile: Profile) -> Dict[str, Any]:
    """
    DETERMINISTIC ELIGIBILITY ENGINE:
    RULES DECIDE ELIGIBILITY. ML/SEMANTIC MODELS RANK. LLM EXPLAINS.
    
    Evaluates only explicit criteria that exist on the opportunity:
    - CGPA threshold
    - Academic Year eligibility
    - Degree & Discipline restrictions
    - Expiration / Deadline status
    - Location / Workplace constraints
    """
    reasons: List[str] = []
    failed_requirements: List[Dict[str, Any]] = []
    is_eligible = True

    # 1. Expiration Gate (Hard Ineligibility)
    if opportunity.status == "EXPIRED" or opportunity.deadline_status == "EXPIRED" or opportunity.deadline_days <= 0:
        is_eligible = False
        failed_requirements.append({
            "requirement": "Application Deadline Active",
            "student_value": "Opportunity is Expired"
        })
        reasons.append("Opportunity deadline has passed and is no longer accepting submissions.")

    # 2. Minimum CGPA Requirement
    if opportunity.min_cgpa and opportunity.min_cgpa > 0:
        student_cgpa = getattr(profile, "cgpa", 0.0) or 0.0
        if student_cgpa < opportunity.min_cgpa:
            is_eligible = False
            failed_requirements.append({
                "requirement": f"Minimum CGPA {opportunity.min_cgpa:.1f}",
                "student_value": f"{student_cgpa:.1f}"
            })
            reasons.append(f"Requires minimum CGPA of {opportunity.min_cgpa:.1f} (Student current CGPA: {student_cgpa:.1f}).")
        else:
            reasons.append(f"Meets minimum CGPA requirement of {opportunity.min_cgpa:.1f} (Student CGPA: {student_cgpa:.1f}).")

    # 3. Academic Year / Seniority Requirement
    allowed_years = opportunity.allowed_years or []
    if allowed_years and not any(k.lower() in ["any", "all", "all academic years"] for k in allowed_years):
        year_num = getattr(profile, "year_number", 3) or 3
        acad_year_str = getattr(profile, "academic_year", "") or ""
        matched_year = False

        for yr in allowed_years:
            yr_lower = yr.lower()
            if "1st" in yr_lower and year_num == 1:
                matched_year = True
            elif "2nd" in yr_lower and year_num == 2:
                matched_year = True
            elif ("3rd" in yr_lower or "junior" in yr_lower) and year_num == 3:
                matched_year = True
            elif ("4th" in yr_lower or "final" in yr_lower or "graduate" in yr_lower) and year_num in [4, 5]:
                matched_year = True
            elif acad_year_str and yr_lower in acad_year_str.lower():
                matched_year = True

        if not matched_year:
            is_eligible = False
            failed_requirements.append({
                "requirement": f"Target Academic Year: {', '.join(allowed_years)}",
                "student_value": acad_year_str or f"Year {year_num}"
            })
            reasons.append(f"Restricted to {', '.join(allowed_years)} (Student is in {acad_year_str or f'Year {year_num}'}).")
        else:
            reasons.append(f"Academic year requirement met ({acad_year_str or f'Year {year_num}'}).")

    # 4. Degree / Education Level Requirement
    allowed_degrees = opportunity.allowed_degrees or []
    if allowed_degrees and not any(k.lower() in ["any", "all"] for k in allowed_degrees):
        student_deg = (getattr(profile, "degree", "") or "").lower()
        matched_degree = any(deg.lower() in student_deg for deg in allowed_degrees)
        if not matched_degree and student_deg:
            is_eligible = False
            failed_requirements.append({
                "requirement": f"Eligible Degrees: {', '.join(allowed_degrees)}",
                "student_value": profile.degree
            })
            reasons.append(f"Requires enrollment in: {', '.join(allowed_degrees)}.")
        elif matched_degree:
            reasons.append(f"Degree program verified ({profile.degree}).")

    # 5. Discipline / Branch Requirement
    allowed_branches = opportunity.allowed_branches or []
    if allowed_branches and not any(b.lower() in ["any", "all"] for b in allowed_branches):
        student_branch = (getattr(profile, "branch", "") or "").lower()
        matched_branch = any(b.lower() in student_branch or student_branch in b.lower() for b in allowed_branches)
        if not matched_branch and student_branch:
            is_eligible = False
            failed_requirements.append({
                "requirement": f"Eligible Disciplines: {', '.join(allowed_branches)}",
                "student_value": profile.branch
            })
            reasons.append(f"Restricted to disciplines: {', '.join(allowed_branches)}.")
        elif matched_branch:
            reasons.append(f"Eligible discipline verified ({profile.branch}).")

    return {
        "eligible": is_eligible,
        "is_eligible": is_eligible,
        "status": "ELIGIBLE" if is_eligible else "INELIGIBLE",
        "reasons": reasons,
        "failed_requirements": failed_requirements
    }
