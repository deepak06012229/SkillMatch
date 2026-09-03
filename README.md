# 🚀 SkillMatch — Education, Skills & Youth Opportunities

> **“Match students with relevant internships, hackathons, scholarships, courses, projects, jobs and skill opportunities.”**  
> *CampusHub 2026 Problem Statement*

SkillMatch is an end-to-end intelligent platform engineered to connect students with high-value youth opportunities based on verified proof-of-work, canonical skills, and transparent, deterministic eligibility constraints.

---

## 🏛️ Core Architectural Principle

```text
┌──────────────────────────────────────────────────────────┐
│               1. RULES DECIDE ELIGIBILITY                │
│    (Deterministic gate: CGPA, Year, Degree, Deadline)    │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              2. ML / SEMANTIC MODELS RANK                │
│ (TF-IDF Cosine, Skill Match, Projects, Goal Alignment)   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   3. LLM / RULES EXPLAIN                 │
│      (Factual evidence: Why You Match & What's Missing)  │
└──────────────────────────────────────────────────────────┘
```

> **Golden Rule:** Machine learning and generative models are never permitted to override deterministic eligibility requirements (e.g. CGPA minimums, academic disciplines, or expired deadlines).

---

## 🎯 7 Core Opportunity Categories

1. **Internships** (Research Fellowships, Corporate Internships)
2. **Hackathons** (University hackathons, Global builder challenges)
3. **Scholarships** (STEM grants, Merit-based endowments)
4. **Courses** (Accredited technical curricula resolving skill gaps)
5. **Projects** (Proof-of-work guided builder templates)
6. **Jobs** (Early-career roles, Associate software engineers)
7. **Skill Opportunities** (Mentorship circles, Accelerator programs)

---

## ✨ Key Features & Capabilities

### 1. Resume Intelligence & OCR Pipeline
* Multi-format ingestion: **PDF**, **DOCX**, and **Images** (`PNG`, `JPG`, `WEBP`).
* Fallback to OCR when documents are scanned or lack selectable text layers.
* Section-aware extraction: Education, Work Experience, Projects, Skills, and Certifications.
* Human-in-the-loop review: Extracted data is presented for student verification before committing to authoritative database records.
* Evidence categorization: Distinguishes between **Demonstrated** (applied in projects), **Claimed** (listed in resume skills), and **Verified** credentials.

### 2. Opportunity Ingestion, Deduplication & Trust Scoring
* Modular `OpportunitySourceAdapter` framework (Direct Partners, Campus Portals, Curated Directories).
* Deterministic duplicate detection with canonical clustering.
* Freshness validation engine: Automatically invalidates and excludes expired listings.
* Transparent 4-pillar Trust Index: Source Reliability (35%), URL Security (25%), Metadata Completeness (20%), Freshness (20%).

### 3. Deterministic Eligibility & Hybrid Matching Engine
* Hard eligibility validation against explicit constraints (Degree, Discipline, Academic Year, CGPA threshold, Expiration).
* Composite 6-factor Fit Score formula:
  * Skill Fit (35%)
  * Semantic Relevance (20%)
  * Project Relevance (15%)
  * Education Match (10%)
  * Career Goal Alignment (10%)
  * Preference Alignment (10%)
* Separate **Readiness Score** tracking evidence strength, skill proficiency levels, and absence of critical skill gaps.
* Explainable **Why You Match** and **What's Missing** generated from factual database records.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Headless UI components.
* **Backend:** FastAPI, Python 3.14, SQLAlchemy, Pydantic v2, SQLite (relational database).
* **Document Processing & NLP:** PyPDF, python-docx, Pillow (PIL), Scikit-Learn / TF-IDF Vectorization, Regex Tokenizer.

---

## 🚀 Quickstart Guide

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows (or source venv/bin/activate on Unix)

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup
```bash
# In the project root directory
npm install
npm run dev
```
* Web Application: `http://localhost:5173`

---

## 🧪 Testing

SkillMatch includes automated end-to-end verification suites:

```bash
# Backend test suites (run inside backend/ directory with active venv)
python test_suite.py                    # Core Profile, CRUD & Category tests
python test_resume_intelligence.py      # Resume Parsing, OCR & Confirmation flow
python test_phase5_matching.py          # Eligibility, Hybrid Matching & 10 Edge Cases

# Frontend production build verification
npm run build
```

---

## 📄 License
MIT License. Built for CampusHub Hackathon 2026.
