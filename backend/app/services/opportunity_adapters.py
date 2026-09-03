from typing import List, Dict, Any
from abc import ABC, abstractmethod

class OpportunitySourceAdapter(ABC):
    @property
    @abstractmethod
    def source_id(self) -> str:
        pass

    @property
    @abstractmethod
    def source_name(self) -> str:
        pass

    @property
    @abstractmethod
    def source_type(self) -> str:
        pass

    @abstractmethod
    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        """
        Fetches or yields raw opportunities from the provider/feed.
        Must respect rate limits, terms, and structured schema conventions.
        """
        pass

class DirectPartnerAdapter(OpportunitySourceAdapter):
    """
    Ingests verified partner opportunities directly from enterprise partnerships.
    """
    @property
    def source_id(self) -> str:
        return "src-1"

    @property
    def source_name(self) -> str:
        return "Enterprise Partner Network"

    @property
    def source_type(self) -> str:
        return "direct"

    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "partner-opp-101",
                "title": "Applied Machine Learning Fellow",
                "organization": "Anthropic Partner Labs",
                "type": "internships",
                "category_label": "Research Fellowship",
                "description": "Collaborate on interpretability benchmarks and safety alignment evaluations for frontier multimodal systems.",
                "required_skills": ["Python", "PyTorch", "Machine Learning"],
                "preferred_skills": ["Docker", "FastAPI"],
                "min_cgpa": 8.5,
                "allowed_branches": ["Computer Science", "Artificial Intelligence"],
                "allowed_years": ["3rd Year Students", "Final Year & Graduates"],
                "location": "Bangalore / Hybrid",
                "workplace_type": "Hybrid",
                "stipend_amount": 2800,
                "stipend_type": "Monthly",
                "duration": "6 Months",
                "deadline_days": 18,
                "application_url": "https://anthropic.com/careers/research-fellow",
                "source": "Anthropic Partner Labs",
                "verified": True,
                "trust_score": 98
            },
            {
                "id": "partner-opp-102",
                "title": "Junior Cloud Infrastructure Engineer",
                "organization": "Datadog",
                "type": "jobs",
                "category_label": "Entry-Level Job",
                "description": "Maintain scalable telemetry pipelines and assist with distributed Kubernetes clusters.",
                "required_skills": ["Go", "Docker", "Kubernetes", "Linux"],
                "preferred_skills": ["Python", "AWS", "CI/CD"],
                "min_cgpa": 7.0,
                "allowed_branches": ["Computer Science", "Information Technology", "Any"],
                "allowed_years": ["Final Year & Graduates"],
                "location": "Remote",
                "workplace_type": "Remote",
                "stipend_amount": 4500,
                "stipend_type": "Monthly",
                "duration": "Full-Time",
                "deadline_days": 25,
                "application_url": "https://datadoghq.com/careers/junior-cloud",
                "source": "Datadog Official",
                "verified": True,
                "trust_score": 97
            }
        ]

class CampusPortalAdapter(OpportunitySourceAdapter):
    """
    Ingests university hackathons, campus challenges, and developer hackfests.
    """
    @property
    def source_id(self) -> str:
        return "src-4"

    @property
    def source_name(self) -> str:
        return "Campus Hackathon Portal"

    @property
    def source_type(self) -> str:
        return "campus_portal"

    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "campus-hack-201",
                "title": "Global Edge AI Hackathon 2026",
                "organization": "NVIDIA & IIT Delhi",
                "type": "hackathons",
                "category_label": "Hackathon",
                "description": "48-hour global builder hackathon deploying vision and robotics pipelines on NVIDIA Jetson edge kits.",
                "required_skills": ["Python", "Computer Vision", "PyTorch"],
                "preferred_skills": ["C++", "Docker"],
                "min_cgpa": 0.0,
                "allowed_branches": ["Any"],
                "allowed_years": ["1st Year Students", "2nd Year Students", "Final Year & Graduates"],
                "location": "New Delhi / Hybrid",
                "workplace_type": "Hybrid",
                "stipend_amount": 15000,
                "stipend_type": "Prize Pool",
                "duration": "Weekend Sprint",
                "deadline_days": 7,
                "application_url": "https://nvidia-iitd-hack.devpost.com",
                "source": "NVIDIA University Programs",
                "verified": True,
                "trust_score": 96
            }
        ]

class ScholarshipFeedAdapter(OpportunitySourceAdapter):
    """
    Ingests accredited STEM scholarships and student research grants.
    """
    @property
    def source_id(self) -> str:
        return "src-6"

    @property
    def source_name(self) -> str:
        return "National Scholarship Directory"

    @property
    def source_type(self) -> str:
        return "curated"

    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "schol-grant-301",
                "title": "National STEM Excellence Grant",
                "organization": "National Science Foundation",
                "type": "scholarships",
                "category_label": "Scholarship",
                "description": "Merit-based grant covering undergraduate tuition and research stipends for high-performing engineering students.",
                "required_skills": ["Machine Learning", "Mathematics"],
                "min_cgpa": 8.5,
                "allowed_branches": ["Computer Science", "Information Technology", "Any"],
                "allowed_years": ["2nd Year Students", "3rd Year Students"],
                "location": "National",
                "workplace_type": "Remote",
                "stipend_amount": 10000,
                "stipend_type": "Scholarship Grant",
                "duration": "Academic Year 2026",
                "deadline_days": 30,
                "application_url": "https://nsf.gov/awards/stem-excellence-2026",
                "source": "National Science Foundation",
                "verified": True,
                "trust_score": 99
            }
        ]

ADAPTER_REGISTRY: List[OpportunitySourceAdapter] = [
    DirectPartnerAdapter(),
    CampusPortalAdapter(),
    ScholarshipFeedAdapter()
]
