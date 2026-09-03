from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# =============================================================================
# COMMON & ERROR SCHEMAS
# =============================================================================

class ErrorDetail(BaseModel):
    code: str
    message: str

class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class APISuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = "Operation completed successfully."
    data: Optional[Any] = None

# =============================================================================
# AUTH SCHEMAS
# =============================================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    college: Optional[str] = "University Institute of Technology"
    degree: Optional[str] = "B.Tech Computer Science & Engineering"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    auth_provider: str
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# =============================================================================
# PROFILE & STUDENT DATA SCHEMAS
# =============================================================================

class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    title: str
    avatar_url: Optional[str] = None
    initials: str
    phone: Optional[str] = None
    college: str
    degree: str
    branch: str
    academic_year: str
    year_number: int
    cgpa: float
    graduation_year: int
    bio: str
    location: str
    workplace_preference: str
    career_goals: List[str]
    target_role: str
    preferred_opportunity_types: List[str]
    preferred_locations: List[str]
    readiness_score: int
    # Frontend compatibility helper aliases
    readinessScore: Optional[int] = None
    careerPreferences: Optional[Dict[str, Any]] = None
    academic: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    year_number: Optional[int] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    workplace_preference: Optional[str] = None
    career_goals: Optional[List[str]] = None
    target_role: Optional[str] = None
    preferred_opportunity_types: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    readiness_score: Optional[int] = None

class ProfilePatch(ProfileUpdate):
    pass

# =============================================================================
# EDUCATION CRUD SCHEMAS
# =============================================================================

class EducationCreate(BaseModel):
    institution: str
    degree: str
    branch: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cgpa: Optional[float] = None
    is_current: Optional[bool] = True

class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cgpa: Optional[float] = None
    is_current: Optional[bool] = None

class EducationOut(BaseModel):
    id: str
    user_id: str
    institution: str
    degree: str
    branch: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cgpa: Optional[float] = None
    is_current: bool
    created_at: datetime

    class Config:
        from_attributes = True

# =============================================================================
# EXPERIENCE CRUD SCHEMAS
# =============================================================================

class ExperienceCreate(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = []

class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None

class ExperienceOut(BaseModel):
    id: str
    user_id: str
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

# =============================================================================
# PROJECT CRUD SCHEMAS
# =============================================================================

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    skills: Optional[List[str]] = []
    repo_url: Optional[str] = None
    live_url: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None

class ProjectOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    skills: List[str]
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# =============================================================================
# CERTIFICATION CRUD SCHEMAS
# =============================================================================

class CertificationCreate(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None

class CertificationOut(BaseModel):
    id: str
    user_id: str
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# =============================================================================
# SKILL & EVIDENCE SCHEMAS
# =============================================================================

class StudentSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "General"
    proficiency: Optional[str] = "Intermediate"  # Beginner, Intermediate, Advanced, Expert
    confidence: Optional[int] = 80
    evidence_type: Optional[str] = "claimed"
    freshness: Optional[str] = "Fresh"

class StudentSkillUpdate(BaseModel):
    proficiency: Optional[str] = None
    confidence: Optional[int] = None
    evidence_type: Optional[str] = None
    freshness: Optional[str] = None
    category: Optional[str] = None

class SkillEvidenceCreate(BaseModel):
    evidence_type: str = "project"  # project, certification, assessment, coursework
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    verification_status: Optional[str] = "demonstrated"

class SkillEvidenceOut(BaseModel):
    id: str
    student_skill_id: str
    evidence_type: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentSkillOut(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    proficiency: str
    confidence: int
    evidence_type: str
    freshness: str
    last_demonstrated: str
    evidence: Optional[Dict[str, Any]] = None
    evidence_items: Optional[List[SkillEvidenceOut]] = []

    class Config:
        from_attributes = True

# =============================================================================
# PREFERENCES SCHEMAS
# =============================================================================

class PreferencesUpdate(BaseModel):
    target_role: Optional[str] = None
    workplace_preference: Optional[str] = None
    career_goals: Optional[List[str]] = None
    preferred_opportunity_types: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None

# =============================================================================
# APPLICATION & EVENT SCHEMAS
# =============================================================================

class ApplicationCreate(BaseModel):
    opportunity_id: str
    notes: Optional[str] = "Applied via SkillMatch platform"

class ApplicationStatusUpdate(BaseModel):
    status: str  # saved, planning, applied, assessment, interview, selected, rejected, withdrawn
    notes: Optional[str] = None

class ApplicationEventOut(BaseModel):
    id: str
    application_id: str
    from_stage: Optional[str] = None
    to_stage: str
    event_type: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationOut(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    opportunityId: str  # Frontend compatibility alias
    title: str
    organization: str
    logoText: str
    logoBg: str
    category: str
    stage: str
    status: str
    applied_date: str
    appliedDate: str
    last_updated: str
    lastUpdated: str
    next_action: str
    nextAction: str
    fit_score: int
    fitScore: int
    trust_score: int
    trustScore: int
    notes: Optional[str] = None
    events: Optional[List[ApplicationEventOut]] = []

    class Config:
        from_attributes = True

# =============================================================================
# RESUME SCHEMAS
# =============================================================================

class ResumeConfirmRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None

# =============================================================================
# FEEDBACK SCHEMAS
# =============================================================================

class FeedbackCreate(BaseModel):
    opportunity_id: Optional[str] = None
    feedback_type: str = "relevance"
    rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None
