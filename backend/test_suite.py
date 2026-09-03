import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def request(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    body = json.dumps(data).encode("utf-8") if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_tests():
    print("=== SKILLMATCH PHASE 2 API VERIFICATION SUITE ===")
    passed = 0
    total = 0

    # Test 1: Health Check
    total += 1
    st, res = request("/health")
    assert st == 200 and res.get("status") == "healthy", f"Health failed: {res}"
    print("[PASS] 1. Health Check OK")
    passed += 1

    # Test 2: Profile GET
    total += 1
    st, res = request("/profile")
    assert st == 200 and res.get("full_name") == "Deepraj Roy", f"Profile GET failed: {res}"
    print(f"[PASS] 2. Profile GET OK: {res.get('full_name')} ({res.get('target_role')})")
    passed += 1

    # Test 3: Profile PUT Update
    total += 1
    st, res = request("/profile", method="PUT", data={"title": "Lead AI Research Fellow", "cgpa": 8.92})
    assert st == 200 and res.get("title") == "Lead AI Research Fellow" and res.get("cgpa") == 8.92, f"Profile PUT failed: {res}"
    print(f"[PASS] 3. Profile PUT OK: CGPA={res.get('cgpa')}, Title={res.get('title')}")
    passed += 1

    # Test 4: Profile PATCH
    total += 1
    st, res = request("/profile", method="PATCH", data={"workplace_preference": "Hybrid"})
    assert st == 200 and res.get("workplace_preference") == "Hybrid", f"Profile PATCH failed: {res}"
    print(f"[PASS] 4. Profile PATCH OK: workplace_preference={res.get('workplace_preference')}")
    passed += 1

    # Test 5: Validation Error Format
    total += 1
    st, res = request("/profile", method="PUT", data={"cgpa": "not-a-number"})
    assert st == 422 and res.get("success") is False and "VALIDATION_ERROR" in res.get("error", {}).get("code"), f"Validation handling failed: {st}, {res}"
    print(f"[PASS] 5. Consistent Error Handling OK: code={res['error']['code']}, message={res['error']['message']}")
    passed += 1

    # Test 6: Education CRUD
    total += 1
    st, edus = request("/profile/education")
    assert st == 200 and len(edus) >= 1, f"Education listing failed: {edus}"
    print(f"[PASS] 6a. Education Listing OK: {len(edus)} records found")
    
    st, new_edu = request("/profile/education", method="POST", data={
        "institution": "Stanford Online",
        "degree": "Professional Certificate in AI",
        "branch": "Computer Science",
        "start_year": 2024,
        "end_year": 2025,
        "cgpa": 4.0,
        "is_current": False
    })
    assert st == 200 and new_edu.get("institution") == "Stanford Online", f"Education POST failed: {new_edu}"
    edu_id = new_edu["id"]
    print(f"[PASS] 6b. Education Creation OK: id={edu_id}")

    st, _ = request(f"/profile/education/{edu_id}", method="DELETE")
    assert st == 200, f"Education DELETE failed: {st}"
    print(f"[PASS] 6c. Education Deletion OK")
    passed += 1

    # Test 7: Skills CRUD & Evidence
    total += 1
    st, skills = request("/skills/my")
    assert st == 200 and len(skills) >= 5, f"Skills listing failed: {skills}"
    print(f"[PASS] 7a. Skills Listing OK: {len(skills)} skills retrieved")

    st, new_sk = request("/skills/my", method="POST", data={
        "skill_name": "kubernetes",
        "category": "DevOps",
        "proficiency": "Beginner",
        "confidence": 60
    })
    assert st == 200 and new_sk["name"] == "Kubernetes", f"Skill add failed: {new_sk}"
    sk_id = new_sk["id"]
    print(f"[PASS] 7b. Skill Normalization & Creation OK: 'kubernetes' -> canonical '{new_sk['name']}'")

    st, ev_res = request(f"/skills/my/{sk_id}/evidence", method="POST", data={
        "evidence_type": "project",
        "title": "Local MiniKube Cluster Deployment",
        "description": "Configured multi-pod deployment with ingress controller",
        "url": "https://github.com/deepraj/k8s-demo"
    })
    assert st == 200 and ev_res.get("status") == "success", f"Skill evidence failed: {ev_res}"
    print(f"[PASS] 7c. Skill Evidence Attachment OK: evidence_id={ev_res.get('evidence_id')}")

    request(f"/skills/my/{sk_id}", method="DELETE")
    passed += 1

    # Test 8: Applications Listing & Stage Transition
    total += 1
    st, apps = request("/applications")
    assert st == 200 and len(apps) >= 2, f"Applications listing failed: {apps}"
    print(f"[PASS] 8a. Applications Listing OK: {len(apps)} pipeline applications retrieved")
    first_app = apps[0]
    st, stage_res = request(f"/applications/{first_app['id']}/status", method="PUT", data={"status": "assessment", "notes": "HackerRank link received"})
    assert st == 200 and stage_res["stage"] == "assessment", f"Application stage transition failed: {stage_res}"
    print(f"[PASS] 8b. Application Stage Transition & Event Log OK: stage={stage_res['stage']}")
    passed += 1

    # Test 9: Opportunities Across All 7 Categories
    total += 1
    st, opps = request("/opportunities")
    assert st == 200 and len(opps) >= 15, f"Opportunities listing failed: {len(opps)}"
    categories_found = {o["category"] for o in opps}
    expected_categories = {"internships", "hackathons", "scholarships", "courses", "projects", "jobs", "skill_opportunities"}
    assert expected_categories.issubset(categories_found), f"Missing categories: {expected_categories - categories_found}"
    print(f"[PASS] 9. Opportunities Seed Verified Across All 7 Categories: {sorted(list(categories_found))}")
    passed += 1

    # Test 10: Multi-Student Database Verification
    total += 1
    # Check that database contains all 3 students
    # deepraj.roy@university.edu (student-1), aanya.sharma@university.edu (student-2), rohan.verma@university.edu (student-3)
    from app.database import SessionLocal
    from app.models.entities import User, Course, RecommendedProject
    db = SessionLocal()
    users = db.query(User).all()
    courses = db.query(Course).all()
    rec_projects = db.query(RecommendedProject).all()
    db.close()
    assert len(users) >= 3, f"Expected at least 3 seeded users, found {len(users)}"
    assert len(courses) >= 3, f"Expected seeded courses, found {len(courses)}"
    assert len(rec_projects) >= 3, f"Expected seeded recommended projects, found {len(rec_projects)}"
    print(f"[PASS] 10. Multi-Student & Catalog Seed Verified: {len(users)} users, {len(courses)} courses, {len(rec_projects)} projects in DB")
    passed += 1

    print(f"\n=======================================================")
    print(f"ALL TESTS PASSED: {passed}/{total} checks successful!")
    print(f"=======================================================")

if __name__ == "__main__":
    run_tests()
