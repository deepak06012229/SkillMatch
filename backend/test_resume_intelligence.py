import io
import json
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image, ImageDraw

BASE_URL = "http://127.0.0.1:8000/api"

def upload_file_multipart(endpoint, filename, file_bytes, content_type="application/octet-stream"):
    boundary = "----WebKitFormBoundarySkillMatch2026Test"
    body = io.BytesIO()
    body.write(f"--{boundary}\r\n".encode("utf-8"))
    body.write(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode("utf-8"))
    body.write(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
    body.write(file_bytes)
    body.write(f"\r\n--{boundary}--\r\n".encode("utf-8"))
    payload = body.getvalue()

    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=payload,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def json_request(endpoint, method="GET", data=None):
    body = json.dumps(data).encode("utf-8") if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def create_sample_docx(text_content):
    import docx
    doc = docx.Document()
    for line in text_content.splitlines():
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

def create_sample_image():
    img = Image.new('RGB', (400, 200), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 30), "DEEPRAJ ROY - AI/ML ENGINEER", fill=(0, 0, 0))
    d.text((20, 60), "Skills: Python, PyTorch, FastAPI, React", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

def run_resume_tests():
    print("=== SKILLMATCH PHASE 3: RESUME INTELLIGENCE & OCR TEST SUITE ===")
    passed = 0
    total = 0

    sample_resume_text = """
DEEPRAJ ROY
Email: deepraj.roy@university.edu | Phone: +91 98765 43210 | Bangalore, India
GitHub: https://github.com/deepraj/edge-vision | LinkedIn: https://linkedin.com/in/deepraj-roy

EDUCATION
University Institute of Technology, Bangalore
Bachelor of Technology in Computer Science & Engineering | CGPA: 8.9 / 10 | 2022 - 2026

TECHNICAL SKILLS
Languages: Python, JavaScript, C++, SQL
AI & Data: Machine Learning, Deep Learning, PyTorch, Natural Language Processing, Computer Vision
Frameworks & Tools: FastAPI, React, Docker, Git

PROJECTS
Autonomous Edge Vision Classifier
- Implemented MobileNetV3 model in PyTorch trained on 50k images achieving 93.4% accuracy.
- Containerized inference endpoint using Docker and deployed FastAPI microservice.
- Technologies: Python, PyTorch, Computer Vision, Docker, FastAPI

Intelligent Resume ATS Matcher
- Developed semantic matching search engine calculating cosine relevance with PostgreSQL.
- Technologies: Python, FastAPI, React, SQL

WORK EXPERIENCE
Vision AI Laboratories - Computer Vision Research Intern
- Optimized deep learning convolutional networks for edge hardware inference.
- Technologies: Python, PyTorch, OpenCV

CERTIFICATIONS
- Deep Learning Specialization (Coursera / DeepLearning.AI)
- AWS Certified Cloud Practitioner
"""

    # Test 1: DOCX Resume Ingestion & Parsing
    total += 1
    docx_bytes = create_sample_docx(sample_resume_text)
    st, res = upload_file_multipart("/resume/upload", "Deepraj_Roy_Resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    assert st == 200 and res.get("status") == "extracted", f"Upload failed: {st}, {res}"
    resume_id = res["resume_id"]
    ext_data = res["extracted_data"]

    # Verify structured fields
    assert ext_data["contact"]["email"] == "deepraj.roy@university.edu"
    assert "8.9" in str(ext_data["education"]["cgpa"])
    assert "Computer Science" in ext_data["education"]["degree"]
    assert len(ext_data["skills"]) >= 6
    assert len(ext_data["projects"]) >= 2
    
    # Verify Evidence distinction
    python_skill = next((s for s in ext_data["skills"] if s["canonical"] == "Python"), None)
    assert python_skill is not None and python_skill["evidence_type"] == "demonstrated", f"Python should be demonstrated: {python_skill}"
    print(f"[PASS] 1. DOCX Ingestion & Section-Aware Extraction OK:")
    print(f"       Name: {ext_data['contact']['name']}, CGPA: {ext_data['education']['cgpa']}, Sections: {ext_data['sections_detected']}")
    print(f"       Skills Extracted: {len(ext_data['skills'])}, Python Evidence: {python_skill['evidence_type']} ({python_skill['evidence']})")
    passed += 1

    # Test 2: Image Resume Ingestion & OCR
    total += 1
    img_bytes = create_sample_image()
    st, img_res = upload_file_multipart("/resume/upload", "scanned_resume_card.png", img_bytes, "image/png")
    assert st == 200 and img_res.get("status") == "extracted", f"Image upload failed: {st}, {img_res}"
    assert img_res["ocr_used"] is True, "OCR should be flagged as True for image"
    print(f"[PASS] 2. Image Resume OCR Ingestion OK: engine={img_res['ocr_engine']}, ocr_used={img_res['ocr_used']}")
    passed += 1

    # Test 3: Unsupported File Rejection (Safety)
    total += 1
    bad_bytes = b"MALICIOUS_EXE_CONTENT"
    st, bad_res = upload_file_multipart("/resume/upload", "resume_payload.exe", bad_bytes, "application/x-msdownload")
    assert st == 400 and "UNSUPPORTED_FILE_FORMAT" in str(bad_res), f"Should reject unsupported format: {st}, {bad_res}"
    print(f"[PASS] 3. Safety Check OK: Rejected unsupported format (.exe) with code={bad_res['error']['code']}")
    passed += 1

    # Test 4: Resume Listing & Single Detail Retrieval
    total += 1
    st, resume_list = json_request("/resume")
    assert st == 200 and len(resume_list) >= 2, f"Listing failed: {resume_list}"
    st, resume_detail = json_request(f"/resume/{resume_id}")
    assert st == 200 and resume_detail["filename"] == "Deepraj_Roy_Resume.docx", f"Detail failed: {resume_detail}"
    print(f"[PASS] 4. Resume Listing & Detail API OK: {len(resume_list)} resumes listed, Detail retrieved for {resume_id}")
    passed += 1

    # Test 5: Student Confirmation Workflow
    total += 1
    # Student edits/confirms extracted details (e.g. confirms 6 skills, edits CGPA to 8.95)
    confirm_payload = {
        "name": "Deepraj Roy",
        "college": "University Institute of Technology",
        "degree": "B.Tech Computer Science & Engineering",
        "branch": "Computer Science & Engineering",
        "cgpa": 8.95,
        "phone": "+91 98765 43210",
        "skills": ["Python", "PyTorch", "FastAPI", "React", "Docker", "Machine Learning"],
        "projects": [
            {
                "title": "Autonomous Edge Vision Classifier",
                "description": "MobileNetV3 on edge hardware with 93.4% accuracy",
                "skills": ["Python", "PyTorch", "Docker", "FastAPI"],
                "repo_url": "https://github.com/deepraj/edge-vision"
            }
        ],
        "certifications": ["Deep Learning Specialization (Coursera)"]
    }
    st, confirm_res = json_request(f"/resume/{resume_id}/confirm", method="POST", data=confirm_payload)
    assert st == 200 and confirm_res["status"] == "confirmed", f"Confirmation failed: {confirm_res}"

    # Verify that authoritative database records were updated
    from app.database import SessionLocal
    from app.models.entities import Resume, Profile, StudentSkill, SkillEvidence, Project
    db = SessionLocal()
    r_db = db.query(Resume).filter(Resume.id == resume_id).first()
    p_db = db.query(Profile).filter(Profile.user_id == "student-1").first()
    sk_db = db.query(StudentSkill).filter(StudentSkill.user_id == "student-1", StudentSkill.skill_name == "PyTorch").first()
    ev_db = db.query(SkillEvidence).filter(SkillEvidence.student_skill_id == sk_db.id).first() if sk_db else None
    db.close()

    assert r_db.is_confirmed is True, "Resume should be marked confirmed in DB"
    assert abs(p_db.cgpa - 8.95) < 0.01, f"Profile CGPA should be updated to 8.95, found {p_db.cgpa}"
    assert sk_db is not None and sk_db.evidence_type == "demonstrated", "PyTorch should be demonstrated"
    assert ev_db is not None, "SkillEvidence should be attached to confirmed skill"

    print(f"[PASS] 5. Student Confirmation Flow OK:")
    print(f"       Resume is_confirmed={r_db.is_confirmed}, Confirmed at: {r_db.confirmed_at}")
    print(f"       Authoritative Profile CGPA={p_db.cgpa}, Readiness Score={p_db.readiness_score}%")
    print(f"       Skill '{sk_db.skill_name}' Evidence: {sk_db.evidence_type} (Attached Evidence ID: {ev_db.id})")
    passed += 1

    print("\n=======================================================")
    print(f"ALL RESUME INTELLIGENCE TESTS PASSED: {passed}/{total} successful!")
    print("=======================================================")

if __name__ == "__main__":
    run_resume_tests()
