from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.entities import (
    User, Profile, Education, Experience, Project, Certification, Resume,
    Skill, SkillAlias, SkillRelationship, StudentSkill, SkillEvidence,
    OpportunitySource, Opportunity, OpportunitySkill, OpportunityEligibility,
    Application, ApplicationEvent, SavedOpportunity, Feedback,
    RoadmapGoal, RoadmapItem, MatchResult, SkillGap, Course, RecommendedProject
)
from .auth_service import get_password_hash
from .skill_normalizer import SKILL_ALIASES, normalize_skill

DEFAULT_ROADMAP_WEEKS = [
    {
        "week": 1,
        "title": "Python & NumPy Mastery for ML",
        "focus": "Core vectorized computation and linear algebra fundamentals",
        "completed": True,
        "hours": 12,
        "date": "Completed Week 1",
        "checklist": [
            {"id": "w1-1", "title": "Vectorized matrix operations & broadcasting", "done": True},
            {"id": "w1-2", "title": "Memory profiling in Python", "done": True}
        ]
    },
    {
        "week": 2,
        "title": "Data Pipeline Engineering with Pandas",
        "focus": "Feature extraction and data cleaning at scale",
        "completed": True,
        "hours": 14,
        "date": "Completed Week 2",
        "checklist": [
            {"id": "w2-1", "title": "Handling missing data & categorical encoding", "done": True},
            {"id": "w2-2", "title": "ETL pipeline implementation", "done": True}
        ]
    },
    {
        "week": 3,
        "title": "Statistical Learning & Scikit-Learn",
        "focus": "Regression, tree ensembles, and cross-validation",
        "completed": True,
        "hours": 15,
        "date": "Completed Week 3",
        "checklist": [
            {"id": "w3-1", "title": "Gradient Boosted Trees (XGBoost)", "done": True},
            {"id": "w3-2", "title": "Hyperparameter tuning with Optuna", "done": True}
        ]
    },
    {
        "week": 4,
        "title": "Deep Learning with PyTorch",
        "focus": "Custom loss functions, backprop, and training loops",
        "completed": True,
        "hours": 16,
        "date": "Completed Week 4",
        "checklist": [
            {"id": "w4-1", "title": "PyTorch custom Dataset and DataLoader", "done": True},
            {"id": "w4-2", "title": "GPU accelerated inference benchmarking", "done": True}
        ]
    },
    {
        "week": 5,
        "title": "Convolutional Neural Networks & Vision",
        "focus": "Transfer learning with ResNet and MobileNet architectures",
        "completed": True,
        "hours": 18,
        "date": "Completed Week 5",
        "checklist": [
            {"id": "w5-1", "title": "Image classification on edge device", "done": True},
            {"id": "w5-2", "title": "Data augmentation pipeline", "done": True}
        ]
    },
    {
        "week": 6,
        "title": "FastAPI Model Serving & Serialization",
        "focus": "Asynchronous REST endpoints for ML inference with Pydantic",
        "completed": True,
        "hours": 12,
        "date": "Completed Week 6",
        "checklist": [
            {"id": "w6-1", "title": "Containerizing FastAPI with Uvicorn", "done": True},
            {"id": "w6-2", "title": "Batch prediction optimization", "done": True}
        ]
    },
    {
        "week": 7,
        "title": "GitHub Portfolio & Resume Optimization",
        "focus": "Refining repository READMEs and aligning project metrics with ATS algorithms for AI roles.",
        "completed": False,
        "current": True,
        "hours": 10,
        "date": "Current Week",
        "checklist": [
            {"id": "w7-1", "title": "README Template Check & architecture diagrams", "done": True},
            {"id": "w7-2", "title": "Optimize Commit History and semantic commit tags", "done": False},
            {"id": "w7-3", "title": "Benchmark performance statistics section", "done": False}
        ]
    },
    {
        "week": 8,
        "title": "Docker Containers & Kubernetes Basics",
        "focus": "Multi-stage Docker builds and reproducible deployment containers",
        "completed": False,
        "hours": 12,
        "date": "Upcoming",
        "checklist": [
            {"id": "w8-1", "title": "Docker Compose local microservices stack", "done": False},
            {"id": "w8-2", "title": "Healthcheck endpoints & graceful shutdown", "done": False}
        ]
    },
    {
        "week": 9,
        "title": "Cloud Deployment on AWS & CI/CD",
        "focus": "Automated testing with GitHub Actions and AWS ECS deployment",
        "completed": False,
        "hours": 14,
        "date": "Upcoming",
        "checklist": [
            {"id": "w9-1", "title": "GitHub Actions linting & unit test runner", "done": False},
            {"id": "w9-2", "title": "Deploy containerized model to AWS Fargate", "done": False}
        ]
    },
    {
        "week": 10,
        "title": "High-Fit Applications & Technical Interview Sprints",
        "focus": "Direct outreach to top-matched hiring teams and live mock interviews",
        "completed": False,
        "hours": 16,
        "date": "Final Milestone",
        "checklist": [
            {"id": "w10-1", "title": "Submit 5 target verified applications", "done": False},
            {"id": "w10-2", "title": "Complete 3 system design & ML mock rounds", "done": False}
        ]
    }
]

