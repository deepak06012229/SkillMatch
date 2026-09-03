from typing import Dict, Any, List
from ..models.entities import StudentSkill, Profile
from .skill_normalizer import normalize_skill

# Catalogue of courses that resolve specific skill gaps
COURSE_CATALOGUE = [
    {
        "id": "crs-1",
        "title": "TensorFlow 2.0 Deep Learning & Neural Architectures",
        "provider": "DeepLearning.AI / Coursera",
        "duration": "14 hours",
        "level": "Intermediate to Advanced",
        "resolves_skill": "TensorFlow",
        "priority": "Critical",
        "url": "https://coursera.org/learn/deep-neural-networks",
        "badge": "Highest Impact for Target Roles"
    },
    {
        "id": "crs-2",
        "title": "Docker & Container Mastery for Machine Learning",
        "provider": "Docker Official / Udemy",
        "duration": "8 hours",
        "level": "Beginner to Intermediate",
        "resolves_skill": "Docker",
        "priority": "Important",
        "url": "https://docker.com/101-tutorial",
        "badge": "Deployment Readiness"
    },
    {
        "id": "crs-3",
        "title": "AWS Cloud Foundations & SageMaker Pipelines",
        "provider": "AWS Skill Builder",
        "duration": "6 hours",
        "level": "Intermediate",
        "resolves_skill": "Cloud deployment",
        "priority": "Preferred",
        "url": "https://aws.amazon.com/training",
        "badge": "Cloud Certification Aligned"
    }
]

# Catalogue of proof-of-work project templates that address specific skill gaps
PROJECT_CATALOGUE = [
    {
        "id": "proj-rec-1",
        "title": "Production CNN Image Classifier with FastAPI & Docker",
        "description": "Build an end-to-end computer vision service that accepts image uploads, performs inference using TensorFlow/Keras, and serves predictions via a containerized FastAPI endpoint.",
        "skillsCovered": ["TensorFlow", "Computer Vision", "Docker", "FastAPI"],
        "resolves_gaps": ["TensorFlow", "Docker"],
        "difficulty": "Intermediate",
        "estimatedHours": 18,
        "impact": "+14% readiness for AI/ML roles"
    },
    {
        "id": "proj-rec-2",
        "title": "Edge AI Inference Pipeline with TensorRT",
        "description": "Quantize and optimize deep neural networks for edge computing platforms with ONNX runtime.",
        "skillsCovered": ["TensorFlow", "PyTorch", "C++", "Edge AI"],
        "resolves_gaps": ["TensorFlow"],
        "difficulty": "Advanced",
        "estimatedHours": 24,
        "impact": "+10% readiness for Research roles"
    },
    {
        "id": "proj-rec-3",
        "title": "Cloud-Native Model Monitoring Dashboard",
        "description": "Deploy automated drift detection and latency monitoring for live ML models using Docker and AWS ECS.",
        "skillsCovered": ["Docker", "Cloud deployment", "Python", "Monitoring"],
        "resolves_gaps": ["Docker", "Cloud deployment"],
        "difficulty": "Intermediate",
        "estimatedHours": 12,
        "impact": "+8% readiness for MLOps roles"
    }
]

def analyze_skill_gaps(student_skills: List[StudentSkill], profile: Profile) -> Dict[str, Any]:
    """
    Identifies critical, important, and preferred gaps relative to target AI/ML roles,
    and returns tailored course and project recommendations.
    """
    skill_map = {normalize_skill(s.skill_name)[0].lower(): s for s in student_skills}

    gaps = []

    # 1. TensorFlow Gap Check
    if "tensorflow" not in skill_map:
        gaps.append({
            "id": "gap-1",
            "skill": "TensorFlow",
            "priority": "Critical",
            "currentLevel": "None",
            "requiredLevel": "Advanced",
            "estimatedEffort": "~14 hrs",
            "reason": "Required by 75% of your target AI/ML opportunities."
        })
    elif skill_map["tensorflow"].proficiency in ["Beginner", "Intermediate"]:
        gaps.append({
            "id": "gap-1",
            "skill": "TensorFlow",
            "priority": "Critical",
            "currentLevel": skill_map["tensorflow"].proficiency,
            "requiredLevel": "Advanced",
            "estimatedEffort": "~8 hrs",
            "reason": "Target roles require Advanced model training proficiency."
        })

    # 2. Docker Gap Check
    if "docker" not in skill_map:
        gaps.append({
            "id": "gap-2",
            "skill": "Docker",
            "priority": "Important",
            "currentLevel": "None",
            "requiredLevel": "Intermediate",
            "estimatedEffort": "~8 hrs",
            "reason": "Containerization required for model deployment in production."
        })
    elif skill_map["docker"].proficiency == "Beginner":
        gaps.append({
            "id": "gap-2",
            "skill": "Docker",
            "priority": "Important",
            "currentLevel": "Beginner",
            "requiredLevel": "Intermediate",
            "estimatedEffort": "~4 hrs",
            "reason": "Upgrade beginner container usage to multi-stage builds."
        })

    # 3. Cloud Deployment Gap Check
    cloud_skills = [s for s in skill_map if s in ["aws", "google cloud", "azure", "cloud deployment"]]
    if not cloud_skills:
        gaps.append({
            "id": "gap-3",
            "skill": "Cloud deployment",
            "priority": "Preferred",
            "currentLevel": "None",
            "requiredLevel": "Intermediate",
            "estimatedEffort": "~6 hrs",
            "reason": "Cloud hosting differentiates applicant portfolio."
        })

    # Recommendations mapped to identified gaps
    gap_names = {g["skill"].lower() for g in gaps}
    recommended_courses = [c for c in COURSE_CATALOGUE if c["resolves_skill"].lower() in gap_names]
    recommended_projects = [p for p in PROJECT_CATALOGUE if any(g in [rg.lower() for rg in p["resolves_gaps"]] for g in gap_names)]

    return {
        "targetRole": profile.target_role or "AI/ML Engineer",
        "criticalCount": sum(1 for g in gaps if g["priority"] == "Critical"),
        "totalGaps": len(gaps),
        "gaps": gaps,
        "courses": recommended_courses,
        "projects": recommended_projects
    }
