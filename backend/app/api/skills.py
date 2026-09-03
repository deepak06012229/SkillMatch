from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User
from ..schemas.all_schemas import StudentSkillCreate, StudentSkillUpdate, SkillEvidenceCreate
from ..services.skill_service import (
    get_student_skills, add_student_skill, update_student_skill,
    delete_student_skill, add_skill_evidence
)
from ..services.skill_normalizer import SKILL_ALIASES, SKILL_CATEGORIES
from .deps import get_current_user

router = APIRouter(prefix="/skills", tags=["Skill Intelligence"])

@router.get("/canonical")
def get_canonical_skills():
    return {
        "skills": sorted(list(set(SKILL_ALIASES.values()))),
        "categories": SKILL_CATEGORIES
    }

@router.get("/my")
def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_student_skills(db, current_user.id)

@router.post("/my")
def add_my_skill(
    req: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return add_student_skill(db, current_user.id, req)

@router.put("/my/{skill_id}")
def edit_my_skill(
    skill_id: str,
    req: StudentSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_student_skill(db, current_user.id, skill_id, req)

@router.delete("/my/{skill_id}")
def remove_my_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_student_skill(db, current_user.id, skill_id)
    return {"status": "success", "message": "Skill removed from profile."}

@router.post("/my/{skill_id}/evidence")
def attach_skill_evidence(
    skill_id: str,
    req: SkillEvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ev = add_skill_evidence(db, current_user.id, skill_id, req)
    return {"status": "success", "evidence_id": ev.id, "message": "Evidence attached to skill."}
