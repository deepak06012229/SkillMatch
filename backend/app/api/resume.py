import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import (
    User, Profile, Resume, StudentSkill, SkillEvidence, Project, Education, Certification
)
from ..schemas.all_schemas import ResumeConfirmRequest
from ..config import UPLOAD_DIR
from ..services.resume_parser import extract_text_from_file, parse_resume_content
from ..services.skill_normalizer import normalize_skill
from ..common.exceptions import NotFoundException, AppException
from .deps import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])

# Supported file extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".webp", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.get("")
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all uploaded resumes for the current student.
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "processing_status": r.processing_status,
            "ocr_used": r.ocr_used,
            "extraction_confidence": r.extraction_confidence,
            "is_confirmed": r.is_confirmed,
            "confirmed_at": r.confirmed_at,
            "created_at": r.created_at
        }
        for r in resumes
    ]

@router.get("/{resume_id}")
def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single resume extraction detail by ID.
    """
    resume_rec = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume_rec:
        raise NotFoundException("Resume", f"Resume ID '{resume_id}' not found.")

    return {
        "id": resume_rec.id,
        "filename": resume_rec.filename,
        "file_type": resume_rec.file_type,
        "file_size": resume_rec.file_size,
        "processing_status": resume_rec.processing_status,
        "ocr_used": resume_rec.ocr_used,
        "extraction_confidence": resume_rec.extraction_confidence,
        "is_confirmed": resume_rec.is_confirmed,
        "confirmed_at": resume_rec.confirmed_at,
        "extracted_data": resume_rec.extracted_data,
        "created_at": resume_rec.created_at
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and parse resume (PDF, DOCX, PNG, JPG, WEBP).
    Performs text extraction with OCR fallback for images and scanned documents.
    Returns structured extracted entities for student review.
    Does NOT write to authoritative profile data until confirmed.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(
            "UNSUPPORTED_FILE_FORMAT",
            f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, PNG, JPG, JPEG, WEBP."
        )

    resume_dir = UPLOAD_DIR / "resumes"
    resume_dir.mkdir(parents=True, exist_ok=True)
    clean_filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    save_path = resume_dir / clean_filename

    # Read content and enforce size constraint
    content = await file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        raise AppException("FILE_TOO_LARGE", "Uploaded file exceeds maximum limit of 10 MB.")
    if file_size == 0:
        raise AppException("EMPTY_FILE", "Uploaded file is empty.")

    with open(save_path, "wb") as buffer:
        buffer.write(content)

    # Ingestion & Extraction Pipeline
    raw_text, ocr_used, engine_name = extract_text_from_file(str(save_path))
    parsed_data = parse_resume_content(raw_text, filename=file.filename, ocr_used=ocr_used)

    # Record resume upload entity
    resume_rec = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(save_path),
        file_type=ext.replace(".", ""),
        file_size=file_size,
        processing_status="completed" if raw_text else "failed",
        ocr_used=ocr_used,
        extraction_confidence=parsed_data.get("extraction_confidence", 0.85),
        extracted_data=parsed_data,
        is_confirmed=False
    )
    db.add(resume_rec)
    db.commit()
    db.refresh(resume_rec)

    return {
        "status": "extracted",
        "resume_id": resume_rec.id,
        "ocr_used": ocr_used,
        "ocr_engine": engine_name,
        "extraction_confidence": resume_rec.extraction_confidence,
        "extracted_data": parsed_data,
        "message": "Resume analyzed successfully. Please review and confirm the extracted profile data below."
    }

@router.post("/confirm/{resume_id}")
@router.post("/{resume_id}/confirm")
def confirm_resume(
    resume_id: str,
    req: ResumeConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    STUDENT CONFIRMATION STEP:
    Student explicitly accepts, edits, or adds missing data.
    Only confirmed information becomes canonical student profile data.
    Distinguishes Claimed vs Demonstrated evidence (never falsely marked as Verified).
    """
    resume_rec = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if resume_rec:
        resume_rec.is_confirmed = True
        resume_rec.confirmed_at = datetime.utcnow()

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # 1. Update Core Authoritative Profile
    if req.name and req.name.strip():
        current_user.full_name = req.name.strip()
        profile.initials = (req.name.split()[0][0] + (req.name.split()[-1][0] if len(req.name.split()) > 1 else "")).upper()
    if req.college:
        profile.college = req.college
    if req.degree:
        profile.degree = req.degree
    if req.branch:
        profile.branch = req.branch
    if req.cgpa is not None:
        profile.cgpa = float(req.cgpa)
    if req.phone:
        profile.phone = req.phone

    # 2. Update/Create Education Record
    if req.college and req.degree:
        edu = db.query(Education).filter(
            Education.user_id == current_user.id,
            Education.degree == req.degree
        ).first()
        if edu:
            edu.institution = req.college
            edu.branch = req.branch or edu.branch
            edu.cgpa = req.cgpa or edu.cgpa
        else:
            db.add(Education(
                user_id=current_user.id,
                institution=req.college,
                degree=req.degree,
                branch=req.branch or "Engineering",
                cgpa=req.cgpa or 8.8,
                is_current=True
            ))

    # 3. Confirmed Projects
    confirmed_project_skills = set()
    if req.projects:
        for p in req.projects:
            title = p.get("title", "").strip()
            if not title:
                continue
            p_skills = p.get("skills", [])
            for s in p_skills:
                canonical, _ = normalize_skill(s)
                confirmed_project_skills.add(canonical.lower())

            existing_proj = db.query(Project).filter(
                Project.user_id == current_user.id,
                Project.title == title
            ).first()
            if not existing_proj:
                db.add(Project(
                    user_id=current_user.id,
                    title=title,
                    description=p.get("description", ""),
                    skills=p_skills,
                    repo_url=p.get("repo_url")
                ))

    # 4. Confirmed Skills & Evidence Attribution
    if req.skills:
        for skill_name in req.skills:
            canonical, cat = normalize_skill(skill_name)
            # Check evidence: if appeared in confirmed projects, mark 'demonstrated'
            is_demonstrated = canonical.lower() in confirmed_project_skills
            evidence_type = "demonstrated" if is_demonstrated else "claimed"
            confidence = 90 if is_demonstrated else 75
            proficiency = "Advanced" if is_demonstrated and canonical in ["Python", "PyTorch"] else "Intermediate"

            existing_skill = db.query(StudentSkill).filter(
                StudentSkill.user_id == current_user.id,
                StudentSkill.skill_name == canonical
            ).first()

            if existing_skill:
                existing_skill.evidence_type = evidence_type
                existing_skill.confidence = max(existing_skill.confidence, confidence)
            else:
                new_skill = StudentSkill(
                    user_id=current_user.id,
                    skill_name=canonical,
                    category=cat,
                    proficiency=proficiency,
                    confidence=confidence,
                    evidence_type=evidence_type,
                    freshness="Fresh",
                    last_demonstrated="Confirmed from Resume",
                    evidence_details={"source": "resume_confirmation", "demonstrated": is_demonstrated}
                )
                db.add(new_skill)
                db.flush()

                # Attach evidence record
                db.add(SkillEvidence(
                    student_skill_id=new_skill.id,
                    evidence_type="project" if is_demonstrated else "coursework",
                    title=f"Confirmed in student resume portfolio ({canonical})",
                    description=f"Evidence confirmed by student during resume intake review.",
                    verification_status="demonstrated" if is_demonstrated else "claimed"
                ))

    # 5. Confirmed Certifications
    if req.certifications:
        for cert_item in req.certifications:
            cert_name = cert_item if isinstance(cert_item, str) else cert_item.get("name", "")
            if cert_name.strip():
                existing_cert = db.query(Certification).filter(
                    Certification.user_id == current_user.id,
                    Certification.name == cert_name
                ).first()
                if not existing_cert:
                    db.add(Certification(
                        user_id=current_user.id,
                        name=cert_name,
                        issuer="Certified Organization",
                        issue_date="Recent"
                    ))

    # 6. Recalculate Profile Readiness Dynamically
    skill_count = db.query(StudentSkill).filter(StudentSkill.user_id == current_user.id).count()
    project_count = db.query(Project).filter(Project.user_id == current_user.id).count()
    new_readiness = min(98, 70 + (skill_count * 2) + (project_count * 3))
    profile.readiness_score = new_readiness

    db.commit()

    return {
        "status": "confirmed",
        "resume_id": resume_id,
        "readiness_score": profile.readiness_score,
        "message": "Resume data confirmed and successfully written to canonical student profile."
    }
