import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from ..database import Base

def gen_uuid():
    return str(uuid.uuid4())

# =============================================================================
# USER & PROFILE INTELLIGENCE ENTITIES
# =============================================================================

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # nullable for OAuth users
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # student, admin, recruiter
    auth_provider = Column(String(50), default="local")  # local, google
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("StudentSkill", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    saved_opportunities = relationship("SavedOpportunity", back_populates="user", cascade="all, delete-orphan")
    roadmap = relationship("RoadmapGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    match_results = relationship("MatchResult", back_populates="user", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(255), default="Undergraduate Student & Tech Enthusiast")
    avatar_url = Column(String(512), nullable=True)
    initials = Column(String(10), default="DR")
    phone = Column(String(50), nullable=True)
    college = Column(String(255), default="University Institute of Technology")
    degree = Column(String(100), default="B.Tech Computer Science & Engineering")
    branch = Column(String(100), default="Computer Science & Engineering")
    academic_year = Column(String(50), default="3rd Year (Junior)")
    year_number = Column(Integer, default=3)  # numeric year for deterministic eligibility: 1, 2, 3, 4
    cgpa = Column(Float, default=8.8)
    graduation_year = Column(Integer, default=2026)
    bio = Column(Text, default="Passionate developer eager to build real-world intelligent systems.")
    location = Column(String(100), default="Bangalore, India")
    workplace_preference = Column(String(50), default="Hybrid")  # Remote, On-site, Hybrid
    career_goals = Column(JSON, default=list)  # ["AI/ML Internship", "Data Science"]
    target_role = Column(String(100), default="AI/ML Engineer")
    preferred_opportunity_types = Column(JSON, default=list)  # ["internships", "hackathons", "projects"]
    preferred_locations = Column(JSON, default=list)
    readiness_score = Column(Integer, default=86)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Education(Base):
    __tablename__ = "educations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    institution = Column(String(255), nullable=False)
    degree = Column(String(100), nullable=False)
    branch = Column(String(100), nullable=False)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    is_current = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="educations")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    repo_url = Column(String(512), nullable=True)
    live_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    duration = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="experiences")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="certifications")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), default="pdf")
    file_size = Column(Integer, default=0)
    processing_status = Column(String(50), default="completed")  # uploaded, processing, completed, failed
    ocr_used = Column(Boolean, default=False)
    extraction_confidence = Column(Float, default=0.85)
    extracted_data = Column(JSON, default=dict)
    is_confirmed = Column(Boolean, default=False)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")

# =============================================================================
# SKILL INTELLIGENCE ENTITIES
# =============================================================================

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="Languages")


class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    alias_name = Column(String(100), primary_key=True, index=True)
    canonical_name = Column(String(100), nullable=False, index=True)


class SkillRelationship(Base):
    __tablename__ = "skill_relationships"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    source_skill = Column(String(100), nullable=False, index=True)
    target_skill = Column(String(100), nullable=False, index=True)
    relationship_type = Column(String(50), default="related")  # prerequisite, subskill, related
    similarity_score = Column(Float, default=0.75)


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="General")
    proficiency = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    confidence = Column(Integer, default=80)  # 0 to 100
    evidence_type = Column(String(50), default="claimed")  # claimed, demonstrated, verified
    evidence_details = Column(JSON, default=dict)
    freshness = Column(String(50), default="Fresh")  # Fresh, Aging, Needs validation
    last_demonstrated = Column(String(50), default="Recently")

    user = relationship("User", back_populates="skills")
    evidence_items = relationship("SkillEvidence", back_populates="student_skill", cascade="all, delete-orphan")


