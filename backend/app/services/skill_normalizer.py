import re
from typing import Dict, Optional, Tuple

SKILL_ALIASES: Dict[str, str] = {
    # Python ecosystem
    "python": "Python",
    "python 3": "Python",
    "python3": "Python",
    "python programming": "Python",
    "py": "Python",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "keras": "Keras",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",

    # JavaScript / Web
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",

    # Data / AI
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "natural language processing": "Natural Language Processing",
    "nlp": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "generative ai": "Generative AI",
    "genai": "Generative AI",
    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",

    # Cloud & DevOps
    "docker": "Docker",
    "containerization": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "google cloud": "Google Cloud",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "ci/cd": "CI/CD",
    "git": "Git",
    "github": "GitHub",

    # Systems & Languages
    "c++": "C++",
    "cpp": "C++",
    "c": "C",
    "c#": "C#",
    "java": "Java",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis"
}

SKILL_CATEGORIES: Dict[str, str] = {
    "Python": "Languages",
    "JavaScript": "Languages",
    "TypeScript": "Languages",
    "C++": "Languages",
    "Java": "Languages",
    "Go": "Languages",
    "Rust": "Languages",
    "SQL": "Databases",
    "PostgreSQL": "Databases",
    "MongoDB": "Databases",
    "Redis": "Databases",
    "React": "Frontend",
    "Next.js": "Frontend",
    "Tailwind CSS": "Frontend",
    "HTML5": "Frontend",
    "CSS3": "Frontend",
    "Node.js": "Backend",
    "FastAPI": "Backend",
    "Flask": "Backend",
    "Django": "Backend",
    "Machine Learning": "AI/Data",
    "Deep Learning": "AI/Data",
    "PyTorch": "AI/Data",
    "TensorFlow": "AI/Data",
    "Computer Vision": "AI/Data",
    "Natural Language Processing": "AI/Data",
    "Generative AI": "AI/Data",
    "LLMs": "AI/Data",
    "Docker": "DevOps",
    "Kubernetes": "DevOps",
    "AWS": "Cloud",
    "Google Cloud": "Cloud",
    "Azure": "Cloud",
    "Git": "Tools"
}

def normalize_skill(skill_str: str) -> Tuple[str, str]:
    """
    Normalizes any input skill alias into its canonical name and category.
    Example: 'react.js' -> ('React', 'Frontend')
    """
    if not skill_str:
        return ("Unknown", "General")

    cleaned = re.sub(r'[\(\)\[\]\{\}]', '', skill_str).strip().lower()
    canonical = SKILL_ALIASES.get(cleaned)
    if not canonical:
        # Check title case or partial match
        for alias, cano in SKILL_ALIASES.items():
            if alias == cleaned:
                canonical = cano
                break
        if not canonical:
            canonical = skill_str.strip().title()

    category = SKILL_CATEGORIES.get(canonical, "Technical")
    return (canonical, category)
