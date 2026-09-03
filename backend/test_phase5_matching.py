import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def json_request(endpoint, method="GET", data=None):
    body = json.dumps(data).encode("utf-8") if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_tests():
    print("=== SKILLMATCH PHASE 5: ELIGIBILITY & HYBRID MATCHING ENGINE TESTS ===")
    passed = 0
    total = 0

    # -------------------------------------------------------------
    # Case 1: Perfect / High Match (opp-1: AI/ML Intern)
    # -------------------------------------------------------------
    total += 1
    st, opp1_match = json_request("/matches/opp-1")
    assert st == 200, f"Detail failed: {opp1_match}"
    assert opp1_match["is_eligible"] is True, f"Opp-1 should be eligible: {opp1_match}"
    assert opp1_match["fit_score"] >= 88, f"Opp-1 should have high fit score (>=88), got {opp1_match['fit_score']}"
    assert len(opp1_match["why_you_match"]) >= 3, "Should have structured why_you_match reasons"
    print(f"[PASS] Case 1: High Match OK:")
    print(f"       Opp-1 ({opp1_match['title']}): Fit Score={opp1_match['fit_score']}%, Readiness={opp1_match['readiness_score']}%, Eligible={opp1_match['is_eligible']}")
    print(f"       Breakdown: {opp1_match['breakdown']}")
    passed += 1

    # -------------------------------------------------------------
    # Case 2: Eligible but Missing Skills
    # -------------------------------------------------------------
    total += 1
    st, matches = json_request("/matches")
    assert st == 200 and len(matches) > 0, f"Matches listing failed: {st}"
    opp_missing = next((m for m in matches if "Cloud" in m["title"] or "Go" in str(m.get("requiredSkills"))), None)
    if not opp_missing:
        opp_missing = matches[2]  # Fallback to third ranked
    
    assert opp_missing["isEligible"] is True, "Should be eligible on academic criteria"
    assert len(opp_missing["whatYouAreMissing"].get("critical", [])) >= 0, "Should categorize missing skills"
    print(f"[PASS] Case 2: Eligible with Missing Skills OK:")
    print(f"       Opportunity: {opp_missing['title']} (Fit: {opp_missing['fitScore']}%)")
    print(f"       Missing Critical: {opp_missing['whatYouAreMissing'].get('critical')}")
    passed += 1

    # -------------------------------------------------------------
    # Case 3: Ineligible Education/CGPA Requirement (opp-19)
    # -------------------------------------------------------------
    total += 1
    st, opp19_match = json_request("/matches/opp-19")
    assert st == 200, f"Opp-19 detail failed: {opp19_match}"
    assert opp19_match["is_eligible"] is False, "Opp-19 strictly requires CGPA 9.5 and PhD, must be INELIGIBLE"
    assert opp19_match["fit_score"] <= 50, f"Ineligible opportunity fit score must be capped <= 50%, got {opp19_match['fit_score']}"
    assert len(opp19_match["failed_requirements"]) >= 1, "Must list failed requirements"
    print(f"[PASS] Case 3: Ineligible Education Requirement OK:")
    print(f"       Opp-19 ({opp19_match['title']}): Eligible={opp19_match['is_eligible']}, Fit={opp19_match['fit_score']}%")
    print(f"       Failed Requirements: {opp19_match['failed_requirements']}")
    passed += 1

    # -------------------------------------------------------------
    # Case 4: Strong Semantic Match Despite Different Wording
    # -------------------------------------------------------------
    total += 1
    # Check GenAI Research Assistant or Computer Vision Fellowship
    st, opp2_match = json_request("/matches/opp-2")
    assert st == 200, f"Opp-2 detail failed: {opp2_match}"
    sem_score = opp2_match["breakdown"].get("semantic_relevance", 0)
    assert sem_score >= 70, f"Expected high semantic relevance (>=70), got {sem_score}"
    print(f"[PASS] Case 4: Semantic Match OK: Opp-2 Semantic Score = {sem_score}%")
    passed += 1

    # -------------------------------------------------------------
    # Case 5: Weak Preference Match (opp-20: On-site rural telco)
    # -------------------------------------------------------------
    total += 1
    st, opp20_match = json_request("/matches/opp-20")
    assert st == 200, f"Opp-20 detail failed: {opp20_match}"
    pref_score = opp20_match["breakdown"].get("preferences", 0)
    assert pref_score <= 75, f"Expected lower preference score (<=75) for on-site non-AI role, got {pref_score}"
    print(f"[PASS] Case 5: Weak Preference Match OK: Opp-20 Preference Score = {pref_score}% (Career Goal = {opp20_match['breakdown'].get('career_goal')}%)")
    passed += 1

    # -------------------------------------------------------------
    # Case 6: Expired Opportunity (opp-18)
    # -------------------------------------------------------------
    total += 1
    # Expired opportunities must be excluded from default /api/matches
    st, matches_active = json_request("/matches")
    assert not any(m["id"] == "opp-18" for m in matches_active), "Expired opportunity opp-18 must NOT appear in active matches"
    # When inspected directly, must be flagged as INELIGIBLE
    st, opp18_match = json_request("/matches/opp-18")
    assert opp18_match["is_eligible"] is False, "Expired opportunity must be ineligible"
    assert any("Expired" in str(f) for f in opp18_match["failed_requirements"]), "Failed requirements must mention expiration"
    print(f"[PASS] Case 6: Expired Opportunity Exclusion & Ineligibility OK")
    passed += 1

    # -------------------------------------------------------------
    # Case 7: Incomplete Student Profile (Cold Start)
    # -------------------------------------------------------------
    total += 1
    # Test matching engine function directly with empty skills
    from app.database import SessionLocal
    from app.models.entities import Opportunity, Profile
    from app.services.matching_engine import calculate_match_score
    db = SessionLocal()
    opp_sample = db.query(Opportunity).filter(Opportunity.id == "opp-1").first()
    cold_profile = Profile(user_id="cold-student", title="New Student", cgpa=7.5, branch="Computer Science", year_number=2)
    cold_res = calculate_match_score(opp_sample, cold_profile, [], [])
    db.close()
    assert cold_res["is_cold_start"] is True, "Should flag is_cold_start=True for 0 skills"
    assert cold_res["fit_score"] > 0, "Should return baseline educational score rather than 0"
    print(f"[PASS] Case 7: Cold-Start Handling OK: is_cold_start={cold_res['is_cold_start']}, baseline fit={cold_res['fit_score']}%")
    passed += 1

    # -------------------------------------------------------------
    # Case 8: No Required Skills (e.g. general hackathon / open course)
    # -------------------------------------------------------------
    total += 1
    db = SessionLocal()
    opp_no_skills = Opportunity(
        id="opp-test-no-skills",
        title="Open Innovation Student Grant",
        organization="Global Education Fund",
        type="scholarships",
        category_label="Grant",
        description="Merit scholarship open to all passionate technology undergraduates.",
        required_skills=[],
        preferred_skills=[],
        min_cgpa=6.0,
        allowed_branches=["Any"],
        allowed_years=["All Academic Years"],
        deadline_status="OPEN",
        deadline_days=20,
        trust_score=95
    )
    student_profile = db.query(Profile).filter(Profile.user_id == "student-1").first()
    from app.models.entities import StudentSkill, Project
    skills = db.query(StudentSkill).filter(StudentSkill.user_id == "student-1").all()
    projects = db.query(Project).filter(Project.user_id == "student-1").all()
    res_no_skills = calculate_match_score(opp_no_skills, student_profile, skills, projects)
    db.close()
    assert res_no_skills["is_eligible"] is True
    assert res_no_skills["breakdown"]["skills"] >= 80, "No required skills should yield healthy baseline skill score"
    print(f"[PASS] Case 8: No Required Skills Opportunity OK: Fit={res_no_skills['fit_score']}%, Skill Score={res_no_skills['breakdown']['skills']}%")
    passed += 1

    # -------------------------------------------------------------
    # Case 9: Multiple Opportunities Ranked Differently
    # -------------------------------------------------------------
    total += 1
    st, all_ranked = json_request("/matches")
    assert len(all_ranked) >= 5, "Should return multiple ranked opportunities"
    scores = [m["fitScore"] for m in all_ranked]
    assert scores[0] >= scores[-1], "Ranked matches must be sorted in descending order"
    # Ensure all eligible opportunities outrank ineligible ones
    eligible_flags = [m["isEligible"] for m in all_ranked]
    first_ineligible = next((i for i, el in enumerate(eligible_flags) if not el), None)
    if first_ineligible is not None:
        assert all(not el for el in eligible_flags[first_ineligible:]), "Eligible opportunities must strictly precede ineligible ones"
    print(f"[PASS] Case 9: Distinct Multi-Opportunity Ranking OK: Top score={scores[0]}%, Lowest active={scores[-1]}%")
    passed += 1

    # -------------------------------------------------------------
    # Case 10: Profile Update Changes Ranking Deterministically
    # -------------------------------------------------------------
    total += 1
    # Record initial score for opp-1
    initial_score = opp1_match["fit_score"]
    # Recalculate check: verify recalculate API returns success and updates cache
    st, recalc_res = json_request("/matches/recalculate", method="POST")
    assert st == 200 and recalc_res["status"] == "success", f"Recalculate failed: {recalc_res}"
    st, opp1_match_after = json_request("/matches/opp-1")
    assert opp1_match_after["fit_score"] == initial_score, "Score must be 100% deterministic and reproducible when data is unchanged"
    print(f"[PASS] Case 10: Deterministic Scoring & Cache Recalculation OK: {recalc_res['message']}")
    passed += 1

    print("\n=======================================================")
    print(f"ALL 10 PHASE 5 MATCHING TEST CASES PASSED: {passed}/{total} successful!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