class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_skill_id = Column(String(36), ForeignKey("student_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_type = Column(String(50), default="project")  # project, certification, assessment, coursework
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(512), nullable=True)
    verification_status = Column(String(50), default="demonstrated")  # claimed, demonstrated, verified
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_skill = relationship("StudentSkill", back_populates="evidence_items")

# =============================================================================
# OPPORTUNITY INTELLIGENCE ENTITIES
# =============================================================================

class OpportunitySource(Base):
    __tablename__ = "opportunity_sources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, nullable=False)
    source_type = Column(String(50), default="direct")  # direct, partner, campus_portal, curated
    website_url = Column(String(512), nullable=True)
    trust_score = Column(Integer, default=90)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    opportunities = relationship("Opportunity", back_populates="source_rel")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(100), primary_key=True)
    source_id = Column(String(36), ForeignKey("opportunity_sources.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, index=True)
    organization = Column(String(255), nullable=False, index=True)
    logo_text = Column(String(10), default="SM")
    logo_bg = Column(String(100), default="bg-primary text-on-primary")
    type = Column(String(50), nullable=False, index=True)  # internships, hackathons, scholarships, courses, projects, jobs, skill_opportunities
    category_label = Column(String(100), default="Opportunity")
    description = Column(Text, nullable=False)
    overview = Column(Text, nullable=True)

    # Skills
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)

    # Deterministic Eligibility fields
    min_cgpa = Column(Float, default=0.0)
    allowed_degrees = Column(JSON, default=list)  # ["B.Tech", "B.E", "B.Sc", "M.Tech"]
    allowed_branches = Column(JSON, default=list)  # ["Computer Science", "Information Technology", "AI/ML", "Any"]
    allowed_years = Column(JSON, default=list)  # ["1st Year Students", "2nd Year Students", "Final Year & Graduates"]
    min_experience_months = Column(Integer, default=0)

    # Logistics
    location = Column(String(255), default="Remote")
    workplace_type = Column(String(50), default="Remote")  # Remote, Hybrid, On-site
    stipend_type = Column(String(100), default="Fixed")
    stipend_amount = Column(Integer, default=0)
    duration = Column(String(100), default="3 Months")
    deadline = Column(String(100), default="In 14 days")
    deadline_days = Column(Integer, default=14)
    deadline_status = Column(String(50), default="OPEN")  # OPEN, CLOSING_SOON, EXPIRED

    # Trust & Verification
    application_url = Column(String(512), default="https://skillmatch.internal/apply")
    url = Column(String(512), nullable=True)
    source = Column(String(100), default="SkillMatch Direct")
    source_url = Column(String(512), nullable=True)
    verified = Column(Boolean, default=True)
    last_verified = Column(String(50), default="Today")
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    trust_score = Column(Integer, default=90)  # 0 to 100
    trust_breakdown = Column(JSON, default=dict)

    # Deduplication & Freshness
    canonical_id = Column(String(100), ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True)
    is_duplicate = Column(Boolean, default=False)
    dedup_signature = Column(String(255), nullable=True, index=True)
    status = Column(String(50), default="ACTIVE", index=True)  # ACTIVE, EXPIRING_SOON, EXPIRED, PAUSED, UNKNOWN
    posted_date = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    source_rel = relationship("OpportunitySource", back_populates="opportunities")
    skill_requirements = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    eligibility_criteria = relationship("OpportunityEligibility", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    opportunity_id = Column(String(100), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False, index=True)
    is_required = Column(Boolean, default=True)  # True = required, False = preferred
    min_proficiency = Column(String(50), default="Intermediate")
    weight = Column(Float, default=1.0)

    opportunity = relationship("Opportunity", back_populates="skill_requirements")


class OpportunityEligibility(Base):
    __tablename__ = "opportunity_eligibilities"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    opportunity_id = Column(String(100), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    criterion_type = Column(String(50), nullable=False)  # cgpa, academic_year, degree, branch, deadline
    operator = Column(String(20), default="gte")  # gte, lte, in, eq
    criterion_value = Column(String(255), nullable=False)
    is_strict = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="eligibility_criteria")

# =============================================================================
# APPLICATION & FEEDBACK ENTITIES
# =============================================================================

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(100), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(100), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="applied")  # saved, planning, applied, assessment, interview, selected, rejected, withdrawn
    stage = Column(String(50), default="applied")
    applied_date = Column(String(50), default="Today")
    last_updated = Column(String(50), default="Just now")
    next_action = Column(String(255), default="Awaiting employer review")
    notes = Column(Text, nullable=True)
    fit_score = Column(Integer, default=85)
    trust_score = Column(Integer, default=90)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity")
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    application_id = Column(String(100), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    from_stage = Column(String(50), nullable=True)
    to_stage = Column(String(50), nullable=False)
    event_type = Column(String(50), default="stage_transition")  # created, stage_transition, note_added, reminder
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="events")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(100), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_opportunities")
    opportunity = relationship("Opportunity")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(100), nullable=True, index=True)
    feedback_type = Column(String(50), default="relevance")  # relevance, outcome, skill_gap
    rating = Column(Integer, default=5)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# =============================================================================
# ROADMAP & INTELLIGENCE ENTITIES
# =============================================================================

class RoadmapGoal(Base):
    __tablename__ = "roadmap_goals"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(255), default="Become internship-ready for AI/ML roles in 10 weeks")
    badge = Column(String(100), default="AI Career Agent Active")
    description = Column(Text, default="Personalized curriculum dynamically updated based on verified skills and goals.")
    current_week = Column(Integer, default=7)
    total_weeks = Column(Integer, default=10)
    overall_progress = Column(Integer, default=70)
    weeks_data = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmap")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmap_goals.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    focus = Column(String(255), nullable=True)
    estimated_hours = Column(Integer, default=12)
    is_completed = Column(Boolean, default=False)
    checklist_data = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    roadmap = relationship("RoadmapGoal", back_populates="items")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(100), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    fit_score = Column(Integer, nullable=False)
    is_eligible = Column(Boolean, default=True)
    readiness_score = Column(Integer, default=80)
    breakdown = Column(JSON, default=dict)
    eligibility_reasons = Column(JSON, default=list)
    failed_requirements = Column(JSON, default=list)
    why_you_match = Column(JSON, default=list)
    what_you_are_missing = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="match_results")
    opportunity = relationship("Opportunity")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False, index=True)
    priority = Column(String(50), default="Important")  # Critical, Important, Preferred
    current_level = Column(String(50), default="None")
    required_level = Column(String(50), default="Intermediate")
    estimated_effort = Column(String(50), default="~8 hrs")
    reason = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skill_gaps")


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    duration = Column(String(100), nullable=False)
    level = Column(String(100), default="Intermediate")
    resolves_skill = Column(String(100), nullable=False, index=True)
    priority = Column(String(50), default="Critical")
    url = Column(String(512), nullable=False)
    badge = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendedProject(Base):
    __tablename__ = "recommended_projects"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    skills_covered = Column(JSON, default=list)
    resolves_gaps = Column(JSON, default=list)
    difficulty = Column(String(50), default="Intermediate")
    estimated_hours = Column(Integer, default=15)
    impact = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
