from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models.entities import User, Profile, Education, Experience, Project, Certification
from ..schemas.all_schemas import (
    ProfileUpdate, ProfilePatch, PreferencesUpdate,
    EducationCreate, EducationUpdate,
    ExperienceCreate, ExperienceUpdate,
    ProjectCreate, ProjectUpdate,
    CertificationCreate
)
from ..common.exceptions import NotFoundException

def get_student_profile(db: Session, user: User) -> Dict[str, Any]:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise NotFoundException("Profile", f"Profile for student ID {user.id} not found.")

    initials = profile.initials or (user.full_name.split(" ")[0][0] + (user.full_name.split(" ")[-1][0] if " " in user.full_name else ""))

    return {
        "id": profile.id,
        "user_id": user.id,
        "full_name": user.full_name,
        "name": user.full_name,
        "email": user.email,
        "title": profile.title,
        "avatar_url": profile.avatar_url,
        "initials": initials,
        "phone": profile.phone or "+91 98765 43210",
        "college": profile.college,
        "degree": profile.degree,
        "branch": profile.branch,
        "academic_year": profile.academic_year,
        "year_number": profile.year_number,
        "cgpa": profile.cgpa,
        "graduation_year": profile.graduation_year,
        "bio": profile.bio,
        "location": profile.location,
        "workplace_preference": profile.workplace_preference,
        "career_goals": profile.career_goals or ["AI/ML Internship", "Data Science"],
        "target_role": profile.target_role,
        "preferred_opportunity_types": profile.preferred_opportunity_types or ["internships", "hackathons", "projects"],
        "preferred_locations": profile.preferred_locations or ["Bangalore", "Remote", "Hybrid"],
        "readiness_score": profile.readiness_score,
        # Frontend compatibility helpers
        "readinessScore": profile.readiness_score,
        "careerPreferences": {
            "primaryGoal": profile.target_role,
            "remotePreference": profile.workplace_preference,
            "targetRoles": profile.career_goals or ["AI/ML Engineer"],
            "preferredOpportunityTypes": profile.preferred_opportunity_types or ["internships", "hackathons", "projects"]
        },
        "academic": {
            "degree": profile.degree,
            "institution": profile.college,
            "branch": profile.branch,
            "cgpa": profile.cgpa,
            "year": profile.academic_year,
            "graduationYear": profile.graduation_year
        }
    }

def update_student_profile(db: Session, user: User, data: ProfileUpdate) -> Dict[str, Any]:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise NotFoundException("Profile", "Profile not found.")

    if data.full_name:
        user.full_name = data.full_name
        profile.initials = (data.full_name.split(" ")[0][0] + (data.full_name.split(" ")[-1][0] if " " in data.full_name else "")).upper()

    for field, val in data.model_dump(exclude_unset=True).items():
        if field == "full_name":
            continue
        if hasattr(profile, field) and val is not None:
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return get_student_profile(db, user)

def patch_student_profile(db: Session, user: User, data: ProfilePatch) -> Dict[str, Any]:
    return update_student_profile(db, user, data)

def update_student_preferences(db: Session, user: User, prefs: PreferencesUpdate) -> Dict[str, Any]:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise NotFoundException("Profile", "Profile not found.")

    for field, val in prefs.model_dump(exclude_unset=True).items():
        if hasattr(profile, field) and val is not None:
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return get_student_profile(db, user)

# =============================================================================
# EDUCATION CRUD
# =============================================================================

def list_educations(db: Session, user_id: str) -> List[Education]:
    return db.query(Education).filter(Education.user_id == user_id).order_by(Education.created_at.desc()).all()

def create_education(db: Session, user_id: str, data: EducationCreate) -> Education:
    edu = Education(user_id=user_id, **data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

def update_education(db: Session, user_id: str, edu_id: str, data: EducationUpdate) -> Education:
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == user_id).first()
    if not edu:
        raise NotFoundException("Education", "Education record not found.")
    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(edu, field, val)
    db.commit()
    db.refresh(edu)
    return edu

def delete_education(db: Session, user_id: str, edu_id: str) -> bool:
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == user_id).first()
    if not edu:
        raise NotFoundException("Education", "Education record not found.")
    db.delete(edu)
    db.commit()
    return True

# =============================================================================
# EXPERIENCE CRUD
# =============================================================================

def list_experiences(db: Session, user_id: str) -> List[Experience]:
    return db.query(Experience).filter(Experience.user_id == user_id).order_by(Experience.created_at.desc()).all()

def create_experience(db: Session, user_id: str, data: ExperienceCreate) -> Experience:
    exp = Experience(user_id=user_id, **data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

def update_experience(db: Session, user_id: str, exp_id: str, data: ExperienceUpdate) -> Experience:
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == user_id).first()
    if not exp:
        raise NotFoundException("Experience", "Experience record not found.")
    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(exp, field, val)
    db.commit()
    db.refresh(exp)
    return exp

def delete_experience(db: Session, user_id: str, exp_id: str) -> bool:
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == user_id).first()
    if not exp:
        raise NotFoundException("Experience", "Experience record not found.")
    db.delete(exp)
    db.commit()
    return True

# =============================================================================
# PROJECT CRUD
# =============================================================================

def list_projects(db: Session, user_id: str) -> List[Project]:
    return db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()

def create_project(db: Session, user_id: str, data: ProjectCreate) -> Project:
    proj = Project(user_id=user_id, **data.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

def update_project(db: Session, user_id: str, proj_id: str, data: ProjectUpdate) -> Project:
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == user_id).first()
    if not proj:
        raise NotFoundException("Project", "Project not found.")
    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(proj, field, val)
    db.commit()
    db.refresh(proj)
    return proj

def delete_project(db: Session, user_id: str, proj_id: str) -> bool:
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == user_id).first()
    if not proj:
        raise NotFoundException("Project", "Project not found.")
    db.delete(proj)
    db.commit()
    return True

# =============================================================================
# CERTIFICATION CRUD
# =============================================================================

def list_certifications(db: Session, user_id: str) -> List[Certification]:
    return db.query(Certification).filter(Certification.user_id == user_id).order_by(Certification.created_at.desc()).all()

def create_certification(db: Session, user_id: str, data: CertificationCreate) -> Certification:
    cert = Certification(user_id=user_id, **data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

def delete_certification(db: Session, user_id: str, cert_id: str) -> bool:
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == user_id).first()
    if not cert:
        raise NotFoundException("Certification", "Certification not found.")
    db.delete(cert)
    db.commit()
    return True