OPPORTUNITIES_SEED = [
    # 1. INTERNSHIPS
    {
        "id": "opp-1",
        "title": "AI/ML Intern",
        "organization": "TechNova",
        "logo_text": "TN",
        "logo_bg": "bg-primary-container text-on-primary-container",
        "type": "internships",
        "category_label": "Internship",
        "description": "Work with our applied research team deploying edge AI models and computer vision pipelines to production robotics systems.",
        "overview": "TechNova is a high-growth robotics enterprise building intelligent vision systems. As an AI/ML Intern, you will partner directly with principal research scientists.",
        "required_skills": ["Python", "Machine Learning", "PyTorch"],
        "preferred_skills": ["Docker", "Computer Vision", "FastAPI"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Artificial Intelligence", "Information Technology"],
        "allowed_years": ["2nd Year Students", "3rd Year Students", "Final Year & Graduates"],
        "location": "Bangalore / Remote",
        "workplace_type": "Hybrid",
        "stipend_type": "Monthly",
        "stipend_amount": 1800,
        "duration": "6 Months",
        "deadline": "In 12 days",
        "deadline_days": 12,
        "deadline_status": "OPEN",
        "application_url": "https://technova.ai/careers/intern-aiml",
        "source": "TechNova Official Careers",
        "verified": True,
        "trust_score": 96
    },
    {
        "id": "opp-2",
        "title": "GenAI Research Assistant",
        "organization": "Google Cloud",
        "logo_text": "GC",
        "logo_bg": "bg-secondary-container text-on-secondary-container",
        "type": "internships",
        "category_label": "Research Fellowship",
        "description": "Collaborate on LLM prompt distillation, evaluation benchmarks, and multimodal agent development with Vertex AI scientists.",
        "overview": "Join the Google Cloud Generative AI Applied Labs to advance enterprise foundation model capabilities.",
        "required_skills": ["Python", "PyTorch", "Natural Language Processing"],
        "preferred_skills": ["Generative AI", "LLMs", "FastAPI"],
        "min_cgpa": 8.0,
        "allowed_branches": ["Computer Science", "Artificial Intelligence", "Any"],
        "allowed_years": ["3rd Year Students", "Final Year & Graduates"],
        "location": "Mountain View / Hybrid",
        "workplace_type": "Hybrid",
        "stipend_type": "Monthly",
        "stipend_amount": 3200,
        "duration": "3 Months",
        "deadline": "In 5 days",
        "deadline_days": 5,
        "deadline_status": "CLOSING_SOON",
        "application_url": "https://careers.google.com/jobs/genai-assistant",
        "source": "Google University Programs",
        "verified": True,
        "trust_score": 98
    },
    {
        "id": "opp-3",
        "title": "Full Stack Fellow",
        "organization": "Stripe",
        "logo_text": "ST",
        "logo_bg": "bg-tertiary-container text-on-tertiary-container",
        "type": "internships",
        "category_label": "Engineering Internship",
        "description": "Design financial ledger interfaces and low-latency webhook ingestion engines using React and modern distributed backends.",
        "overview": "Stripe's Engineering Fellowship is a selective 12-week immersive program for future technical leaders.",
        "required_skills": ["React", "TypeScript", "Node.js"],
        "preferred_skills": ["Python", "PostgreSQL", "Docker"],
        "min_cgpa": 7.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["2nd Year Students", "3rd Year Students", "Final Year & Graduates"],
        "location": "San Francisco / Remote",
        "workplace_type": "Remote",
        "stipend_type": "Monthly",
        "stipend_amount": 2800,
        "duration": "12 Weeks",
        "deadline": "In 18 days",
        "deadline_days": 18,
        "deadline_status": "OPEN",
        "application_url": "https://stripe.com/fellows",
        "source": "Stripe University Recruiting",
        "verified": True,
        "trust_score": 97
    },
    {
        "id": "opp-4",
        "title": "Cloud Infra Intern",
        "organization": "Microsoft",
        "logo_text": "MS",
        "logo_bg": "bg-tertiary text-on-tertiary",
        "type": "internships",
        "category_label": "Cloud Internship",
        "description": "Build automated Kubernetes cluster management and telemetry observability tools across global Azure regions.",
        "overview": "Microsoft Azure Core Engineering offers real-world infrastructure challenges at unprecedented planetary scale.",
        "required_skills": ["Python", "Docker", "Linux"],
        "preferred_skills": ["Kubernetes", "AWS", "Go"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Information Technology", "Electronics"],
        "allowed_years": ["3rd Year Students", "Final Year & Graduates"],
        "location": "Hyderabad / Remote",
        "workplace_type": "Hybrid",
        "stipend_type": "Monthly",
        "stipend_amount": 2100,
        "duration": "6 Months",
        "deadline": "In 8 days",
        "deadline_days": 8,
        "deadline_status": "OPEN",
        "application_url": "https://careers.microsoft.com",
        "source": "Microsoft University Campus Hub",
        "verified": True,
        "trust_score": 95
    },

    # 2. HACKATHONS
    {
        "id": "opp-5",
        "title": "Quantum Hackathon 2026",
        "organization": "IEEE Quantum & MIT",
        "logo_text": "IE",
        "logo_bg": "bg-primary text-on-primary",
        "type": "hackathons",
        "category_label": "Global Hackathon",
        "description": "36-hour competitive hackathon focused on quantum circuit simulation, optimization algorithms, and hybrid classical-quantum machine learning.",
        "overview": "Compete with global student engineers for $25,000 in prizes, mentorship from quantum physicists, and direct interview opportunities.",
        "required_skills": ["Python", "Machine Learning"],
        "preferred_skills": ["Linear Algebra", "Algorithms"],
        "min_cgpa": 0.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Virtual (Worldwide)",
        "workplace_type": "Remote",
        "stipend_type": "Prize Pool",
        "stipend_amount": 25000,
        "duration": "3 Days",
        "deadline": "In 3 days",
        "deadline_days": 3,
        "deadline_status": "CLOSING_SOON",
        "application_url": "https://ieee-quantum-hack.devpost.com",
        "source": "Devpost Verified Event",
        "verified": True,
        "trust_score": 94
    },
    {
        "id": "opp-6",
        "title": "CampusHub India Innovation Hackathon",
        "organization": "National Skills Council",
        "logo_text": "CH",
        "logo_bg": "bg-secondary text-on-secondary",
        "type": "hackathons",
        "category_label": "National Hackathon",
        "description": "Build high-impact digital public infrastructure solutions for student opportunity matching, skill credentialing, and youth empowerment.",
        "overview": "The marquee national student challenge connecting collegiate developers with public and private sector leaders.",
        "required_skills": ["React", "Python", "FastAPI"],
        "preferred_skills": ["Docker", "PostgreSQL"],
        "min_cgpa": 0.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "New Delhi & Virtual",
        "workplace_type": "Hybrid",
        "stipend_type": "Prize Pool",
        "stipend_amount": 15000,
        "duration": "48 Hours",
        "deadline": "In 10 days",
        "deadline_days": 10,
        "deadline_status": "OPEN",
        "application_url": "https://campushub.gov.in/hackathon-2026",
        "source": "Ministry of Education Partner Portal",
        "verified": True,
        "trust_score": 96
    },

    # 3. SCHOLARSHIPS
    {
        "id": "opp-7",
        "title": "ML Research Merit Grant",
        "organization": "AWS Educate",
        "logo_text": "AW",
        "logo_bg": "bg-secondary text-on-secondary",
        "type": "scholarships",
        "category_label": "Academic Scholarship",
        "description": "Provides $5,000 tuition grant plus $10,000 AWS Cloud promotional credits for undergraduate research in applied artificial intelligence.",
        "overview": "Empowering talented undergraduate researchers to execute compute-heavy machine learning thesis work.",
        "required_skills": ["Python", "Machine Learning"],
        "preferred_skills": ["PyTorch", "Cloud deployment"],
        "min_cgpa": 8.5,
        "allowed_branches": ["Computer Science", "Artificial Intelligence", "Information Technology"],
        "allowed_years": ["3rd Year Students", "Final Year & Graduates"],
        "location": "Global",
        "workplace_type": "Remote",
        "stipend_type": "Total Award",
        "stipend_amount": 15000,
        "duration": "Academic Year",
        "deadline": "In 25 days",
        "deadline_days": 25,
        "deadline_status": "OPEN",
        "application_url": "https://aws.amazon.com/education/awseducate/research-grant",
        "source": "AWS Education Foundation",
        "verified": True,
        "trust_score": 93
    },
    {
        "id": "opp-8",
        "title": "Grace Hopper STEM Excellence Fellowship",
        "organization": "AnitaB.org",
        "logo_text": "GH",
        "logo_bg": "bg-primary-container text-on-primary-container",
        "type": "scholarships",
        "category_label": "Diversity Scholarship",
        "description": "Full conference registration, travel stipend, and technical mentorship pairing for aspiring women and underrepresented technologists.",
        "overview": "World-renowned leadership fellowship celebrating innovation in computing.",
        "required_skills": ["Computer Science Fundamentals"],
        "preferred_skills": ["Python", "Web Development"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Any STEM"],
        "allowed_years": ["2nd Year Students", "3rd Year Students", "Final Year & Graduates"],
        "location": "Orlando, FL / Hybrid",
        "workplace_type": "Hybrid",
        "stipend_type": "Fellowship",
        "stipend_amount": 4000,
        "duration": "1 Year",
        "deadline": "In 16 days",
        "deadline_days": 16,
        "deadline_status": "OPEN",
        "application_url": "https://anitab.org/ghc-scholarships",
        "source": "AnitaB Official Foundation",
        "verified": True,
        "trust_score": 95
    },

    # 4. COURSES
    {
        "id": "opp-9",
        "title": "TensorFlow 2.0 & Production Deep Learning",
        "organization": "DeepLearning.AI",
        "logo_text": "DL",
        "logo_bg": "bg-primary text-on-primary",
        "type": "courses",
        "category_label": "Certification Course",
        "description": "Industry-standard curriculum covering CNNs, transfer learning, model serving with TF Serving, and TF Lite mobile quantization.",
        "overview": "Directly recommended to resolve your critical skill gap in TensorFlow.",
        "required_skills": ["Python"],
        "preferred_skills": ["NumPy", "Linear Algebra"],
        "min_cgpa": 0.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Online Self-Paced",
        "workplace_type": "Remote",
        "stipend_type": "Free / Sponsored",
        "stipend_amount": 0,
        "duration": "4 Weeks (14 hrs)",
        "deadline": "Open Enrollment",
        "deadline_days": 45,
        "deadline_status": "OPEN",
        "application_url": "https://coursera.org/specializations/deep-learning",
        "source": "Coursera Partner Campus",
        "verified": True,
        "trust_score": 98
    },
    {
        "id": "opp-10",
        "title": "Cloud-Native Containerization with Docker & Kubernetes",
        "organization": "Linux Foundation",
        "logo_text": "LF",
        "logo_bg": "bg-secondary-container text-on-secondary-container",
        "type": "courses",
        "category_label": "Accredited Course",
        "description": "Comprehensive hands-on labs on container orchestration, microservice architectures, and automated cloud deployments.",
        "overview": "Directly recommended to bridge your Important gap in Docker.",
        "required_skills": ["Linux Basics"],
        "preferred_skills": ["Git", "Python"],
        "min_cgpa": 0.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Online Self-Paced",
        "workplace_type": "Remote",
        "stipend_type": "Free / Sponsored",
        "stipend_amount": 0,
        "duration": "3 Weeks (10 hrs)",
        "deadline": "Open Enrollment",
        "deadline_days": 60,
        "deadline_status": "OPEN",
        "application_url": "https://training.linuxfoundation.org",
        "source": "Linux Foundation Academy",
        "verified": True,
        "trust_score": 96
    },

    # 5. PROJECTS
    {
        "id": "opp-11",
        "title": "Open Source Contributor: LLM Evaluation Harness",
        "organization": "EleutherAI",
        "logo_text": "EL",
        "logo_bg": "bg-tertiary-container text-on-tertiary-container",
        "type": "projects",
        "category_label": "Open Source Project",
        "description": "Implement zero-shot evaluation benchmarks for reasoning tasks, write automated PyTorch test suites, and review PRs.",
        "overview": "EleutherAI is a premier open collective building transparent AI infrastructure.",
        "required_skills": ["Python", "PyTorch", "Git"],
        "preferred_skills": ["LLMs", "Docker"],
        "min_cgpa": 0.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Remote / GitHub",
        "workplace_type": "Remote",
        "stipend_type": "Bounty / Mentorship",
        "stipend_amount": 1000,
        "duration": "Ongoing",
        "deadline": "In 30 days",
        "deadline_days": 30,
        "deadline_status": "OPEN",
        "application_url": "https://github.com/EleutherAI/lm-evaluation-harness",
        "source": "GitHub Verified Repository",
        "verified": True,
        "trust_score": 95
    },
    {
        "id": "opp-12",
        "title": "Autonomous Drone Obstacle Avoidance Project",
        "organization": "AeroTech Robotics Lab",
        "logo_text": "AT",
        "logo_bg": "bg-primary text-on-primary",
        "type": "projects",
        "category_label": "Applied R&D Project",
        "description": "Build real-time depth estimation models and path planning algorithms deployed on Nvidia Jetson embedded hardware.",
        "overview": "Partner with aerial robotics engineers to build robust flight obstacle avoidance systems.",
        "required_skills": ["Python", "Computer Vision", "PyTorch"],
        "preferred_skills": ["C++", "ROS", "Docker"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Robotics", "Electronics"],
        "allowed_years": ["3rd Year Students", "Final Year & Graduates"],
        "location": "Bangalore / Hybrid",
        "workplace_type": "Hybrid",
        "stipend_type": "Project Grant",
        "stipend_amount": 1200,
        "duration": "8 Weeks",
        "deadline": "In 14 days",
        "deadline_days": 14,
        "deadline_status": "OPEN",
        "application_url": "https://aerotech-robotics.org/drone-project",
        "source": "AeroTech Labs Official",
        "verified": True,
        "trust_score": 92
    },

    # 6. JOBS
    {
        "id": "opp-13",
        "title": "Junior AI Engineer",
        "organization": "CognitiveScale AI",
        "logo_text": "CS",
        "logo_bg": "bg-secondary text-on-secondary",
        "type": "jobs",
        "category_label": "Full-Time Job",
        "description": "Responsible for deploying fine-tuned LLMs, configuring RAG vector pipelines, and monitoring model drift in production financial applications.",
        "overview": "CognitiveScale is hiring emerging university graduates for fast-track AI engineering roles.",
        "required_skills": ["Python", "PyTorch", "FastAPI"],
        "preferred_skills": ["Docker", "PostgreSQL", "Cloud deployment"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Artificial Intelligence", "Information Technology"],
        "allowed_years": ["Final Year & Graduates"],
        "location": "Bangalore / Pune",
        "workplace_type": "On-site",
        "stipend_type": "Annual Salary (CTC)",
        "stipend_amount": 14000,
        "duration": "Permanent",
        "deadline": "In 20 days",
        "deadline_days": 20,
        "deadline_status": "OPEN",
        "application_url": "https://cognitivescale.com/careers/jr-ai-eng",
        "source": "Direct Employer Posting",
        "verified": True,
        "trust_score": 94
    },
    {
        "id": "opp-14",
        "title": "Associate Backend Engineer",
        "organization": "Razorpay",
        "logo_text": "RP",
        "logo_bg": "bg-primary-container text-on-primary-container",
        "type": "jobs",
        "category_label": "Full-Time Job",
        "description": "Scale financial payment gateways handling 100M+ transactions daily using high-throughput microservices and relational storage.",
        "overview": "Join India's leading fintech infrastructure engineering organization.",
        "required_skills": ["Python", "FastAPI", "SQL"],
        "preferred_skills": ["Docker", "Redis", "Kafka"],
        "min_cgpa": 7.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["Final Year & Graduates"],
        "location": "Bangalore",
        "workplace_type": "Hybrid",
        "stipend_type": "Annual Salary (CTC)",
        "stipend_amount": 16000,
        "duration": "Permanent",
        "deadline": "In 15 days",
        "deadline_days": 15,
        "deadline_status": "OPEN",
        "application_url": "https://razorpay.com/jobs",
        "source": "Razorpay Official Careers",
        "verified": True,
        "trust_score": 96
    },

    # 7. SKILL OPPORTUNITIES
    {
        "id": "opp-15",
        "title": "Google Cloud Career Launchpad: AI Track",
        "organization": "Google Developers",
        "logo_text": "GD",
        "logo_bg": "bg-tertiary text-on-tertiary",
        "type": "skill_opportunities",
        "category_label": "Skill Acceleration Program",
        "description": "Structured 8-week bootcamp featuring live workshops by Google Developer Experts, cloud lab access, and certification exam vouchers.",
        "overview": "Official Google student upskilling initiative with direct interview fast-tracks for certified graduates.",
        "required_skills": ["Python Fundamentals"],
        "preferred_skills": ["Machine Learning", "Cloud deployment"],
        "min_cgpa": 6.5,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Hybrid / Virtual Labs",
        "workplace_type": "Remote",
        "stipend_type": "Free + Exam Voucher ($200 value)",
        "stipend_amount": 200,
        "duration": "8 Weeks",
        "deadline": "In 7 days",
        "deadline_days": 7,
        "deadline_status": "OPEN",
        "application_url": "https://developers.google.com/community/launchpad",
        "source": "Google Developers Official",
        "verified": True,
        "trust_score": 99
    },
    {
        "id": "opp-16",
        "title": "NVIDIA Deep Learning Institute Student Ambassador",
        "organization": "NVIDIA",
        "logo_text": "NV",
        "logo_bg": "bg-primary text-on-primary",
        "type": "skill_opportunities",
        "category_label": "Student Ambassador & Upskill",
        "description": "Gain subsidized access to accelerated computing GPU clusters, lead campus AI workshops, and receive NVIDIA DLI instructor credentials.",
        "overview": "NVIDIA DLI empowers university student leaders to master hardware-accelerated deep learning.",
        "required_skills": ["Python", "PyTorch"],
        "preferred_skills": ["CUDA", "C++", "Docker"],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Electronics", "Any STEM"],
        "allowed_years": ["2nd Year Students", "3rd Year Students"],
        "location": "Campus / Remote",
        "workplace_type": "Remote",
        "stipend_type": "Honorarium & GPU Credits",
        "stipend_amount": 1500,
        "duration": "Academic Year",
        "deadline": "In 11 days",
        "deadline_days": 11,
        "deadline_status": "OPEN",
        "application_url": "https://nvidia.com/dli/ambassador",
        "source": "NVIDIA University Programs",
        "verified": True,
        "trust_score": 97
    },

    # EDGE CASES (Ineligible, Expired, Missing Skills, Duplicate Sample)
    {
        "id": "opp-17",
        "title": "Principal AI Architect (Senior Role - Ineligible Test)",
        "organization": "DeepTech Systems",
        "logo_text": "DT",
        "logo_bg": "bg-secondary text-on-secondary",
        "type": "jobs",
        "category_label": "Staff Position",
        "description": "Lead multi-cluster ML platform architecture. Requires 5+ years post-grad industry experience.",
        "overview": "Designed as a deterministic test case demonstrating non-eligibility gate.",
        "required_skills": ["Kubernetes", "Distributed Systems", "C++", "CUDA"],
        "preferred_skills": ["MLOps"],
        "min_cgpa": 9.2,
        "allowed_branches": ["Computer Science"],
        "allowed_years": ["Postgraduate & Alumni Only"],
        "location": "Seattle, WA",
        "workplace_type": "On-site",
        "stipend_type": "Annual",
        "stipend_amount": 120000,
        "duration": "Permanent",
        "deadline": "In 30 days",
        "deadline_days": 30,
        "deadline_status": "OPEN",
        "application_url": "https://deeptech.example/staff",
        "source": "External Board",
        "verified": False,
        "trust_score": 75
    },
    {
        "id": "opp-18",
        "title": "Summer AI Fellowship 2025 (Expired Test)",
        "organization": "Archived Foundation",
        "logo_text": "AF",
        "logo_bg": "bg-tertiary text-on-tertiary",
        "type": "internships",
        "category_label": "Past Internship",
        "description": "Past cycle opportunity used to test deadline engine filtering.",
        "overview": "Demonstrates deadline validation engine filtering expired listings from active matches.",
        "required_skills": ["Python"],
        "preferred_skills": [],
        "min_cgpa": 7.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Remote",
        "workplace_type": "Remote",
        "stipend_type": "Fixed",
        "stipend_amount": 1000,
        "duration": "Completed",
        "deadline": "Expired 60 days ago",
        "deadline_days": -60,
        "deadline_status": "EXPIRED",
        "application_url": "https://archived.example/apply",
        "source": "Aggregator",
        "verified": False,
        "trust_score": 60
    },
    {
        "id": "opp-19",
        "title": "Principal Quantum Systems Architect",
        "organization": "Quantum Labs International",
        "logo_text": "QL",
        "logo_bg": "bg-error-container text-on-error-container",
        "type": "jobs",
        "category_label": "Senior Research Job",
        "description": "Design cryogenic QPU control software. Strictly requires PhD completion and minimum 9.5 CGPA in theoretical physics or advanced computer science.",
        "overview": "Demonstrates deterministic eligibility engine failure for academic qualifications.",
        "required_skills": ["Rust", "C++", "Quantum Computing", "Linear Algebra"],
        "preferred_skills": ["Qiskit", "FPGA"],
        "min_cgpa": 9.5,
        "allowed_branches": ["Quantum Engineering", "Theoretical Physics"],
        "allowed_years": ["PhD Candidates & Post-Docs"],
        "location": "Geneva, Switzerland",
        "workplace_type": "On-site",
        "stipend_type": "Annual Salary",
        "stipend_amount": 14000,
        "duration": "Permanent",
        "deadline": "In 45 days",
        "deadline_days": 45,
        "deadline_status": "OPEN",
        "application_url": "https://quantumlabs.ch/careers/principal-architect",
        "source": "Quantum Labs Direct",
        "verified": True,
        "trust_score": 98
    },
    {
        "id": "opp-20",
        "title": "On-Site Hardware Technician",
        "organization": "Regional Telco Services",
        "logo_text": "RT",
        "logo_bg": "bg-surface-variant text-on-surface-variant",
        "type": "jobs",
        "category_label": "Field Technician",
        "description": "On-site fiber optic cable maintenance and server rack hardware deployment in rural depots.",
        "overview": "Demonstrates weak career preference and remote work mismatch scoring.",
        "required_skills": ["Hardware Troubleshooting", "Cabling"],
        "preferred_skills": ["Linux"],
        "min_cgpa": 6.0,
        "allowed_branches": ["Any"],
        "allowed_years": ["All Academic Years"],
        "location": "Rural North Depot",
        "workplace_type": "On-site",
        "stipend_type": "Monthly",
        "stipend_amount": 1200,
        "duration": "Full-Time",
        "deadline": "In 30 days",
        "deadline_days": 30,
        "deadline_status": "OPEN",
        "application_url": "https://regionaltelco.net/careers/tech-depot",
        "source": "Regional Telco Direct",
        "verified": True,
        "trust_score": 85
    }
]

def seed_database(db: Session):
    """
    Seeds initial canonical skills, skill relationships, sources, courses,
    3 distinct student profiles (AI/ML, Full-Stack, Robotics), and 18+ rich opportunities
    covering all 7 official hackathon problem statement categories.
    """
    # 1. Seed Opportunity Sources
    sources_data = [
        ("src-1", "TechNova Official Careers", "direct", "https://technova.ai/careers", 96),
        ("src-2", "Google University Programs", "partner", "https://careers.google.com/students", 98),
        ("src-3", "Stripe University Talent", "partner", "https://stripe.com/jobs/university", 95),
        ("src-4", "HackerEarth Campus", "campus_portal", "https://hackerearth.com/challenges", 92),
        ("src-5", "AWS Skill Builder", "curated", "https://aws.amazon.com/training", 94),
        ("src-6", "National Science Foundation", "curated", "https://nsf.gov/awards", 99),
        ("src-7", "Coursera DeepLearning.AI", "partner", "https://coursera.org", 95)
    ]
    for sid, sname, stype, surl, strust in sources_data:
        if not db.query(OpportunitySource).filter(OpportunitySource.id == sid).first():
            db.add(OpportunitySource(id=sid, name=sname, source_type=stype, website_url=surl, trust_score=strust))
    db.commit()

    # 2. Seed Courses Catalog
    courses_seed = [
        ("crs-1", "TensorFlow 2.0 Deep Learning & Neural Architectures", "DeepLearning.AI / Coursera", "14 hours", "Intermediate to Advanced", "TensorFlow", "Critical", "https://coursera.org/learn/deep-neural-networks", "Highest Impact for Target Roles"),
        ("crs-2", "Docker & Container Mastery for Machine Learning", "Docker Official / Udemy", "8 hours", "Beginner to Intermediate", "Docker", "Important", "https://docker.com/101-tutorial", "Deployment Readiness"),
        ("crs-3", "AWS Cloud Foundations & SageMaker Pipelines", "AWS Skill Builder", "6 hours", "Intermediate", "Cloud deployment", "Preferred", "https://aws.amazon.com/training", "Cloud Certification Aligned")
    ]
    for cid, ctitle, cprov, cdur, clev, cskill, cpri, curl, cbadge in courses_seed:
        if not db.query(Course).filter(Course.id == cid).first():
            db.add(Course(id=cid, title=ctitle, provider=cprov, duration=cdur, level=clev, resolves_skill=cskill, priority=cpri, url=curl, badge=cbadge))
    db.commit()

    # 3. Seed Recommended Projects Catalog
    proj_seed = [
        ("proj-rec-1", "Production CNN Image Classifier with FastAPI & Docker", "Build an end-to-end computer vision service that accepts image uploads, performs inference using TensorFlow/Keras, and serves predictions via a containerized FastAPI endpoint.", ["TensorFlow", "Computer Vision", "Docker", "FastAPI"], ["TensorFlow", "Docker"], "Intermediate", 18, "+14% readiness for AI/ML roles"),
        ("proj-rec-2", "Edge AI Inference Pipeline with TensorRT", "Quantize and optimize deep neural networks for edge computing platforms with ONNX runtime.", ["TensorFlow", "PyTorch", "C++", "Edge AI"], ["TensorFlow"], "Advanced", 24, "+10% readiness for Research roles"),
        ("proj-rec-3", "Cloud-Native Model Monitoring Dashboard", "Deploy automated drift detection and latency monitoring for live ML models using Docker and AWS ECS.", ["Docker", "Cloud deployment", "Python", "Monitoring"], ["Docker", "Cloud deployment"], "Intermediate", 12, "+8% readiness for MLOps roles")
    ]
    for pid, ptitle, pdesc, pskills, pgaps, pdiff, phours, pimp in proj_seed:
        if not db.query(RecommendedProject).filter(RecommendedProject.id == pid).first():
            db.add(RecommendedProject(id=pid, title=ptitle, description=pdesc, skills_covered=pskills, resolves_gaps=pgaps, difficulty=pdiff, estimated_hours=phours, impact=pimp))
    db.commit()

    # 4. Seed Canonical Skills & Relationships
    for alias, canonical in list(SKILL_ALIASES.items())[:30]:
        if not db.query(SkillAlias).filter(SkillAlias.alias_name == alias).first():
            db.add(SkillAlias(alias_name=alias, canonical_name=canonical))
    
    skill_relations = [
        ("Python", "Machine Learning", "prerequisite", 0.90),
        ("Machine Learning", "PyTorch", "prerequisite", 0.85),
        ("PyTorch", "Computer Vision", "subskill", 0.80),
        ("Docker", "Kubernetes", "prerequisite", 0.88),
        ("React", "Next.js", "prerequisite", 0.92)
    ]
    for src, tgt, rel_type, sim in skill_relations:
        if not db.query(SkillRelationship).filter(SkillRelationship.source_skill == src, SkillRelationship.target_skill == tgt).first():
            db.add(SkillRelationship(source_skill=src, target_skill=tgt, relationship_type=rel_type, similarity_score=sim))
    db.commit()

    # 5. STUDENT 1: Deepraj Roy (Primary Demo Student - AI/ML Focus)
    u1 = db.query(User).filter(User.email == "deepraj.roy@university.edu").first()
    if not u1:
        u1 = User(
            id="student-1",
            email="deepraj.roy@university.edu",
            hashed_password=get_password_hash("SkillMatch2026!"),
            full_name="Deepraj Roy",
            role="student",
            auth_provider="local",
            is_active=True
        )
        db.add(u1)
        db.flush()

        p1 = Profile(
            id="profile-1",
            user_id=u1.id,
            title="Undergraduate CS Student & Aspiring AI Engineer",
            avatar_url=None,
            initials="DR",
            phone="+91 98765 43210",
            college="University Institute of Technology",
            degree="B.Tech Computer Science & Engineering",
            branch="Computer Science & Engineering",
            academic_year="3rd Year (Junior)",
            year_number=3,
            cgpa=8.8,
            graduation_year=2026,
            bio="Building applied computer vision and NLP models. Passionate about machine learning pipelines and real-world intelligence.",
            location="Bangalore, India",
            workplace_preference="Hybrid",
            career_goals=["AI/ML Internship", "Data Science", "Computer Vision"],
            target_role="AI/ML Engineer",
            preferred_opportunity_types=["internships", "hackathons", "projects", "courses"],
            preferred_locations=["Bangalore", "Remote", "Hybrid"],
            readiness_score=86
        )
        db.add(p1)

        # Educations
        db.add(Education(
            user_id=u1.id,
            institution="University Institute of Technology",
            degree="B.Tech Computer Science & Engineering",
            branch="Computer Science & Engineering",
            start_year=2022,
            end_year=2026,
            cgpa=8.8,
            is_current=True
        ))
        db.add(Education(
            user_id=u1.id,
            institution="Delhi Public School",
            degree="Higher Secondary Certificate (Class XII)",
            branch="Science (Physics, Chemistry, Mathematics, CS)",
            start_year=2020,
            end_year=2022,
            cgpa=9.4,
            is_current=False
        ))

        # Student Skills & Evidence
        deepraj_skills = [
            ("Python", "Languages", "Advanced", 91, "demonstrated", "Fresh", "3 Projects, 1 Cert"),
            ("Machine Learning", "AI/Data", "Intermediate", 84, "demonstrated", "Fresh", "2 Projects, Coursework"),
            ("PyTorch", "AI/Data", "Intermediate", 82, "demonstrated", "Fresh", "Active GitHub Repo"),
            ("React", "Frontend", "Intermediate", 78, "demonstrated", "Fresh", "SkillMatch Frontend"),
            ("FastAPI", "Backend", "Intermediate", 75, "demonstrated", "Fresh", "REST API Backend"),
            ("Docker", "DevOps", "Beginner", 52, "claimed", "Aging", "Local test containers"),
            ("Cloud deployment", "Cloud", "Beginner", 48, "claimed", "Needs validation", "AWS EC2 basics"),
            ("Computer Vision", "AI/Data", "Intermediate", 79, "demonstrated", "Fresh", "MobileNet Project")
        ]
        for name, cat, prof, conf, ev, fresh, notes in deepraj_skills:
            sk = StudentSkill(
                user_id=u1.id,
                skill_name=name,
                category=cat,
                proficiency=prof,
                confidence=conf,
                evidence_type=ev,
                freshness=fresh,
                last_demonstrated="Recently",
                evidence_details={"notes": notes}
            )
            db.add(sk)
            db.flush()
            if ev == "demonstrated":
                db.add(SkillEvidence(
                    student_skill_id=sk.id,
                    evidence_type="project",
                    title=f"Hands-on implementation of {name}",
                    description=f"Verified through GitHub commit telemetry in primary repository.",
                    url="https://github.com/deepraj/edge-vision",
                    verification_status="verified"
                ))

        # Projects
        db.add(Project(
            user_id=u1.id,
            title="Autonomous Edge Vision Classifier",
            description="Built lightweight MobileNetV3 model trained on 50k images achieving 93.4% top-1 accuracy on edge hardware.",
            skills=["Python", "PyTorch", "Computer Vision", "Docker"],
            repo_url="https://github.com/deepraj/edge-vision",
            live_url="https://edge-vision-demo.app"
        ))
        db.add(Project(
            user_id=u1.id,
            title="Intelligent Resume ATS Matcher",
            description="Engineered semantic search engine with FastAPI and pgvector embeddings calculating cosine relevance scores.",
            skills=["Python", "FastAPI", "PostgreSQL", "React"],
            repo_url="https://github.com/deepraj/resume-matcher"
        ))

        # Experience
        db.add(Experience(
            user_id=u1.id,
            title="Machine Learning Research Intern",
            company="Vision AI Laboratories",
            duration="May 2025 - Jul 2025",
            description="Trained spatial convolution networks for real-time video feeds with CUDA acceleration.",
            technologies=["Python", "PyTorch", "OpenCV", "CUDA"]
        ))

        # Certification
        db.add(Certification(
            user_id=u1.id,
            name="Deep Learning Specialization",
            issuer="DeepLearning.AI / Coursera",
            issue_date="Nov 2025",
            credential_url="https://coursera.org/verify/DL-2025"
        ))

        # Roadmap Goal and Discrete Roadmap Items
        rg = RoadmapGoal(
            user_id=u1.id,
            title="Become internship-ready for AI/ML roles in 10 weeks",
            badge="AI Career Agent Active",
            description="Personalized curriculum dynamically updated based on your verified skills and opportunity requirements.",
            current_week=7,
            total_weeks=10,
            overall_progress=70,
            weeks_data=DEFAULT_ROADMAP_WEEKS
        )
        db.add(rg)
        db.flush()

        for w in DEFAULT_ROADMAP_WEEKS:
            db.add(RoadmapItem(
                roadmap_id=rg.id,
                week_number=w["week"],
                title=w["title"],
                focus=w.get("focus", ""),
                estimated_hours=w.get("hours", 12),
                is_completed=w.get("completed", False),
                checklist_data=w.get("checklist", [])
            ))

        # Applications and Events
        app1 = Application(
            id="app-1",
            user_id=u1.id,
            opportunity_id="opp-1",
            status="applied",
            stage="applied",
            applied_date="Yesterday",
            last_updated="2 hours ago",
            next_action="Hiring team reviewing portfolio",
            fit_score=87,
            trust_score=96
        )
        db.add(app1)
        db.flush()
        db.add(ApplicationEvent(
            application_id=app1.id,
            from_stage=None,
            to_stage="applied",
            event_type="created",
            notes="Application submitted via SkillMatch platform."
        ))

        app2 = Application(
            id="app-2",
            user_id=u1.id,
            opportunity_id="opp-2",
            status="interview",
            stage="interview",
            applied_date="4 days ago",
            last_updated="Yesterday",
            next_action="Technical round scheduled for Friday",
            fit_score=94,
            trust_score=98
        )
        db.add(app2)
        db.flush()
        db.add(ApplicationEvent(
            application_id=app2.id,
            from_stage="applied",
            to_stage="interview",
            event_type="stage_transition",
            notes="Invited to Vertex AI scientist technical interview."
        ))

        db.add(SavedOpportunity(user_id=u1.id, opportunity_id="opp-3"))
        db.add(SavedOpportunity(user_id=u1.id, opportunity_id="opp-5"))

    # 6. STUDENT 2: Aanya Sharma (2nd Year - Full-Stack Cloud Focus)
    u2 = db.query(User).filter(User.email == "aanya.sharma@university.edu").first()
    if not u2:
        u2 = User(
            id="student-2",
            email="aanya.sharma@university.edu",
            hashed_password=get_password_hash("SkillMatch2026!"),
            full_name="Aanya Sharma",
            role="student",
            auth_provider="local",
            is_active=True
        )
        db.add(u2)
        db.flush()

        db.add(Profile(
            id="profile-2",
            user_id=u2.id,
            title="Sophomore Developer & Open Source Contributor",
            avatar_url=None,
            initials="AS",
            phone="+91 91234 56789",
            college="National Institute of Technology",
            degree="B.Tech Information Technology",
            branch="Information Technology",
            academic_year="2nd Year Students",
            year_number=2,
            cgpa=7.6,
            graduation_year=2027,
            bio="Passionate full stack developer building cloud microservices and reactive interfaces.",
            location="Pune, India",
            workplace_preference="Remote",
            career_goals=["Full Stack Fellowship", "Cloud Engineering"],
            target_role="Full Stack Developer",
            preferred_opportunity_types=["internships", "hackathons", "projects"],
            preferred_locations=["Remote", "Pune"],
            readiness_score=74
        ))
        db.add(Education(
            user_id=u2.id,
            institution="National Institute of Technology",
            degree="B.Tech Information Technology",
            branch="Information Technology",
            start_year=2023,
            end_year=2027,
            cgpa=7.6,
            is_current=True
        ))
        for sk_name, sk_cat, sk_prof, sk_conf in [
            ("React", "Frontend", "Advanced", 88),
            ("JavaScript", "Languages", "Advanced", 90),
            ("TypeScript", "Languages", "Intermediate", 75),
            ("Node.js", "Backend", "Intermediate", 78),
            ("Docker", "DevOps", "Beginner", 55),
            ("MongoDB", "Databases", "Intermediate", 72)
        ]:
            db.add(StudentSkill(
                user_id=u2.id,
                skill_name=sk_name,
                category=sk_cat,
                proficiency=sk_prof,
                confidence=sk_conf,
                evidence_type="demonstrated",
                freshness="Fresh",
                last_demonstrated="Recently"
            ))

    # 7. STUDENT 3: Rohan Verma (Final Year - Embedded AI & Robotics Focus)
    u3 = db.query(User).filter(User.email == "rohan.verma@university.edu").first()
    if not u3:
        u3 = User(
            id="student-3",
            email="rohan.verma@university.edu",
            hashed_password=get_password_hash("SkillMatch2026!"),
            full_name="Rohan Verma",
            role="student",
            auth_provider="local",
            is_active=True
        )
        db.add(u3)
        db.flush()

        db.add(Profile(
            id="profile-3",
            user_id=u3.id,
            title="Senior Robotics & Edge ML Engineer",
            avatar_url=None,
            initials="RV",
            phone="+91 99887 76655",
            college="Indian Institute of Technology",
            degree="B.Tech Robotics & Automation",
            branch="Robotics Engineering",
            academic_year="Final Year & Graduates",
            year_number=4,
            cgpa=9.2,
            graduation_year=2025,
            bio="Specializing in ROS2 robot controllers, sensor fusion, and on-device neural network acceleration.",
            location="Hyderabad, India",
            workplace_preference="On-site",
            career_goals=["Autonomous Systems Engineer", "Robotics Research"],
            target_role="Robotics Software Engineer",
            preferred_opportunity_types=["jobs", "internships", "projects"],
            preferred_locations=["Hyderabad", "Bangalore"],
            readiness_score=94
        ))
        db.add(Education(
            user_id=u3.id,
            institution="Indian Institute of Technology",
            degree="B.Tech Robotics & Automation",
            branch="Robotics Engineering",
            start_year=2021,
            end_year=2025,
            cgpa=9.2,
            is_current=True
        ))
        for sk_name, sk_cat, sk_prof, sk_conf in [
            ("C++", "Languages", "Advanced", 95),
            ("Python", "Languages", "Advanced", 92),
            ("PyTorch", "AI/Data", "Advanced", 88),
            ("Computer Vision", "AI/Data", "Advanced", 90),
            ("Docker", "DevOps", "Intermediate", 75),
            ("Linux", "Tools", "Advanced", 92)
        ]:
            db.add(StudentSkill(
                user_id=u3.id,
                skill_name=sk_name,
                category=sk_cat,
                proficiency=sk_prof,
                confidence=sk_conf,
                evidence_type="verified",
                freshness="Fresh",
                last_demonstrated="Recently"
            ))

    db.commit()

    # 8. Seed Opportunities with Relational OpportunitySkills and OpportunityEligibility
    for opp_data in OPPORTUNITIES_SEED:
        existing_opp = db.query(Opportunity).filter(Opportunity.id == opp_data["id"]).first()
        if not existing_opp:
            opp = Opportunity(**opp_data)
            db.add(opp)
            db.flush()

            # Add relational skills
            for req_skill in (opp_data.get("required_skills") or []):
                db.add(OpportunitySkill(
                    opportunity_id=opp.id,
                    skill_name=req_skill,
                    is_required=True,
                    min_proficiency="Intermediate",
                    weight=1.0
                ))
            for pref_skill in (opp_data.get("preferred_skills") or []):
                db.add(OpportunitySkill(
                    opportunity_id=opp.id,
                    skill_name=pref_skill,
                    is_required=False,
                    min_proficiency="Beginner",
                    weight=0.5
                ))

            # Add relational eligibility
            if opp_data.get("min_cgpa") and opp_data["min_cgpa"] > 0:
                db.add(OpportunityEligibility(
                    opportunity_id=opp.id,
                    criterion_type="cgpa",
                    operator="gte",
                    criterion_value=str(opp_data["min_cgpa"]),
                    is_strict=True
                ))
            for yr in (opp_data.get("allowed_years") or []):
                db.add(OpportunityEligibility(
                    opportunity_id=opp.id,
                    criterion_type="academic_year",
                    operator="in",
                    criterion_value=yr,
                    is_strict=True
                ))

    db.commit()
