from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.entities import StudentSkill, SkillEvidence, Skill, SkillAlias
from ..schemas.all_schemas import StudentSkillCreate, StudentSkillUpdate, SkillEvidenceCreate
from .skill_normalizer import normalize_skill, SKILL_ALIASES, SKILL_CATEGORIES
from ..common.exceptions import NotFoundException

def get_student_skills(db: Session, user_id: str) -> List[Dict[str, Any]]:
    skills = db.query(StudentSkill).filter(StudentSkill.user_id == user_id).all()
    results = []
    for s in skills:
        ev_items = [
            {
                "id": ev.id,
                "evidence_type": ev.evidence_type,
                "title": ev.title,
                "description": ev.description,
                "url": ev.url,
                "verification_status": ev.verification_status,
                "created_at": ev.created_at
            }
            for ev in s.evidence_items
        ]
        results.append({
            "id": s.id,
            "user_id": s.user_id,
            "name": s.skill_name,
            "skill_name": s.skill_name,
            "category": s.category,
            "proficiency": s.proficiency,
            "confidence": s.confidence,
            "evidence_type": s.evidence_type,
            "freshness": s.freshness,
            "last_demonstrated": s.last_demonstrated,
            "evidence": s.evidence_details or {
                "projectsCount": len(ev_items) or 1,
                "certificationsCount": 1 if s.proficiency == "Advanced" else 0,
                "activity": s.last_demonstrated or "Active this month"
            },
            "evidence_items": ev_items
        })
    return results

def add_student_skill(db: Session, user_id: str, data: StudentSkillCreate) -> Dict[str, Any]:
    canonical, cat = normalize_skill(data.skill_name)
    existing = db.query(StudentSkill).filter(
        StudentSkill.user_id == user_id,
        StudentSkill.skill_name == canonical
    ).first()

    if existing:
        existing.proficiency = data.proficiency or existing.proficiency
        existing.confidence = data.confidence or existing.confidence
        existing.category = cat if cat != "General" else (data.category or existing.category)
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "name": existing.skill_name,
            "category": existing.category,
            "proficiency": existing.proficiency,
            "confidence": existing.confidence,
            "evidence_type": existing.evidence_type,
            "freshness": existing.freshness,
            "last_demonstrated": existing.last_demonstrated
        }

    new_skill = StudentSkill(
        user_id=user_id,
        skill_name=canonical,
        category=cat if cat != "General" else data.category,
        proficiency=data.proficiency or "Intermediate",
        confidence=data.confidence or 80,
        evidence_type=data.evidence_type or "claimed",
        freshness=data.freshness or "Fresh",
        last_demonstrated="Recently",
        evidence_details={"notes": "Added directly by student."}
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return {
        "id": new_skill.id,
        "name": new_skill.skill_name,
        "category": new_skill.category,
        "proficiency": new_skill.proficiency,
        "confidence": new_skill.confidence,
        "evidence_type": new_skill.evidence_type,
        "freshness": new_skill.freshness,
        "last_demonstrated": new_skill.last_demonstrated
    }

def update_student_skill(db: Session, user_id: str, skill_id: str, data: StudentSkillUpdate) -> Dict[str, Any]:
    skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.user_id == user_id).first()
    if not skill:
        raise NotFoundException("Skill", "Student skill not found.")

    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(skill, field, val)

    db.commit()
    db.refresh(skill)
    return {
        "id": skill.id,
        "name": skill.skill_name,
        "category": skill.category,
        "proficiency": skill.proficiency,
        "confidence": skill.confidence,
        "evidence_type": skill.evidence_type,
        "freshness": skill.freshness,
        "last_demonstrated": skill.last_demonstrated
    }

def delete_student_skill(db: Session, user_id: str, skill_id: str) -> bool:
    skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.user_id == user_id).first()
    if not skill:
        raise NotFoundException("Skill", "Student skill not found.")
    db.delete(skill)
    db.commit()
    return True

def add_skill_evidence(db: Session, user_id: str, skill_id: str, data: SkillEvidenceCreate) -> SkillEvidence:
    skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.user_id == user_id).first()
    if not skill:
        raise NotFoundException("Skill", "Student skill not found.")

    ev = SkillEvidence(
        student_skill_id=skill.id,
        evidence_type=data.evidence_type,
        title=data.title,
        description=data.description,
        url=data.url,
        verification_status=data.verification_status or "demonstrated"
    )
    # Upgrade evidence_type on parent skill if demonstrated
    skill.evidence_type = "demonstrated"
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev
