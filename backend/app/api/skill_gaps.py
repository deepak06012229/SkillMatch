from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User, Profile, StudentSkill
from ..services.skill_gap_engine import analyze_skill_gaps
from .deps import get_current_user

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gap Engine"])

@router.get("")
def get_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == current_user.id).all()

    analysis = analyze_skill_gaps(student_skills, profile)
    return analysis
