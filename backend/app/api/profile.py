import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User
from ..schemas.all_schemas import (
    ProfileOut, ProfileUpdate, ProfilePatch, PreferencesUpdate,
    EducationCreate, EducationUpdate, EducationOut,
    ExperienceCreate, ExperienceUpdate, ExperienceOut,
    ProjectCreate, ProjectUpdate, ProjectOut,
    CertificationCreate, CertificationOut
)
from ..services.profile_service import (
    get_student_profile, update_student_profile, patch_student_profile, update_student_preferences,
    list_educations, create_education, update_education, delete_education,
    list_experiences, create_experience, update_experience, delete_experience,
    list_projects, create_project, update_project, delete_project,
    list_certifications, create_certification, delete_certification
)
from .deps import get_current_user
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/profile", tags=["Student Profile"])

# =============================================================================
# MAIN PROFILE ROUTES
# =============================================================================

@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_student_profile(db, current_user)

@router.put("", response_model=ProfileOut)
def update_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_student_profile(db, current_user, req)

@router.patch("", response_model=ProfileOut)
def patch_profile(
    req: ProfilePatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return patch_student_profile(db, current_user, req)

@router.put("/preferences", response_model=ProfileOut)
def update_preferences(
    req: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_student_preferences(db, current_user, req)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Allowed image extensions: .jpg, .jpeg, .png, .webp")

    filename = f"avatar_{current_user.id}_{file.filename}"
    save_path = UPLOAD_DIR / "avatars" / filename
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    avatar_url = f"/api/uploads/avatars/{filename}"
    update_student_profile(db, current_user, ProfileUpdate(avatar_url=avatar_url))

    return {"status": "success", "avatar_url": avatar_url}

# =============================================================================
# EDUCATION SUB-RESOURCE CRUD
# =============================================================================

@router.get("/education", response_model=List[EducationOut])
def get_educations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return list_educations(db, current_user.id)

@router.post("/education", response_model=EducationOut)
def add_education(
    data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_education(db, current_user.id, data)

@router.put("/education/{edu_id}", response_model=EducationOut)
def edit_education(
    edu_id: str,
    data: EducationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_education(db, current_user.id, edu_id, data)

@router.delete("/education/{edu_id}")
def remove_education(
    edu_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_education(db, current_user.id, edu_id)
    return {"status": "success", "message": "Education record deleted."}

# =============================================================================
# EXPERIENCE SUB-RESOURCE CRUD
# =============================================================================

@router.get("/experience", response_model=List[ExperienceOut])
def get_experiences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return list_experiences(db, current_user.id)

@router.post("/experience", response_model=ExperienceOut)
def add_experience(
    data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_experience(db, current_user.id, data)

@router.put("/experience/{exp_id}", response_model=ExperienceOut)
def edit_experience(
    exp_id: str,
    data: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_experience(db, current_user.id, exp_id, data)

@router.delete("/experience/{exp_id}")
def remove_experience(
    exp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_experience(db, current_user.id, exp_id)
    return {"status": "success", "message": "Experience record deleted."}

# =============================================================================
# PROJECT SUB-RESOURCE CRUD
# =============================================================================

@router.get("/projects", response_model=List[ProjectOut])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return list_projects(db, current_user.id)

@router.post("/projects", response_model=ProjectOut)
def add_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_project(db, current_user.id, data)

@router.put("/projects/{proj_id}", response_model=ProjectOut)
def edit_project(
    proj_id: str,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_project(db, current_user.id, proj_id, data)

@router.delete("/projects/{proj_id}")
def remove_project(
    proj_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_project(db, current_user.id, proj_id)
    return {"status": "success", "message": "Project deleted."}

# =============================================================================
# CERTIFICATION SUB-RESOURCE CRUD
# =============================================================================

@router.get("/certifications", response_model=List[CertificationOut])
def get_certifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return list_certifications(db, current_user.id)

@router.post("/certifications", response_model=CertificationOut)
def add_certification(
    data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_certification(db, current_user.id, data)

@router.delete("/certifications/{cert_id}")
def remove_certification(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_certification(db, current_user.id, cert_id)
    return {"status": "success", "message": "Certification deleted."}
